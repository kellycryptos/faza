"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { formatUsdc, formatDeadline, formatCountdown, shortAddr, getExplorerAddress } from "@/lib/arc";
import { useAccount } from "wagmi";
import { FAZABOND_ABI, getFazaBondAddress, FAZABOND_ADDRESS } from "@/lib/contract";
import { BondActions } from "@/components/BondActions";
import type { BondSummary } from "@/components/BondCard";

export default function FazaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bondId = parseInt(id, 10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [countdown, setCountdown] = useState("");
  const [copied, setCopied] = useState(false);
  const { chainId } = useAccount();
  const effectiveChainId = chainId === 5042002 ? 5042002 : 5042;
  const contractAddr = getFazaBondAddress(effectiveChainId) ?? FAZABOND_ADDRESS;

  const { data: raw, refetch } = useReadContract({
    address: contractAddr || undefined,
    abi: FAZABOND_ABI,
    functionName: "getBond",
    args: [BigInt(isNaN(bondId) ? 0 : bondId)],
    chainId: effectiveChainId,
    query: { enabled: !!contractAddr && !isNaN(bondId), refetchInterval: 6000 },
  });

  useEffect(() => { if (refreshKey > 0) refetch(); }, [refreshKey, refetch]);

  // Live countdown
  useEffect(() => {
    if (!raw) return;
    const b = raw as { deadline: bigint; settled: boolean };
    const update = () => setCountdown(b.settled ? "" : formatCountdown(Number(b.deadline)));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [raw]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isNaN(bondId)) return <Wrapper><p style={{ color: "var(--subtle)" }}>Invalid bond ID.</p></Wrapper>;
  if (!contractAddr) return <Wrapper><p style={{ color: "var(--subtle)" }}>Contract not deployed yet.</p></Wrapper>;

  const b = raw as {
    creator: `0x${string}`; joiner: `0x${string}`; stake: bigint;
    deadline: bigint; title: string; creatorIn: boolean; joinerIn: boolean; settled: boolean;
  } | undefined;

  if (!b || b.creator === "0x0000000000000000000000000000000000000000") {
    return <Wrapper><p style={{ color: "var(--subtle)" }}>Bond #{bondId} not found.</p></Wrapper>;
  }

  const bond: BondSummary = {
    id: bondId, creator: b.creator, joiner: b.joiner, stake: b.stake.toString(),
    deadline: Number(b.deadline), title: b.title,
    creatorIn: b.creatorIn, joinerIn: b.joinerIn, settled: b.settled,
  };

  const hasJoiner = b.joiner !== "0x0000000000000000000000000000000000000000";
  const total = b.stake * 2n;
  const now = Math.floor(Date.now() / 1000);
  const secsLeft = Number(b.deadline) - now;
  const expired = secsLeft <= 0;

  // Determine outcome label
  const statusLabel = (() => {
    if (b.settled) return { text: "Settled", color: "var(--subtle)", bg: "rgba(90,100,120,0.12)" };
    if (!hasJoiner && expired) return { text: "Expired", color: "var(--danger)", bg: "var(--danger-dim)" };
    if (!hasJoiner) return { text: "Open", color: "var(--accent)", bg: "var(--accent-dim)" };
    if (!expired) return { text: "Live", color: "var(--accent)", bg: "var(--accent-dim)" };
    return { text: "Ready to settle", color: "var(--amber)", bg: "var(--amber-dim)" };
  })();

  return (
    <Wrapper>
      {/* Back */}
      <Link href="/" style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none" }}>
        ← All bonds
      </Link>

      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <h1
            className="display"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 800, color: "var(--ink)", margin: 0 }}
          >
            {b.title}
          </h1>
          <span
            style={{
              fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              color: statusLabel.color, background: statusLabel.bg, borderRadius: "var(--radius-pill)",
              padding: "3px 10px",
            }}
          >
            {statusLabel.text}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <p style={{ fontSize: "0.78rem", color: "var(--subtle)", margin: 0 }}>Bond #{bondId}</p>
          <button onClick={handleCopy} style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6,
            padding: "2px 8px", fontSize: "0.72rem", color: "var(--muted)",
            cursor: "pointer", fontFamily: "'Inter', sans-serif",
          }}>
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      {/* Stake hero */}
      <div
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)", padding: "1.5rem",
          display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--subtle)" }}>
          Total locked
        </span>
        <span
          className="tabular display"
          style={{ fontSize: "clamp(2rem, 6vw, 3rem)", fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}
        >
          {formatUsdc(total)}
        </span>
        <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
          {formatUsdc(b.stake)} each · {hasJoiner ? "2 parties" : "1 party (waiting for joiner)"}
        </span>
      </div>

      {/* Deadline */}
      <div
        style={{
          background: "var(--surface)", border: `1px solid ${expired ? "rgba(255,92,122,0.3)" : "var(--border)"}`,
          borderRadius: "var(--radius-card)", padding: "1.1rem 1.25rem",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem",
        }}
      >
        <div>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 2 }}>
            Deadline
          </p>
          <p style={{ fontWeight: 600, color: expired ? "var(--danger)" : "var(--ink-2)", margin: 0 }}>
            {formatDeadline(Number(b.deadline))}
          </p>
        </div>
        {!expired && !b.settled && countdown && (
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--subtle)", marginBottom: 2 }}>Time left</p>
            <span className="tabular" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.02em" }}>{countdown}</span>
          </div>
        )}
        {expired && !b.settled && (
          <span
            style={{
              fontSize: "0.78rem", fontWeight: 700, color: "var(--danger)",
              background: "var(--danger-dim)", borderRadius: "var(--radius-pill)", padding: "3px 10px",
            }}
          >
            Deadline passed
          </span>
        )}
      </div>

      {/* Two-column parties */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: hasJoiner ? "1fr 1fr" : "1fr",
          gap: "0.75rem",
        }}
      >
        <PartyCard
          role="Creator"
          addr={b.creator}
          checkedIn={b.creatorIn}
          isWaiting={false}
          chainId={chainId}
        />
        {hasJoiner ? (
          <PartyCard role="Joiner" addr={b.joiner} checkedIn={b.joinerIn} isWaiting={false} chainId={chainId} />
        ) : (
          <div
            style={{
              background: "var(--surface-muted)", border: "1px dashed var(--border)",
              borderRadius: "var(--radius-card)", padding: "1.1rem 1.25rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "var(--subtle)" }}>Waiting for joiner…</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)", padding: "1.25rem",
          display: "flex", flexDirection: "column", gap: "0.75rem",
        }}
      >
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--subtle)", margin: 0 }}>
          Actions
        </p>
        <BondActions bond={bond} onRefresh={() => { refetch(); setRefreshKey((k) => k + 1); }} />
      </div>
    </Wrapper>
  );
}

