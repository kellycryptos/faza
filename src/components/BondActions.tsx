"use client";

import { useState } from "react";
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { erc20Abi } from "viem";
import { activeChain, ARC_USDC_ADDRESS, formatUsdc, explorerTx } from "@/lib/arc";
import { FAZABOND_ABI, FAZABOND_ADDRESS } from "@/lib/contract";
import type { BondSummary } from "./BondCard";

interface Props {
  bond: BondSummary;
  onRefresh: () => void;
}

type ActionStep = "idle" | "approving" | "approve-wait" | "submitting" | "tx-wait" | "done" | "error";

function TxButton({
  label,
  busyLabel,
  disabled,
  isBusy,
  onClick,
  variant = "primary",
}: {
  label: string;
  busyLabel: string;
  disabled?: boolean;
  isBusy: boolean;
  onClick: () => void;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isBusy}
      style={{
        background:
          isBusy || disabled
            ? "var(--surface-muted)"
            : variant === "primary"
            ? "var(--accent)"
            : "var(--surface)",
        color:
          isBusy || disabled
            ? "var(--subtle)"
            : variant === "primary"
            ? "#0d1b2f"
            : "var(--ink-2)",
        border: variant === "ghost" ? "1px solid var(--border)" : "none",
        borderRadius: 10,
        padding: "0.65rem 1.1rem",
        fontSize: "0.9rem",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700,
        cursor: isBusy || disabled ? "not-allowed" : "pointer",
        minHeight: 44,
        transition: "background 0.15s",
      }}
    >
      {isBusy ? busyLabel : label}
    </button>
  );
}

