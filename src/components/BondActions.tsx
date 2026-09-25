"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { erc20Abi } from "viem";
import {
  activeChain, ARC_USDC_ADDRESS, formatUsdc,
  getExplorerTx, isSupportedChain,
} from "@/lib/arc";
import { FAZABOND_ABI, FAZABOND_ADDRESS, getFazaBondAddress } from "@/lib/contract";
import type { BondSummary } from "./BondCard";

interface Props {
  bond: BondSummary;
  onRefresh: () => void;
}

type ActionStep = "idle" | "approving" | "approve-wait" | "submitting" | "tx-wait" | "done" | "error";

function TxButton({
  label, busyLabel, disabled, isBusy, onClick, variant = "primary",
}: {
  label: string; busyLabel: string; disabled?: boolean;
  isBusy: boolean; onClick: () => void; variant?: "primary" | "ghost";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isBusy}
      style={{
        background: isBusy || disabled
          ? "var(--surface-muted)"
          : variant === "primary" ? "var(--accent)" : "var(--surface)",
        color: isBusy || disabled
          ? "var(--subtle)"
          : variant === "primary" ? "#050B14" : "var(--ink-2)",
        border: variant === "ghost" ? "1px solid var(--border)" : "none",
        borderRadius: 10, padding: "0.65rem 1.1rem", fontSize: "0.9rem",
        fontFamily: "'Inter', sans-serif", fontWeight: 700,
        cursor: isBusy || disabled ? "not-allowed" : "pointer",
        minHeight: 44, transition: "background 0.15s",
      }}
    >
      {isBusy ? busyLabel : label}
    </button>
  );
}

