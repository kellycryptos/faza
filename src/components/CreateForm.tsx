"use client";

import Link from "next/link";
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
  activeChain,
  ARC_USDC_ADDRESS,
  parseUsdcAmount,
  formatUsdc,
  getExplorerTx,
  isSupportedChain,
} from "@/lib/arc";
import { FAZABOND_ABI, FAZABOND_ADDRESS, getFazaBondAddress, saveLocalBond } from "@/lib/contract";
import { useNetwork } from "@/context/NetworkContext";

interface Props {
  onCreated?: () => void;
}

type Step = "idle" | "approving" | "approve-wait" | "creating" | "create-wait" | "done" | "error";

export function CreateForm({ onCreated }: Props) {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { chainId: effectiveChainId, isTestnet } = useNetwork();

  const [title, setTitle] = useState("");
  const [submittedTitle, setSubmittedTitle] = useState("");
  const [stake, setStake] = useState("1.00");
  const [hoursAhead, setHoursAhead] = useState("24");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [doneTxHash, setDoneTxHash] = useState<`0x${string}` | undefined>();
  const [createdBondId, setCreatedBondId] = useState<number | undefined>();
  const [copied, setCopied] = useState(false);
  const [stakeRawForCreate, setStakeRawForCreate] = useState(0n);
  const [deadlineForCreate, setDeadlineForCreate] = useState(0n);

  const onArc = isSupportedChain(chainId);
  const targetChain = effectiveChainId;
  const contractAddr = getFazaBondAddress(targetChain) ?? FAZABOND_ADDRESS;

  const { data: currentBondCount } = useReadContract({
    address: contractAddr,
    abi: FAZABOND_ABI,
    functionName: "bondCount",
    chainId: targetChain,
    query: { enabled: !!contractAddr },
  });

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
      const newId = currentBondCount !== undefined ? Number(currentBondCount) : 0;
      setCreatedBondId(newId);
      setDoneTxHash(createHash);

      // Optimistically save bond locally so it appears immediately on reload & in feeds
      if (address) {
        saveLocalBond({
          id: newId,
          creator: address,
          joiner: "0x0000000000000000000000000000000000000000",
          stake: stakeRawForCreate.toString(),
          deadline: Number(deadlineForCreate),
          title: submittedTitle || title.trim(),
          creatorIn: false,
          joinerIn: false,
          settled: false,
          txHash: createHash,
          network: isTestnet ? "testnet" : "mainnet",
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("faza_local_update"));
        }
      }

      setStep("done");
      setTitle("");
      setStake("1.00");
      setHoursAhead("24");
      onCreated?.();
    }
  }, [createOk, step, createHash, address, currentBondCount, deadlineForCreate, isTestnet, onCreated, stakeRawForCreate, submittedTitle, title]);

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
    setSubmittedTitle(title.trim());
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
    fontSize: "1rem", width: "100%", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)",
    letterSpacing: "0.07em", textTransform: "uppercase" as const,
    marginBottom: "0.3rem", display: "block",
  };

  if (step === "done" && doneTxHash) {
    const bondUrl = `/faza/${createdBondId ?? 0}${isTestnet ? "?network=testnet" : ""}`;
    const fullShareUrl = typeof window !== "undefined" ? `${window.location.origin}${bondUrl}` : "";
    const tweetText = `I just created a show-up bond on Arc: "${submittedTitle}". Stake and match me: ${fullShareUrl} via @fazaotc`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

    return (
      <div style={{
        background: "linear-gradient(135deg, rgba(46, 230, 166, 0.08) 0%, rgba(20, 32, 48, 0.5) 100%)",
        border: "1px solid rgba(46, 230, 166, 0.4)",
        borderRadius: "var(--radius-card)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: "rgba(46, 230, 166, 0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.3rem", flexShrink: 0,
          }}>
            🎉
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
              Bond #{createdBondId ?? 0} Created Successfully!
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "4px 0 0" }}>
              Your stake is locked. This bond is now live at the top of the feed and in My Bonds.
            </p>
          </div>
        </div>

        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "0.85rem 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}>
          <div>
            <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--ink)" }}>{submittedTitle}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
              <span>Stake: </span>
              <span translate="no" className="notranslate">{formatUsdc(stakeRawForCreate)}</span>
              <span> · {isTestnet ? "Arc Testnet (Sandbox)" : "Arc Mainnet"}</span>
            </div>
          </div>
          <Link
            href={bondUrl}
            style={{
              background: "var(--accent)",
              color: "#050B14",
              borderRadius: "var(--radius-btn)",
              padding: "0.45rem 1rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            View Bond Page →
          </Link>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => {
              if (fullShareUrl) {
                navigator.clipboard.writeText(fullShareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            style={{
              background: copied ? "rgba(46,230,166,0.15)" : "var(--surface)",
              color: copied ? "var(--accent)" : "var(--ink)",
              border: `1px solid ${copied ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "var(--radius-btn)",
              padding: "0.45rem 0.9rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {copied ? "✓ Link Copied!" : "🔗 Copy Share Link"}
          </button>

          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-btn)",
              padding: "0.45rem 0.9rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            Share on 𝕏
          </a>

          <a
            href={getExplorerTx(doneTxHash, targetChain)}
            target="_blank"
            rel="noopener noreferrer"
            translate="no"
            className="notranslate"
            style={{
              fontSize: "0.78rem",
              color: "var(--subtle)",
              marginLeft: "auto",
              textDecoration: "none",
            }}
          >
            Explorer receipt ↗
          </a>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem", display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => setStep("idle")}
            style={{
              background: "transparent",
              color: "var(--muted)",
              border: "none",
              fontSize: "0.8rem",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            + Create another bond
          </button>
        </div>
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