export function BondActions({ bond, onRefresh }: Props) {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const wrongChain = !!address && chainId !== activeChain.id;

  const now = Math.floor(Date.now() / 1000);
  const hasJoiner = bond.joiner && bond.joiner !== "0x0000000000000000000000000000000000000000";
  const isCreator = address && address.toLowerCase() === bond.creator.toLowerCase();
  const isJoiner = address && hasJoiner && address.toLowerCase() === bond.joiner.toLowerCase();
  const isParty = isCreator || isJoiner;

  const [joinStep, setJoinStep] = useState<ActionStep>("idle");
  const [checkInStep, setCheckInStep] = useState<ActionStep>("idle");
  const [settleStep, setSettleStep] = useState<ActionStep>("idle");
  const [cancelStep, setCancelStep] = useState<ActionStep>("idle");
  const [claimStep, setClaimStep] = useState<ActionStep>("idle");
  const [lastTx, setLastTx] = useState<`0x${string}` | undefined>();
  const [errorMsg, setErrorMsg] = useState("");

  // Live claimable balance for connected wallet
  const { data: claimableAmt, refetch: refetchClaimable } = useReadContract({
    address: FAZABOND_ADDRESS || undefined,
    abi: FAZABOND_ABI,
    functionName: "claimable",
    args: address ? [address] : undefined,
    chainId: activeChain.id,
    query: { enabled: !!address && !!FAZABOND_ADDRESS },
  });

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { isLoading: approveWaiting, isSuccess: approveOk } =
    useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: write, data: txHash } = useWriteContract();
  const { isLoading: txWaiting, isSuccess: txOk } =
    useWaitForTransactionReceipt({ hash: txHash });

  // Approve→join flow
  if (approveOk && joinStep === "approve-wait") setJoinStep("submitting");
  if (joinStep === "submitting" && FAZABOND_ADDRESS) {
    setJoinStep("tx-wait");
    write(
      { address: FAZABOND_ADDRESS, abi: FAZABOND_ABI, functionName: "join", args: [BigInt(bond.id)], chainId: activeChain.id },
      {
        onSuccess: () => { setLastTx(txHash); },
        onError: (e) => {
          const msg = e?.message?.toLowerCase() ?? "";
          if (!msg.includes("user rejected") && !msg.includes("denied")) setErrorMsg("Join failed.");
          setJoinStep("error");
        },
      }
    );
  }

  if (txOk && joinStep === "tx-wait") {
    setLastTx(txHash);
    setJoinStep("done");
    onRefresh();
    refetchClaimable();
  }
  if (txOk && checkInStep === "tx-wait") { setLastTx(txHash); setCheckInStep("done"); onRefresh(); }
  if (txOk && settleStep === "tx-wait") { setLastTx(txHash); setSettleStep("done"); onRefresh(); refetchClaimable(); }
  if (txOk && cancelStep === "tx-wait") { setLastTx(txHash); setCancelStep("done"); onRefresh(); refetchClaimable(); }
  if (txOk && claimStep === "tx-wait") { setLastTx(txHash); setClaimStep("done"); refetchClaimable(); }

  const handleSwitch = () => switchChain({ chainId: activeChain.id });

  const handleJoin = () => {
    if (!address || !FAZABOND_ADDRESS) return;
    if (wrongChain) { handleSwitch(); return; }
    setErrorMsg("");
    setJoinStep("approving");
    approve(
      { address: ARC_USDC_ADDRESS, abi: erc20Abi, functionName: "approve", args: [FAZABOND_ADDRESS, BigInt(bond.stake)], chainId: activeChain.id },
      {
        onSuccess: () => setJoinStep("approve-wait"),
        onError: (e) => {
          const msg = e?.message?.toLowerCase() ?? "";
          if (!msg.includes("user rejected") && !msg.includes("denied")) setErrorMsg("Approval failed.");
          setJoinStep("error");
        },
      }
    );
  };

  const handleCheckIn = () => {
    if (!address || !FAZABOND_ADDRESS) return;
    if (wrongChain) { handleSwitch(); return; }
    setErrorMsg("");
    setCheckInStep("submitting");
    write(
      { address: FAZABOND_ADDRESS, abi: FAZABOND_ABI, functionName: "checkIn", args: [BigInt(bond.id)], chainId: activeChain.id },
      {
        onSuccess: () => setCheckInStep("tx-wait"),
        onError: (e) => {
          const msg = e?.message?.toLowerCase() ?? "";
          if (!msg.includes("user rejected") && !msg.includes("denied")) setErrorMsg("Check-in failed.");
          setCheckInStep("error");
        },
      }
    );
  };

  const handleSettle = () => {
    if (!address || !FAZABOND_ADDRESS) return;
    if (wrongChain) { handleSwitch(); return; }
    setErrorMsg("");
    setSettleStep("submitting");
    write(
      { address: FAZABOND_ADDRESS, abi: FAZABOND_ABI, functionName: "settle", args: [BigInt(bond.id)], chainId: activeChain.id },
      {
        onSuccess: () => setSettleStep("tx-wait"),
        onError: (e) => {
          const msg = e?.message?.toLowerCase() ?? "";
          if (!msg.includes("user rejected") && !msg.includes("denied")) setErrorMsg("Settle failed.");
          setSettleStep("error");
        },
      }
    );
  };

  const handleCancel = () => {
    if (!address || !FAZABOND_ADDRESS) return;
    if (wrongChain) { handleSwitch(); return; }
    setErrorMsg("");
    setCancelStep("submitting");
    write(
      { address: FAZABOND_ADDRESS, abi: FAZABOND_ABI, functionName: "cancel", args: [BigInt(bond.id)], chainId: activeChain.id },
      {
        onSuccess: () => setCancelStep("tx-wait"),
        onError: (e) => {
          const msg = e?.message?.toLowerCase() ?? "";
          if (!msg.includes("user rejected") && !msg.includes("denied")) setErrorMsg("Cancel failed.");
          setCancelStep("error");
        },
      }
    );
  };

  const handleClaim = () => {
    if (!address || !FAZABOND_ADDRESS) return;
    if (wrongChain) { handleSwitch(); return; }
    setErrorMsg("");
    setClaimStep("submitting");
    write(
      { address: FAZABOND_ADDRESS, abi: FAZABOND_ABI, functionName: "claim", chainId: activeChain.id },
      {
        onSuccess: () => setClaimStep("tx-wait"),
        onError: (e) => {
          const msg = e?.message?.toLowerCase() ?? "";
          if (!msg.includes("user rejected") && !msg.includes("denied")) setErrorMsg("Claim failed.");
          setClaimStep("error");
        },
      }
    );
  };

  const anyBusy = ["approving","approve-wait","submitting","tx-wait"].some(
    s => s === joinStep || s === checkInStep || s === settleStep || s === cancelStep || s === claimStep
  ) || approveWaiting || txWaiting;

  const canJoinNow = !hasJoiner && now < bond.deadline && !bond.settled && address && !isCreator;
  const canCheckInNow = hasJoiner && now < bond.deadline && !bond.settled && isParty &&
    !(isCreator && bond.creatorIn) && !(isJoiner && bond.joinerIn);
  const canSettleNow = hasJoiner && now >= bond.deadline && !bond.settled;
  const canCancelNow = !hasJoiner && now >= bond.deadline && !bond.settled && isCreator;
  const hasClaim = claimableAmt && claimableAmt > 0n;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Claimable balance */}
      {hasClaim && (
        <div
          style={{
            background: "rgba(141,216,159,0.1)",
            border: "1px solid var(--success)",
            borderRadius: 10,
            padding: "0.9rem 1.1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--success)", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
              Claimable
            </p>
            <p className="tabular" style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
              {formatUsdc(claimableAmt)}
            </p>
          </div>
          <TxButton
            label="Claim USDC"
            busyLabel="Claiming…"
            isBusy={["submitting","tx-wait"].includes(claimStep) || txWaiting}
            disabled={anyBusy && !["submitting","tx-wait"].includes(claimStep)}
            onClick={handleClaim}
          />
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {canJoinNow && (
          <TxButton
            label={`Join — stake ${formatUsdc(bond.stake)}`}
            busyLabel={joinStep === "approving" ? "Confirm approval…" : joinStep === "approve-wait" ? "Approving…" : "Joining…"}
            isBusy={["approving","approve-wait","submitting","tx-wait"].includes(joinStep) || (approveWaiting && joinStep === "approve-wait") || (txWaiting && joinStep === "tx-wait")}
            onClick={handleJoin}
          />
        )}

        {canCheckInNow && (
          <TxButton
            label="Check In"
            busyLabel="Checking in…"
            isBusy={["submitting","tx-wait"].includes(checkInStep) || txWaiting}
            onClick={handleCheckIn}
            variant="ghost"
          />
        )}

        {canSettleNow && (
          <TxButton
            label="Settle"
            busyLabel="Settling…"
            isBusy={["submitting","tx-wait"].includes(settleStep) || txWaiting}
            onClick={handleSettle}
            variant="ghost"
          />
        )}

        {canCancelNow && (
          <TxButton
            label="Cancel (reclaim stake)"
            busyLabel="Cancelling…"
            isBusy={["submitting","tx-wait"].includes(cancelStep) || txWaiting}
            onClick={handleCancel}
            variant="ghost"
          />
        )}
      </div>

      {/* Last tx link */}
      {lastTx && (
        <a
          href={explorerTx(lastTx)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "0.8rem", color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          {lastTx.slice(0, 22)}… (explorer)
        </a>
      )}

      {errorMsg && (
        <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{errorMsg}</p>
      )}

      {!address && (
        <p style={{ color: "var(--subtle)", fontSize: "0.85rem" }}>Connect wallet to interact.</p>
      )}
    </div>
  );
}
