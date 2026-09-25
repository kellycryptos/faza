"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { formatUsdc, formatDeadline, formatCountdown, shortAddr } from "@/lib/arc";

export interface BondSummary {
  id: number;
  creator: string;
  joiner: string;
  stake: string;
  deadline: number;
  title: string;
  creatorIn: boolean;
  joinerIn: boolean;
  settled: boolean;
}

type StatusInfo = { label: string; bg: string; color: string };

function getStatus(bond: BondSummary): StatusInfo {
  const now = Math.floor(Date.now() / 1000);
  const noJoiner = !bond.joiner || bond.joiner === "0x0000000000000000000000000000000000000000";
  if (bond.settled) return { label: "Settled", bg: "rgba(90,100,120,0.15)", color: "var(--subtle)" };
  if (noJoiner && now >= bond.deadline) return { label: "Expired", bg: "var(--danger-dim)", color: "var(--danger)" };
  if (noJoiner) return { label: "Open", bg: "var(--accent-dim)", color: "var(--accent)" };
  if (now >= bond.deadline) return { label: "Ready to settle", bg: "var(--amber-dim)", color: "var(--amber)" };
  return { label: "Live", bg: "var(--accent-dim)", color: "var(--accent)" };
}

function Pill({ label, bg, color }: StatusInfo) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: bg,
        color,
        borderRadius: "var(--radius-pill)",
        padding: "2px 9px",
        fontSize: "0.68rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {(label === "Open" || label === "Live") && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: color,
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  );
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
    <span className="tabular" style={{ fontSize: "0.78rem", color: "var(--amber)", fontWeight: 600 }}>
      {label} left
    </span>
  );
}

export function BondCard({ bond }: { bond: BondSummary }) {
  const status = getStatus(bond);
  const hasJoiner = bond.joiner && bond.joiner !== "0x0000000000000000000000000000000000000000";

  return (
    <Link href={`/faza/${bond.id}`} style={{ textDecoration: "none", display: "block" }}>
      <article
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-strong)";
          e.currentTarget.style.background = "#13181F";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.background = "var(--surface)";
        }}
      >
        {/* Top row: title + pill */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <h3
            className="display"
            style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)", margin: 0, flex: 1 }}
          >
            {bond.title}
          </h3>
          <Pill {...status} />
        </div>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            gap: "1.25rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Meta label="Each stakes">
            <span className="tabular" style={{ color: "var(--ink-2)", fontWeight: 600 }}>
              {formatUsdc(bond.stake)}
            </span>
          </Meta>
          <Meta label="Deadline">
            <span style={{ color: "var(--ink-2)" }}>{formatDeadline(bond.deadline)}</span>
          </Meta>
          <LiveCountdown deadline={bond.deadline} settled={bond.settled} />
          <Meta label="Creator">
            <span className="mono" style={{ color: "var(--ink-2)", fontSize: "0.8rem" }}>
              {shortAddr(bond.creator)}
            </span>
          </Meta>
        </div>

        {/* Check-in row */}
        {hasJoiner && (
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <CheckTag label="Creator" checked={bond.creatorIn} />
            <CheckTag label="Joiner" checked={bond.joinerIn} />
          </div>
        )}
      </article>
    </Link>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--subtle)",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function CheckTag({ label, checked }: { label: string; checked: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: checked ? "var(--accent-dim)" : "rgba(90,100,120,0.1)",
        border: `1px solid ${checked ? "rgba(46,230,166,0.25)" : "var(--border)"}`,
        borderRadius: "var(--radius-pill)",
        padding: "2px 9px",
        fontSize: "0.7rem",
        fontWeight: 600,
        color: checked ? "var(--accent)" : "var(--subtle)",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: checked ? "var(--accent)" : "var(--subtle)",
          flexShrink: 0,
        }}
      />
      {label} {checked ? "in" : "pending"}
    </span>
  );
}
