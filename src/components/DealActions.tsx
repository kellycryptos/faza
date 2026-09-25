"use client";

import { useState, useEffect } from "react";
import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import {
  activeChain, ARC_USDC_ADDRESS, formatUsdc, getExplorerTx, isSupportedChain,
} from "@/lib/arc";
import { FAZAOTC_ABI, FAZAOTC_ADDRESS, getFazaOtcAddress, isPvp, type DealSummary } from "@/lib/otc-contract";

type Step = "idle" | "approving" | "approve-wait" | "submitting" | "tx-wait" | "done" | "error";
const ZERO = "0x0000000000000000000000000000000000000000";

export function DealActions({ deal, onRefresh }: { deal: DealSummary; onRefresh: () => void }) {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const onArc = isSupportedChain(chainId);
  const contractAddr = getFazaOtcAddress(chainId) ?? FAZAOTC_ADDRESS;
  const targetChain = onArc ? chainId! : activeChain.id;

  const now = Math.floor(Date.now() / 1000);
  const hasBuyer = deal.buyer && deal.buyer !== ZERO;
  const isSeller = address && address.toLowerCase() === deal.seller.toLowerCase();
  const isBuyer = address && hasBuyer && address.toLowerCase() === deal.buyer.toLowerCase();
  const isParty = isSeller || isBuyer;
  const pvp = isPvp(deal);

  const [joinStep, setJoinStep] = useState<Step>("idle");
  const [attestStep, setAttestStep] = useState<Step>("idle");
  const [doneStep, setDoneStep] = useState<Step>("idle");
  const [settleStep, setSettleStep] = useState<Step>("idle");
  const [cancelStep, setCancelStep] = useState<Step>("idle");
  const [claimStep, setClaimStep] = useState<Step>("idle");
  const [lastTx, setLastTx] = useState<`0x${string}` | undefined>();
  const [errorMsg, setErrorMsg] = useState("");

  const { data: claimableAmt, refetch: refetchClaim } = useReadContract({
    address: contractAddr || undefined, abi: FAZAOTC_ABI,
    functionName: "claimable", args: address ? [address] : undefined,
    chainId: targetChain, query: { enabled: !!address && !!contractAddr },
  });

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { isSuccess: approveOk } = useWaitForTransactionReceipt({ hash: approveHash });
  const { writeContract: write, data: txHash } = useWriteContract();
  const { isSuccess: txOk } = useWaitForTransactionReceipt({ hash: txHash });

  // React 19-safe useEffect transitions
  useEffect(() => {
    if (approveOk && joinStep === "approve-wait") setJoinStep("submitting");
  }, [approveOk, joinStep]);

  useEffect(() => {
    if (joinStep === "submitting" && contractAddr) {
      setJoinStep("tx-wait");
      write(
        { address: contractAddr, abi: FAZAOTC_ABI, functionName: "join",
          args: [BigInt(deal.id), deal.termsHash as `0x${string}`], chainId: targetChain },
        {
          onSuccess: (h) => setLastTx(h),
          onError: (e) => { if (!e.message.toLowerCase().includes("reject")) setErrorMsg("Join failed."); setJoinStep("error"); },
        }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinStep]);

  useEffect(() => {
    if (!txOk) return;
    if (txHash) setLastTx(txHash);
    if (joinStep === "tx-wait") { setJoinStep("done"); onRefresh(); refetchClaim(); }
    else if (attestStep === "tx-wait") { setAttestStep("done"); onRefresh(); }
    else if (doneStep === "tx-wait") { setDoneStep("done"); onRefresh(); }
    else if (settleStep === "tx-wait") { setSettleStep("done"); onRefresh(); refetchClaim(); }
    else if (cancelStep === "tx-wait") { setCancelStep("done"); onRefresh(); refetchClaim(); }
    else if (claimStep === "tx-wait") { setClaimStep("done"); refetchClaim(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txOk]);

  const handleSwitch = () => switchChain({ chainId: activeChain.id });

  const handleJoin = () => {
    if (!address || !contractAddr) return;
    if (!onArc) { handleSwitch(); return; }
    setErrorMsg(""); setJoinStep("approving");
    const amount = BigInt(deal.stake) + (pvp ? BigInt(deal.priceUsdc) : 0n);
    approve(
      { address: ARC_USDC_ADDRESS, abi: erc20Abi, functionName: "approve", args: [contractAddr, amount], chainId: targetChain },
      {
        onSuccess: () => setJoinStep("approve-wait"),
        onError: (e) => { if (!e.message.toLowerCase().includes("reject")) setErrorMsg("Approval failed."); setJoinStep("error"); },
      }
    );
  };

  const simpleWrite = (
    fn: "attest" | "confirmDone" | "settle" | "cancel" | "claim",
    setS: (s: Step) => void,
    label: string
  ) => {
    if (!address || !contractAddr) return;
    if (!onArc) { handleSwitch(); return; }
    setErrorMsg(""); setS("submitting");
    const args = fn === "claim" ? [] : [BigInt(deal.id)];
    write(
      { address: contractAddr, abi: FAZAOTC_ABI, functionName: fn, args: args as never, chainId: targetChain },
      {
        onSuccess: (h) => { setLastTx(h); setS("tx-wait"); },
        onError: (e) => { if (!e.message.toLowerCase().includes("reject")) setErrorMsg(`${label} failed.`); setS("error"); },
      }
    );
  };

  const canJoinNow = !hasBuyer && now < deal.deadline && !deal.settled && address && !isSeller;
  const canAttestNow = hasBuyer && now < deal.deadline && !deal.settled && isParty
    && !(isSeller && deal.sellerAttested) && !(isBuyer && deal.buyerAttested)
    && deal.state === 1; // Joined state
  const canConfirmNow = hasBuyer && now < deal.deadline && !deal.settled && isParty && !pvp
    && !(isSeller && deal.sellerDone) && !(isBuyer && deal.buyerDone);
  const canSettleNow = hasBuyer && now >= deal.deadline && !deal.settled;
  const canCancelNow = !hasBuyer && now >= deal.deadline && !deal.settled && isSeller;
  const hasClaim = claimableAmt && (claimableAmt as bigint) > 0n;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      {hasClaim && (
        <div style={{ background: "rgba(46,230,166,0.07)", border: "1px solid var(--accent)", borderRadius: 10, padding: "0.8rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.07em", textTransform: "uppercase", margin: 0 }}>Claimable</p>
            <p className="tabular" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>{formatUsdc(claimableAmt as bigint)}</p>
          </div>
          <Btn label="Claim USDC" busy={["submitting", "tx-wait"].includes(claimStep)} onClick={() => simpleWrite("claim", setClaimStep, "Claim")} primary />
        </div>
      )}

      <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
        {canJoinNow && (
          <Btn
            label={`Join — stake ${formatUsdc(deal.stake)}${pvp ? ` + escrow ${formatUsdc(deal.priceUsdc)}` : ""}`}
            busy={["approving", "approve-wait", "submitting", "tx-wait"].includes(joinStep)}
            busyLabel={joinStep === "approving" ? "Confirm approval…" : joinStep === "approve-wait" ? "Approving…" : "Joining…"}
            onClick={handleJoin} primary
          />
        )}
        {canAttestNow && (
          <Btn label="Attest" busy={["submitting", "tx-wait"].includes(attestStep)}
            onClick={() => simpleWrite("attest", setAttestStep, "Attest")} />
        )}
        {canConfirmNow && (
          <Btn label="Confirm done" busy={["submitting", "tx-wait"].includes(doneStep)}
            onClick={() => simpleWrite("confirmDone", setDoneStep, "ConfirmDone")} />
        )}
        {canSettleNow && (
          <Btn label="Settle" busy={["submitting", "tx-wait"].includes(settleStep)}
            onClick={() => simpleWrite("settle", setSettleStep, "Settle")} />
        )}
        {canCancelNow && (
          <Btn label="Cancel (reclaim stake)" busy={["submitting", "tx-wait"].includes(cancelStep)}
            onClick={() => simpleWrite("cancel", setCancelStep, "Cancel")} />
        )}
      </div>

      {lastTx && (
        <a href={getExplorerTx(lastTx, targetChain)} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "0.78rem", color: "var(--accent)", fontFamily: "monospace" }}>
          {lastTx.slice(0, 22)}… (explorer)
        </a>
      )}
      {errorMsg && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{errorMsg}</p>}
      {!address && <p style={{ color: "var(--subtle)", fontSize: "0.85rem" }}>Connect wallet to interact.</p>}
    </div>
  );
}

function Btn({ label, busy, busyLabel, onClick, primary, disabled }: {
  label: string; busy: boolean; busyLabel?: string; onClick: () => void; primary?: boolean; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={busy || disabled} style={{
      background: busy || disabled ? "var(--surface-muted)" : primary ? "var(--accent)" : "var(--surface)",
      color: busy || disabled ? "var(--subtle)" : primary ? "#050B14" : "var(--ink-2)",
      border: primary ? "none" : "1px solid var(--border)",
      borderRadius: 10, padding: "0.6rem 1.1rem",
      fontSize: "0.88rem", fontFamily: "'Inter', sans-serif", fontWeight: 700,
      cursor: busy || disabled ? "not-allowed" : "pointer", minHeight: 42,
    }}>
      {busy ? (busyLabel ?? "…") : label}
    </button>
  );
}
