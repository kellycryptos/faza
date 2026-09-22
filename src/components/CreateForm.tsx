"use client";

import { useState } from "react";
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { erc20Abi, parseUnits } from "viem";
import {
  activeChain,
  ARC_USDC_ADDRESS,
  parseUsdcAmount,
  formatUsdc,
  explorerTx,
} from "@/lib/arc";
import { FAZABOND_ABI, FAZABOND_ADDRESS } from "@/lib/contract";

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
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const wrongChain = !!address && chainId !== activeChain.id;

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { isLoading: approveWaiting, isSuccess: approveOk } =
    useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: create, data: createHash } = useWriteContract();
  const { isLoading: createWaiting, isSuccess: createOk } =
    useWaitForTransactionReceipt({ hash: createHash });

  if (approveOk && step === "approve-wait") {
    setStep("creating");
  }

  if (createOk && step === "create-wait") {
    setTxHash(createHash);
    setStep("done");
    setTitle("");
    setStake("1.00");
    setHoursAhead("24");
    onCreated?.();
  }

  if (step === "creating" && FAZABOND_ADDRESS) {
    setStep("create-wait");
    const stakeRaw = parseUsdcAmount(stake);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + parseInt(hoursAhead) * 3600);
    create(
      {
        address: FAZABOND_ADDRESS,
        abi: FAZABOND_ABI,
        functionName: "create",
        args: [title.trim(), stakeRaw, deadline],
        chainId: activeChain.id,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    if (wrongChain) { switchChain({ chainId: activeChain.id }); return; }
    if (!FAZABOND_ADDRESS) { setError("Contract not yet deployed."); return; }

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
    setStep("approving");
    approve(
      {
        address: ARC_USDC_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [FAZABOND_ADDRESS, stakeRaw],
        chainId: activeChain.id,
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
    if (wrongChain) return "Switch to Arc Testnet";
    if (step === "approving") return "Confirm approval…";
    if (step === "approve-wait" || approveWaiting) return "Approving USDC…";
    if (step === "creating") return "Confirm create…";
    if (step === "create-wait" || createWaiting) return "Creating bond…";
    return `Create — lock ${formatUsdc(stakeRaw)}`;
  };
  const isBusy = ["approving", "approve-wait", "creating", "create-wait"].includes(step) || approveWaiting || createWaiting;

  const inputStyle: React.CSSProperties = {
    background: "var(--surface-muted)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "0.6rem 0.85rem",
    color: "var(--ink)",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    width: "100%",
    outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "var(--muted)",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    marginBottom: "0.3rem",
    display: "block",
  };

  if (step === "done" && txHash) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <p style={{ color: "var(--success)", fontWeight: 600, fontSize: "0.95rem" }}>
          Bond created. Share the link so someone joins.
        </p>
        <a
          href={explorerTx(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "0.82rem", color: "var(--accent)", fontFamily: "'JetBrains Mono', monospace" }}
        >
          {txHash.slice(0, 20)}… (explorer)
        </a>
        <button
          onClick={() => setStep("idle")}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "0.5rem 1rem",
            color: "var(--muted)",
            fontSize: "0.85rem",
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            alignSelf: "flex-start",
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
          id="bond-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Coffee on Thursday at noon"
          maxLength={100}
          required
          disabled={isBusy}
          style={inputStyle}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label style={labelStyle} htmlFor="bond-stake">Stake (USDC)</label>
          <input
            id="bond-stake"
            type="number"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            min="0.01"
            max="100"
            step="0.01"
            required
            disabled={isBusy}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="bond-hours">Deadline (hours from now)</label>
          <input
            id="bond-hours"
            type="number"
            value={hoursAhead}
            onChange={(e) => setHoursAhead(e.target.value)}
            min="1"
            max="720"
            step="1"
            required
            disabled={isBusy}
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</p>
      )}

      {!address ? (
        <p style={{ color: "var(--subtle)", fontSize: "0.85rem" }}>Connect wallet to create a bond.</p>
      ) : (
        <button
          type="submit"
          disabled={isBusy}
          style={{
            background: isBusy ? "var(--surface-muted)" : "var(--accent)",
            color: isBusy ? "var(--subtle)" : "#0d1b2f",
            border: "none",
            borderRadius: 10,
            padding: "0.75rem 1.25rem",
            fontSize: "0.95rem",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            cursor: isBusy ? "not-allowed" : "pointer",
            minHeight: 48,
            transition: "background 0.15s",
          }}
        >
          {ctaLabel()}
        </button>
      )}
    </form>
  );
}

// silence unused import
void parseUnits;
