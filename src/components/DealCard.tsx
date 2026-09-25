"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { formatUsdc, formatDeadline, formatCountdown, shortAddr } from "@/lib/arc";
import { DEAL_STATES, isPvp, type DealSummary } from "@/lib/otc-contract";

const ZERO = "0x0000000000000000000000000000000000000000";

function dealPill(deal: DealSummary): { label: string; bg: string; fg: string } {
  const now = Math.floor(Date.now() / 1000);
  const state = DEAL_STATES[deal.state] ?? "Unknown";
  if (state === "Settled") return { label: "Settled", bg: "rgba(90,100,120,0.18)", fg: "var(--subtle)" };
  if (state === "Forfeit") return { label: "Forfeit", bg: "var(--danger-dim)", fg: "var(--danger)" };
  if (state === "Cancelled") return { label: "Cancelled", bg: "rgba(90,100,120,0.18)", fg: "var(--subtle)" };
  if (!deal.buyer || deal.buyer === ZERO) {
    if (now >= deal.deadline) return { label: "Expired", bg: "var(--danger-dim)", fg: "var(--danger)" };
    return { label: "Open", bg: "var(--accent-dim)", fg: "var(--accent)" };
  }
  if (now >= deal.deadline) return { label: "Ready to settle", bg: "rgba(245,166,35,0.12)", fg: "var(--amber)" };
  if (state === "Attested") return { label: "Attested", bg: "var(--accent-dim)", fg: "var(--accent)" };
  return { label: "Live", bg: "rgba(46,230,166,0.08)", fg: "var(--accent)" };
}

function LiveCountdown({ deadline, settled }: { deadline: number; settled: boolean }) {
  const [label, setLabel] = useState(() => settled ? "" : formatCountdown(deadline));
  useEffect(() => {
    if (settled) return;
    const id = setInterval(() => setLabel(formatCountdown(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline, settled]);
  if (settled || !label || label === "Ended") return null;
  return (
    <span className="tabular" style={{ fontSize: "0.75rem", color: "var(--amber)", fontWeight: 600 }}>
      {label} left
    </span>
  );
}

export function DealCard({ deal }: { deal: DealSummary }) {
  const pill = dealPill(deal);
  const pvp = isPvp(deal);
  const hasBuyer = deal.buyer && deal.buyer !== ZERO;

  return (
    <Link href={`/otc/${deal.id}`} style={{ textDecoration: "none", display: "block" }}>
      <article
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)", padding: "1.1rem 1.25rem",
          display: "flex", flexDirection: "column", gap: "0.65rem",
          cursor: "pointer", transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            {/* PvP vs Bond label */}
            <span
              style={{
                fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.09em",
                textTransform: "uppercase", padding: "2px 8px",
                borderRadius: "var(--radius-pill)",
                background: pvp ? "rgba(46,230,166,0.08)" : "rgba(245,166,35,0.08)",
                color: pvp ? "var(--accent)" : "var(--amber)",
                border: `1px solid ${pvp ? "rgba(46,230,166,0.2)" : "rgba(245,166,35,0.2)"}`,
                whiteSpace: "nowrap",
              }}
            >
              {pvp ? "PvP" : "Bond only"}
            </span>
            <span
              style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              Deal #{deal.id}
            </span>
          </div>
          <span
            style={{
              fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              background: pill.bg, color: pill.fg,
              border: `1px solid ${pill.fg}33`,
              whiteSpace: "nowrap",
            }}
          >
            {pill.label}
          </span>
        </div>

        {/* Terms hash */}
        <p className="mono" style={{ fontSize: "0.7rem", color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {deal.termsHash.slice(0, 20)}…
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <Stat label="Price" value={formatUsdc(deal.priceUsdc)} />
          <Stat label="Stake" value={formatUsdc(deal.stake)} />
          <Stat label="Deadline" value={formatDeadline(deal.deadline)} />
          <LiveCountdown deadline={deal.deadline} settled={deal.settled} />
        </div>

        {/* Parties */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <PartyTag role="Seller" addr={deal.seller} attested={deal.sellerAttested} />
          {hasBuyer
            ? <PartyTag role="Buyer" addr={deal.buyer} attested={deal.buyerAttested} />
            : <span style={{ fontSize: "0.75rem", color: "var(--subtle)" }}>Waiting for buyer…</span>
          }
        </div>
      </article>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--subtle)" }}>{label}</span>
      <span className="tabular" style={{ fontSize: "0.88rem", color: "var(--ink-2)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function PartyTag({ role, addr, attested }: { role: string; addr: string; attested: boolean }) {
  return (
    <div
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: "var(--surface-muted)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-pill)", padding: "3px 9px",
      }}
    >
      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{role}</span>
      <span className="mono" style={{ fontSize: "0.72rem", color: "var(--ink-2)" }}>{shortAddr(addr)}</span>
      {attested && <span style={{ fontSize: "0.65rem", color: "var(--accent)", fontWeight: 700 }}>attested</span>}
    </div>
  );
}
