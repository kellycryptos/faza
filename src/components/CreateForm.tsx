"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { erc20Abi } from "viem";
import {
  activeChain,
  ARC_USDC_ADDRESS,
  parseUsdcAmount,
  formatUsdc,
  getExplorerTx,
  isSupportedChain,
} from "@/lib/arc";
import { FAZABOND_ABI, FAZABOND_ADDRESS, getFazaBondAddress } from "@/lib/contract";

interface Props {
  onCreated?: () => void;
}

type Step = "idle" | "approving" | "approve-wait" | "creating" | "create-wait" | "done" | "error";

export function CreateForm({ onCreated }: Props) {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const [title, setTitle] = useState("");
  const [stake, setStake] = useState("1.00");
  const [hoursAhead, setHoursAhead] = useState("24");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [doneTxHash, setDoneTxHash] = useState<`0x${string}` | undefined>();
  const [stakeRawForCreate, setStakeRawForCreate] = useState(0n);
  const [deadlineForCreate, setDeadlineForCreate] = useState(0n);

  const onArc = isSupportedChain(chainId);
  const targetChain = onArc ? chainId! : activeChain.id;
  const contractAddr = getFazaBondAddress(targetChain) ?? FAZABOND_ADDRESS;

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { isSuccess: approveOk } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: create, data: createHash } = useWriteContract();
  const { isSuccess: createOk } = useWaitForTransactionReceipt({ hash: createHash });

  // React 19-safe: transitions happen in useEffect, never in render body
  useEffect(() => {
    if (approveOk && step === "approve-wait") {
      setStep("creating");
    }
  }, [approveOk, step]);

  useEffect(() => {
    if (step === "creating" && contractAddr && stakeRawForCreate > 0n) {
      setStep("create-wait");
      create(
        {
          address: contractAddr,
          abi: FAZABOND_ABI,
          functionName: "create",
          args: [title.trim(), stakeRawForCreate, deadlineForCreate],
          chainId: targetChain,
        },
        {
          onError: (e) => {
            const msg = e?.message?.toLowerCase() ?? "";
            if (!msg.includes("user rejected") && !msg.includes("denied")) {
              setError("Create failed. Please try again.");
            }
            setStep("error");
          },
        }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (createOk && step === "create-wait" && createHash) {
      setDoneTxHash(createHash);
      setStep("done");
      setTitle("");
      setStake("1.00");
      setHoursAhead("24");
      onCreated?.();
    }
  }, [createOk, step, createHash, onCreated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    if (!onArc) { switchChain({ chainId: activeChain.id }); return; }
    if (!contractAddr) { setError("Contract not yet deployed."); return; }

    const stakeRaw = parseUsdcAmount(stake);
    if (stakeRaw < 10_000n || stakeRaw > 100_000_000n) {
      setError("Stake must be between $0.01 and $100.00.");
      return;
    }
    const hours = parseInt(hoursAhead);
    if (isNaN(hours) || hours < 1 || hours > 720) {
      setError("Deadline must be 1–720 hours from now.");
      return;
    }
    if (!title.trim()) { setError("Title required."); return; }

    setError("");
    setStakeRawForCreate(stakeRaw);
    setDeadlineForCreate(BigInt(Math.floor(Date.now() / 1000) + hours * 3600));
    setStep("approving");

    approve(
      {
        address: ARC_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [contractAddr, stakeRaw],
        chainId: targetChain,
      },
      {
        onSuccess: () => setStep("approve-wait"),
        onError: (e) => {
          const msg = e?.message?.toLowerCase() ?? "";
          if (!msg.includes("user rejected") && !msg.includes("denied")) {
            setError("Approval failed. Please try again.");
          }
          setStep("error");
        },
      }
    );
  };

  const stakeRaw = parseUsdcAmount(stake);
  const ctaLabel = () => {
    if (!onArc && address) return "Switch to Arc";
    if (step === "approving") return "Confirm approval…";
    if (step === "approve-wait") return "Approving USDC…";
    if (step === "creating") return "Confirm create…";
    if (step === "create-wait") return "Creating bond…";
    return `Create — lock ${formatUsdc(stakeRaw)}`;
  };
  const isBusy = ["approving", "approve-wait", "creating", "create-wait"].includes(step);

  const inputStyle: React.CSSProperties = {
    background: "var(--surface-muted)", border: "1px solid var(--border)", borderRadius: 8,
    padding: "0.6rem 0.85rem", color: "var(--ink)", fontFamily: "'Inter', sans-serif",
    fontSize: "0.9rem", width: "100%", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)",
    letterSpacing: "0.07em", textTransform: "uppercase" as const,
    marginBottom: "0.3rem", display: "block",
  };

  if (step === "done" && doneTxHash) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <p style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.95rem" }}>
          Bond created. Share the link so someone joins.
        </p>
        <a
          href={getExplorerTx(doneTxHash, targetChain)}
          target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "0.82rem", color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          {doneTxHash.slice(0, 22)}… (explorer)
        </a>
        <button
          onClick={() => setStep("idle")}
          style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8,
            padding: "0.5rem 1rem", color: "var(--muted)", fontSize: "0.85rem",
            fontFamily: "'Inter', sans-serif", cursor: "pointer", alignSelf: "flex-start",
          }}
        >
          Create another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={labelStyle} htmlFor="bond-title">What is this for?</label>
        <input
          id="bond-title" type="text" value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Coffee on Thursday at noon"
          maxLength={100} required disabled={isBusy} style={inputStyle}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label style={labelStyle} htmlFor="bond-stake">Stake (USDC)</label>
          <input
            id="bond-stake" type="number" value={stake}
            onChange={(e) => setStake(e.target.value)}
            min="0.01" max="100" step="0.01" required disabled={isBusy} style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="bond-hours">Deadline (hours from now)</label>
          <input
            id="bond-hours" type="number" value={hoursAhead}
            onChange={(e) => setHoursAhead(e.target.value)}
            min="1" max="720" step="1" required disabled={isBusy} style={inputStyle}
          />
        </div>
      </div>

      {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</p>}

      {!address ? (
        <p style={{ color: "var(--subtle)", fontSize: "0.85rem" }}>Connect wallet to create a bond.</p>
      ) : (
        <button
          type="submit" disabled={isBusy}
          style={{
            background: isBusy ? "var(--surface-muted)" : "var(--accent)",
            color: isBusy ? "var(--subtle)" : "#050B14",
            border: "none", borderRadius: 10, padding: "0.75rem 1.25rem",
            fontSize: "0.95rem", fontFamily: "'Inter', sans-serif",
            fontWeight: 700, cursor: isBusy ? "not-allowed" : "pointer",
            minHeight: 48, transition: "background 0.15s",
          }}
        >
          {ctaLabel()}
        </button>
      )}
    </form>
  );
}
