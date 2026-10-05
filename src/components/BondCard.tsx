"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatUsdc, formatDeadline, formatCountdown, shortAddr } from "@/lib/arc";


import { useLanguage } from "@/context/LanguageContext";
import { getTranslation, type Translations } from "@/lib/translations";

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
  isOnchain?: boolean;
}

type StatusInfo = { label: string; bg: string; color: string; dot?: boolean };

function getStatus(bond: BondSummary, t: Translations): StatusInfo {
  if (bond.isOnchain === false) {
    return { label: t.statusTemplate, bg: "rgba(90,100,120,0.15)", color: "var(--subtle)" };
  }
  const now = Math.floor(Date.now() / 1000);
  const noJoiner = !bond.joiner || bond.joiner === "0x0000000000000000000000000000000000000000";
  if (bond.settled) return { label: t.statusSettled, bg: "rgba(90,100,120,0.15)", color: "var(--subtle)" };
  if (noJoiner && now >= bond.deadline) return { label: t.statusExpired, bg: "var(--danger-dim)", color: "var(--danger)" };
  if (noJoiner) return { label: t.statusOpen, bg: "var(--accent-dim)", color: "var(--accent)", dot: true };
  if (now >= bond.deadline) return { label: t.statusReady, bg: "var(--amber-dim)", color: "var(--amber)" };
  return { label: t.statusLive, bg: "var(--accent-dim)", color: "var(--accent)", dot: true };
}

function Pill({ label, bg, color, dot }: StatusInfo) {
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
      {dot && (
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
  const { lang } = useLanguage();
  const [label, setLabel] = useState(() => settled ? "" : formatCountdown(deadline));
  useEffect(() => {
    if (settled) return;
    const id = setInterval(() => setLabel(formatCountdown(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline, settled]);
  if (settled || !label || label === "Ended") return null;
  return (
    <span className="tabular" style={{ fontSize: "0.78rem", color: "var(--amber)", fontWeight: 600 }}>
      {lang === "zh" ? `剩余 ${label}` : `${label} left`}
    </span>
  );
}

import { useNetwork } from "@/context/NetworkContext";

export function BondCard({ bond }: { bond: BondSummary }) {
  const { lang } = useLanguage();
  const t = getTranslation(lang);
  const status = getStatus(bond, t);
  const hasJoiner = bond.joiner && bond.joiner !== "0x0000000000000000000000000000000000000000";
  const { isTestnet } = useNetwork();
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  const now = Math.floor(Date.now() / 1000);
  const isCreator = address && address.toLowerCase() === bond.creator.toLowerCase();
  const isJoiner = address && hasJoiner && address.toLowerCase() === bond.joiner.toLowerCase();
  const needsCheckIn = hasJoiner && !bond.settled && now < bond.deadline && ((isCreator && !bond.creatorIn) || (isJoiner && !bond.joinerIn));

  const handleQuickCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/faza/${bond.id}${isTestnet ? "?network=testnet" : ""}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Link
      href={`/faza/${bond.id}${isTestnet ? "?network=testnet" : ""}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <article
        style={{
          background: "var(--surface)",
          border: isTestnet ? "1px solid rgba(245, 166, 35, 0.25)" : "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = isTestnet ? "var(--amber)" : "var(--border-strong)";
          e.currentTarget.style.background = "#13181F";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isTestnet ? "rgba(245, 166, 35, 0.25)" : "var(--border)";
          e.currentTarget.style.background = "var(--surface)";
        }}
      >
        {/* Top row: title + pills */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, flexWrap: "wrap" }}>
            {isTestnet && (
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: "rgba(245, 166, 35, 0.15)",
                  color: "var(--amber)",
                  border: "1px solid rgba(245, 166, 35, 0.35)",
                }}
              >
                TESTNET
              </span>
            )}
            <h3
              className="display"
              style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}
            >
              {bond.title}
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {needsCheckIn && (
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: "rgba(245, 166, 35, 0.18)",
                  border: "1px solid var(--amber)",
                  color: "var(--amber)",
                  borderRadius: "var(--radius-pill)",
                  padding: "2px 8px",
                  whiteSpace: "nowrap",
                }}
              >
                ⚠️ {t.statusActionNeeded}
              </span>
            )}
            <button
              onClick={handleQuickCopy}
              title="Copy share link"
              style={{
                background: "transparent",
                border: "none",
                color: copied ? "var(--accent)" : "var(--subtle)",
                fontSize: "0.75rem",
                cursor: "pointer",
                padding: "2px 5px",
                borderRadius: 4,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {copied ? "✓" : "🔗"}
            </button>
            <Pill {...status} />
          </div>
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
          <Meta label={t.cardEachStakes}>
            <span className="tabular" style={{ color: "var(--ink-2)", fontWeight: 600 }}>
              {formatUsdc(bond.stake)}
            </span>
          </Meta>
          <Meta label={t.cardDeadline}>
            <span style={{ color: "var(--ink-2)" }}>{formatDeadline(bond.deadline)}</span>
          </Meta>
          <LiveCountdown deadline={bond.deadline} settled={bond.settled} />
          <Meta label={t.cardCreator}>
            <span className="mono" style={{ color: "var(--ink-2)", fontSize: "0.8rem" }}>
              {shortAddr(bond.creator)}
            </span>
          </Meta>
        </div>

        {/* Check-in row */}
        {hasJoiner && (
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <CheckTag label={t.cardCheckInCreator} checked={bond.creatorIn} />
            <CheckTag label={t.cardCheckInJoiner} checked={bond.joinerIn} />
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