export function BondActions({ bond, onRefresh }: Props) {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const onArc = isSupportedChain(chainId);
  const contractAddr = getFazaBondAddress(chainId) ?? FAZABOND_ADDRESS;
  const targetChain = onArc ? chainId! : activeChain.id;

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

  const { data: claimableAmt, refetch: refetchClaimable } = useReadContract({
    address: contractAddr || undefined,
    abi: FAZABOND_ABI,
    functionName: "claimable",
    args: address ? [address] : undefined,
    chainId: targetChain,
    query: { enabled: !!address && !!contractAddr },
  });

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { isSuccess: approveOk } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: write, data: txHash } = useWriteContract();
  const { isSuccess: txOk } = useWaitForTransactionReceipt({ hash: txHash });

  // React 19-safe: all step transitions in useEffect
  useEffect(() => {
    if (approveOk && joinStep === "approve-wait") setJoinStep("submitting");
  }, [approveOk, joinStep]);

  useEffect(() => {
    if (joinStep === "submitting" && contractAddr) {
      setJoinStep("tx-wait");
      write(
        { address: contractAddr, abi: FAZABOND_ABI, functionName: "join", args: [BigInt(bond.id)], chainId: targetChain },
        {
          onSuccess: (hash) => setLastTx(hash),
          onError: (e) => {
            const msg = e?.message?.toLowerCase() ?? "";
            if (!msg.includes("user rejected") && !msg.includes("denied")) setErrorMsg("Join failed.");
            setJoinStep("error");
          },
        }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinStep]);

  useEffect(() => {
    if (!txOk) return;
    if (txHash) setLastTx(txHash);
    if (joinStep === "tx-wait") { setJoinStep("done"); onRefresh(); refetchClaimable(); }
    else if (checkInStep === "tx-wait") { setCheckInStep("done"); onRefresh(); }
    else if (settleStep === "tx-wait") { setSettleStep("done"); onRefresh(); refetchClaimable(); }
    else if (cancelStep === "tx-wait") { setCancelStep("done"); onRefresh(); refetchClaimable(); }
    else if (claimStep === "tx-wait") { setClaimStep("done"); refetchClaimable(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txOk]);

  const handleSwitch = () => switchChain({ chainId: activeChain.id });

  const handleJoin = () => {
    if (!address || !contractAddr) return;
    if (!onArc) { handleSwitch(); return; }
    setErrorMsg(""); setJoinStep("approving");
    approve(
      { address: ARC_USDC_ADDRESS, abi: erc20Abi, functionName: "approve", args: [contractAddr, BigInt(bond.stake)], chainId: targetChain },
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
    if (!address || !contractAddr) return;
    if (!onArc) { handleSwitch(); return; }
    setErrorMsg(""); setCheckInStep("submitting");
    write(
      { address: contractAddr, abi: FAZABOND_ABI, functionName: "checkIn", args: [BigInt(bond.id)], chainId: targetChain },
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
    if (!address || !contractAddr) return;
    if (!onArc) { handleSwitch(); return; }
    setErrorMsg(""); setSettleStep("submitting");
    write(
      { address: contractAddr, abi: FAZABOND_ABI, functionName: "settle", args: [BigInt(bond.id)], chainId: targetChain },
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
    if (!address || !contractAddr) return;
    if (!onArc) { handleSwitch(); return; }
    setErrorMsg(""); setCancelStep("submitting");
    write(
      { address: contractAddr, abi: FAZABOND_ABI, functionName: "cancel", args: [BigInt(bond.id)], chainId: targetChain },
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
    if (!address || !contractAddr) return;
    if (!onArc) { handleSwitch(); return; }
    setErrorMsg(""); setClaimStep("submitting");
    write(
      { address: contractAddr, abi: FAZABOND_ABI, functionName: "claim", chainId: targetChain },
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

  const canJoinNow = !hasJoiner && now < bond.deadline && !bond.settled && address && !isCreator;
  const canCheckInNow = hasJoiner && now < bond.deadline && !bond.settled && isParty &&
    !(isCreator && bond.creatorIn) && !(isJoiner && bond.joinerIn);
  const canSettleNow = hasJoiner && now >= bond.deadline && !bond.settled;
  const canCancelNow = !hasJoiner && now >= bond.deadline && !bond.settled && isCreator;
  const hasClaim = claimableAmt && (claimableAmt as bigint) > 0n;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {hasClaim && (
        <div style={{
          background: "rgba(46,230,166,0.07)", border: "1px solid var(--accent)",
          borderRadius: 10, padding: "0.9rem 1.1rem",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
        }}>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
              Claimable
            </p>
            <p className="tabular" style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
              {formatUsdc(claimableAmt as bigint)}
            </p>
          </div>
          <TxButton label="Claim USDC" busyLabel="Claiming…"
            isBusy={["submitting", "tx-wait"].includes(claimStep)}
            onClick={handleClaim} />
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {canJoinNow && (
          <TxButton
            label={`Join — stake ${formatUsdc(bond.stake)}`}
            busyLabel={joinStep === "approving" ? "Confirm approval…" : joinStep === "approve-wait" ? "Approving…" : "Joining…"}
            isBusy={["approving", "approve-wait", "submitting", "tx-wait"].includes(joinStep)}
            onClick={handleJoin}
          />
        )}
        {canCheckInNow && (
          <TxButton label="Check In" busyLabel="Checking in…"
            isBusy={["submitting", "tx-wait"].includes(checkInStep)}
            onClick={handleCheckIn} variant="ghost" />
        )}
        {canSettleNow && (
          <TxButton label="Settle" busyLabel="Settling…"
            isBusy={["submitting", "tx-wait"].includes(settleStep)}
            onClick={handleSettle} variant="ghost" />
        )}
        {canCancelNow && (
          <TxButton label="Cancel (reclaim stake)" busyLabel="Cancelling…"
            isBusy={["submitting", "tx-wait"].includes(cancelStep)}
            onClick={handleCancel} variant="ghost" />
        )}
      </div>

      {lastTx && (
        <a href={getExplorerTx(lastTx, targetChain)} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "0.8rem", color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace" }}>
          {lastTx.slice(0, 22)}… (explorer)
        </a>
      )}
      {errorMsg && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{errorMsg}</p>}
      {!address && <p style={{ color: "var(--subtle)", fontSize: "0.85rem" }}>Connect wallet to interact.</p>}
    </div>
  );
}
