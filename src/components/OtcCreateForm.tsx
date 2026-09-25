"use client";

import { useState, useEffect } from "react";
import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { erc20Abi, keccak256, toBytes } from "viem";
import {
  activeChain, ARC_USDC_ADDRESS, parseUsdcAmount, getExplorerTx, isSupportedChain,
} from "@/lib/arc";
import { FAZAOTC_ABI, FAZAOTC_ADDRESS, getFazaOtcAddress } from "@/lib/otc-contract";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

interface Props { onCreated: () => void; }

type Step = "idle" | "approving" | "approve-wait" | "submitting" | "tx-wait" | "done" | "error";

export function OtcCreateForm({ onCreated }: Props) {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const onArc = isSupportedChain(chainId);
  const contractAddr = getFazaOtcAddress(chainId) ?? FAZAOTC_ADDRESS;
  const targetChain = onArc ? chainId! : activeChain.id;

  const [title, setTitle] = useState("");
  const [termSheet, setTermSheet] = useState("");
  const [assetAddr, setAssetAddr] = useState("");
  const [size, setSize] = useState("");
  const [priceUsdc, setPriceUsdc] = useState("");
  const [stakeUsdc, setStakeUsdc] = useState("0.10");
  const [deadlineHours, setDeadlineHours] = useState("24");
  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastTx, setLastTx] = useState<`0x${string}` | undefined>();
  // Capture args at submit time, not at write time
  const [createArgs, setCreateArgs] = useState<{
    termsHash: `0x${string}`; asset: `0x${string}`;
    sizeRaw: bigint; priceRaw: bigint; stakeRaw: bigint; deadlineSecs: bigint;
  } | null>(null);

  const fullTermSheet = `TITLE: ${title}\n\n${termSheet}`;
  const termsHash = keccak256(toBytes(fullTermSheet)) as `0x${string}`;
  const isPvp = assetAddr.startsWith("0x") && assetAddr.length === 42 && assetAddr !== ZERO_ADDR;
  const stakeRaw = parseUsdcAmount(stakeUsdc);
  const priceRaw = parseUsdcAmount(priceUsdc);
  const sizeRaw = size ? BigInt(Math.round(parseFloat(size) * 1e6)) : 0n;

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { isSuccess: approveOk } = useWaitForTransactionReceipt({ hash: approveHash });
  const { writeContract: write, data: txHash } = useWriteContract();
  const { isSuccess: txOk } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (approveOk && step === "approve-wait") setStep("submitting");
  }, [approveOk, step]);

  useEffect(() => {
    if (step === "submitting" && contractAddr && createArgs) {
      setStep("tx-wait");
      write(
        {
          address: contractAddr, abi: FAZAOTC_ABI, functionName: "create",
          args: [createArgs.termsHash, createArgs.asset, createArgs.sizeRaw, createArgs.priceRaw, createArgs.stakeRaw, createArgs.deadlineSecs],
          chainId: targetChain,
        },
        {
          onSuccess: (h) => setLastTx(h),
          onError: (e) => {
            const msg = e?.message?.toLowerCase() ?? "";
            if (!msg.includes("user rejected") && !msg.includes("denied")) setErrorMsg("Create failed: " + e.message.slice(0, 80));
            setStep("error");
          },
        }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (txOk && step === "tx-wait") {
      if (txHash) setLastTx(txHash);
      setStep("done");
      onCreated();
    }
  }, [txOk, step, txHash, onCreated]);

  const valid = title.trim() && termSheet.trim() && priceRaw > 0n && stakeRaw >= 10_000n && sizeRaw > 0n;

  const handleCreate = () => {
    if (!address || !contractAddr) return;
    if (!onArc) { switchChain({ chainId: activeChain.id }); return; }
    if (!valid) { setErrorMsg("Fill in all fields."); return; }
    setErrorMsg("");
    const args = {
      termsHash,
      asset: (isPvp ? assetAddr : ZERO_ADDR) as `0x${string}`,
      sizeRaw,
      priceRaw,
      stakeRaw,
      deadlineSecs: BigInt(Math.floor(Date.now() / 1000) + parseInt(deadlineHours || "24") * 3600),
    };
    setCreateArgs(args);
    setStep("approving");
    approve(
      { address: ARC_USDC_ADDRESS, abi: erc20Abi, functionName: "approve", args: [contractAddr, args.stakeRaw], chainId: targetChain },
      {
        onSuccess: () => setStep("approve-wait"),
        onError: (e) => {
          const msg = e?.message?.toLowerCase() ?? "";
          if (!msg.includes("user rejected") && !msg.includes("denied")) setErrorMsg("Approval failed.");
          setStep("error");
        },
      }
    );
  };

  const isBusy = ["approving", "approve-wait", "submitting", "tx-wait"].includes(step);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      <p style={sectionLabel}>New OTC Deal</p>

      <Field label="Deal title (not stored onchain)">
        <input style={inputStyle} placeholder="e.g. 500 USDC vs. 100 WBTC" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>

      <Field label="Term sheet (full text — hashed onchain)">
        <textarea
          style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
          placeholder={"Asset: WBTC (0x...)\nSize: 100\nPrice: 500 USDC\nSeller: 0x...\nBuyer: 0x...\nDeadline: 2026-10-01\nSettlement: Arc PvP onchain"}
          value={termSheet}
          onChange={(e) => setTermSheet(e.target.value)}
        />
      </Field>

      {termSheet && (
        <div style={{ background: "var(--surface-muted)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.6rem 0.9rem" }}>
          <p style={{ ...sectionLabel, marginBottom: 3, fontSize: "0.68rem" }}>Terms hash (keccak256)</p>
          <p className="mono" style={{ fontSize: "0.72rem", color: "var(--muted)", wordBreak: "break-all" }}>{termsHash}</p>
          <p style={{ fontSize: "0.7rem", color: "var(--subtle)", marginTop: 4 }}>
            Both parties verify this hash matches before signing.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Field label="Asset token address (optional)">
          <input style={inputStyle} placeholder={`${ZERO_ADDR} = offchain stock`} value={assetAddr} onChange={(e) => setAssetAddr(e.target.value)} />
        </Field>
        <Field label="Size (token units or notional)">
          <input style={inputStyle} type="number" placeholder="100" value={size} onChange={(e) => setSize(e.target.value)} />
        </Field>
        <Field label="Price in USDC ($)">
          <input style={inputStyle} type="number" placeholder="500.00" value={priceUsdc} onChange={(e) => setPriceUsdc(e.target.value)} />
        </Field>
        <Field label="Stake bond in USDC ($)">
          <input style={inputStyle} type="number" placeholder="0.10" value={stakeUsdc} onChange={(e) => setStakeUsdc(e.target.value)} />
        </Field>
        <Field label="Deadline (hours from now)">
          <input style={inputStyle} type="number" placeholder="24" value={deadlineHours} onChange={(e) => setDeadlineHours(e.target.value)} />
        </Field>
      </div>

      <div style={{
        background: isPvp ? "var(--accent-dim)" : "rgba(245,166,35,0.08)",
        border: `1px solid ${isPvp ? "rgba(46,230,166,0.25)" : "rgba(245,166,35,0.3)"}`,
        borderRadius: 8, padding: "0.6rem 0.9rem",
      }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 700, color: isPvp ? "var(--accent)" : "var(--amber)", margin: 0 }}>
          {isPvp ? "PvP settle on Arc." : "Bond only. The share moves offchain. Faza enforces the stake."}
        </p>
        <p style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3 }}>
          {isPvp
            ? "Seller must approve FazaOTC to transfer the token before settle() runs."
            : "No token transfer onchain. Both parties call confirmDone() after the offchain transfer."}
        </p>
      </div>

      {!address && <p style={{ fontSize: "0.85rem", color: "var(--subtle)" }}>Connect wallet to create a deal.</p>}

      {address && (
        <button
          onClick={handleCreate} disabled={isBusy || !valid}
          style={{
            background: isBusy || !valid ? "var(--surface-muted)" : "var(--accent)",
            color: isBusy || !valid ? "var(--subtle)" : "#050B14",
            border: "none", borderRadius: 10, padding: "0.7rem 1.5rem",
            fontSize: "0.9rem", fontFamily: "'Inter', sans-serif", fontWeight: 700,
            cursor: isBusy || !valid ? "not-allowed" : "pointer",
          }}
        >
          {step === "approving" ? "Confirm approval…" : step === "approve-wait" ? "Approving…" : isBusy ? "Creating…" : "Create deal"}
        </button>
      )}

      {lastTx && (
        <a href={getExplorerTx(lastTx, targetChain)} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "0.78rem", color: "var(--accent)", fontFamily: "monospace" }}>
          {lastTx.slice(0, 22)}… (explorer)
        </a>
      )}
      {errorMsg && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{errorMsg}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--subtle)" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--surface-muted)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "0.55rem 0.85rem",
  color: "var(--ink)", fontSize: "0.9rem",
  fontFamily: "'Inter', sans-serif", outline: "none", width: "100%",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "var(--subtle)", margin: 0,
};