function PartyCard({ role, addr, checkedIn, chainId }: { role: string; addr: string; checkedIn: boolean; isWaiting: boolean; chainId?: number }) {
  return (
    <div
      style={{
        background: "var(--surface)", border: `1px solid ${checkedIn ? "rgba(46,230,166,0.25)" : "var(--border)"}`,
        borderRadius: "var(--radius-card)", padding: "1.1rem 1.25rem",
        display: "flex", flexDirection: "column", gap: "0.5rem",
      }}
    >
      <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--subtle)" }}>
        {role}
      </span>
      <a
        href={getExplorerAddress(addr, chainId)}
        target="_blank"
        rel="noopener noreferrer"
        className="mono"
        style={{ fontSize: "0.82rem", color: "var(--ink-2)", textDecoration: "none" }}
      >
        {shortAddr(addr)}
      </a>
      <span
        style={{
          fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          color: checkedIn ? "var(--accent)" : "var(--subtle)",
          background: checkedIn ? "var(--accent-dim)" : "rgba(90,100,120,0.1)",
          borderRadius: "var(--radius-pill)", padding: "2px 9px", alignSelf: "flex-start",
        }}
      >
        {checkedIn ? "Checked in" : "Pending"}
      </span>
    </div>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 640, margin: "0 auto", padding: "2rem 1.25rem 5rem",
        display: "flex", flexDirection: "column", gap: "1.25rem",
      }}
    >
      {children}
    </div>
  );
}
