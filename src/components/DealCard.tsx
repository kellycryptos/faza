"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatUsdc, formatDeadline, formatCountdown, shortAddr } from "@/lib/arc";

import { DEAL_STATES, isPvp, type DealSummary } from "@/lib/otc-contract";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslation, type Translations } from "@/lib/translations";

const ZERO = "0x0000000000000000000000000000000000000000";

function dealPill(deal: DealSummary, t: Translations): { label: string; bg: string; fg: string } {
  if (deal.isOnchain === false) {
    return { label: t.statusTemplate, bg: "rgba(90,100,120,0.18)", fg: "var(--subtle)" };
  }
  const now = Math.floor(Date.now() / 1000);
  const state = DEAL_STATES[deal.state] ?? "Unknown";
  if (state === "Settled") return { label: t.statusSettled, bg: "rgba(90,100,120,0.18)", fg: "var(--subtle)" };
  if (state === "Forfeit") return { label: t.statusForfeit, bg: "var(--danger-dim)", fg: "var(--danger)" };
  if (state === "Cancelled") return { label: t.statusCancelled, bg: "rgba(90,100,120,0.18)", fg: "var(--subtle)" };
  if (!deal.buyer || deal.buyer === ZERO) {
    if (now >= deal.deadline) return { label: t.statusExpired, bg: "var(--danger-dim)", fg: "var(--danger)" };
    return { label: t.statusOpen, bg: "var(--accent-dim)", fg: "var(--accent)" };
  }
  if (now >= deal.deadline) return { label: t.statusReady, bg: "rgba(245,166,35,0.12)", fg: "var(--amber)" };
  if (state === "Attested") return { label: t.statusAttested, bg: "var(--accent-dim)", fg: "var(--accent)" };
  return { label: t.statusLive, bg: "rgba(46,230,166,0.08)", fg: "var(--accent)" };
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
    <span style={{ fontSize: "0.75rem", color: "var(--amber)", fontWeight: 600 }}>
      {lang === "zh" ? (
        <>
          <span>剩余 </span>
          <span translate="no" className="notranslate tabular">{label}</span>
        </>
      ) : (
        <>
          <span translate="no" className="notranslate tabular">{label}</span>
          <span> left</span>
        </>
      )}
    </span>
  );
}

import { useNetwork } from "@/context/NetworkContext";

export function DealCard({ deal }: { deal: DealSummary }) {
  const { lang } = useLanguage();
  const t = getTranslation(lang);
  const pill = dealPill(deal, t);
  const pvp = isPvp(deal);
  const hasBuyer = deal.buyer && deal.buyer !== ZERO;
  const { isTestnet } = useNetwork();
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  const now = Math.floor(Date.now() / 1000);
  const isSeller = address && address.toLowerCase() === deal.seller.toLowerCase();
  const isBuyer = address && hasBuyer && address.toLowerCase() === deal.buyer.toLowerCase();
  const needsAction = hasBuyer && !deal.settled && now < deal.deadline && (
    (isSeller && !deal.sellerDone) || (isBuyer && !deal.buyerDone)
  );

  const handleQuickCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/otc/${deal.id}${isTestnet ? "?network=testnet" : ""}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Link
      href={`/otc/${deal.id}${isTestnet ? "?network=testnet" : ""}`}
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
          gap: "0.65rem",
          cursor: "pointer",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = isTestnet ? "var(--amber)" : "var(--border-strong)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = isTestnet ? "rgba(245, 166, 35, 0.25)" : "var(--border)")
        }
      >
        {/* Header row */}
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
            {/* PvP vs Bond label */}
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 800,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                padding: "2px 8px",
                borderRadius: "var(--radius-pill)",
                background: pvp ? "rgba(46,230,166,0.08)" : "rgba(245,166,35,0.08)",
                color: pvp ? "var(--accent)" : "var(--amber)",
                border: `1px solid ${pvp ? "rgba(46,230,166,0.2)" : "rgba(245,166,35,0.2)"}`,
                whiteSpace: "nowrap",
              }}
            >
              {pvp ? t.cardPvP : t.cardBondOnly}
            </span>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--ink)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Deal #{deal.id}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {needsAction && (
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
        </div>

        {/* Terms hash */}
        <p className="mono" style={{ fontSize: "0.7rem", color: "var(--subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {deal.termsHash.slice(0, 20)}…
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <Stat label={t.cardPrice} value={formatUsdc(deal.priceUsdc)} />
          <Stat label={t.cardStake} value={formatUsdc(deal.stake)} />
          <Stat label={t.cardDeadline} value={formatDeadline(deal.deadline)} />
          <LiveCountdown deadline={deal.deadline} settled={deal.settled} />
        </div>

        {/* Parties */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <PartyTag role={t.cardSeller} addr={deal.seller} attested={deal.sellerAttested} />
          {hasBuyer
            ? <PartyTag role={t.cardBuyer} addr={deal.buyer} attested={deal.buyerAttested} />
            : <span style={{ fontSize: "0.75rem", color: "var(--subtle)" }}>{t.cardWaitingBuyer}</span>
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
      <span translate="no" className="notranslate tabular" style={{ fontSize: "0.88rem", color: "var(--ink-2)", fontWeight: 500 }}>{value}</span>
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
      <span translate="no" className="notranslate mono" style={{ fontSize: "0.72rem", color: "var(--ink-2)" }}>{shortAddr(addr)}</span>
      {attested && <span style={{ fontSize: "0.65rem", color: "var(--accent)", fontWeight: 700 }}>attested</span>}
    </div>
  );
}
