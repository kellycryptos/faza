import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Faza",
  description: "A two-party show-up bond on Arc. Stake USDC. Check in. Or lose it.",
};

const CONTRACT = process.env.NEXT_PUBLIC_FAZABOND_ADDRESS ?? "";

export default function AboutPage() {
  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "3rem 1.25rem 5rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "0.75rem",
          }}
        >
          About
        </p>
        <h1
          className="display"
          style={{ fontSize: "2rem", fontWeight: 800, color: "var(--ink)", margin: 0 }}
        >
          What is Faza?
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          fontSize: "0.975rem",
          lineHeight: 1.75,
          color: "var(--ink-2)",
        }}
      >
        <p>
          Faza is a two-party show-up bond: one wallet opens a bond with a title, a
          deadline, and a USDC stake; a second wallet joins and locks the same amount;
          both wallets check in onchain before the deadline, and each gets their stake
          back — if one ghosts, the other takes both stakes.
        </p>

        <p>
          It runs on Arc, where USDC is the native gas token. There is no separate ETH
          to bridge or buy. Gas fees are stable and measured in fractions of a cent, so
          a $0.01 stake is not eaten by gas before it settles. That makes tiny
          coordination bonds practical for the first time.
        </p>

        <p>
          Every action — create, join, checkIn, settle — is a real on-chain transaction
          against the{" "}
          <span className="mono" style={{ fontSize: "0.875rem" }}>FazaBond</span>{" "}
          contract. Settlement outcome is determined entirely by the contract logic. No
          server can override it, and nothing unlocks without a confirmed transaction.
        </p>

        <p>
          To see it live: connect <strong>Wallet A</strong> to Arc Testnet, click{" "}
          <strong>New bond</strong>, set a title, stake $0.50 USDC, and a deadline
          30 minutes out. Copy the bond URL and open it in a second browser profile with{" "}
          <strong>Wallet B</strong>. Wallet B joins. Both wallets click{" "}
          <strong>Check in</strong>. After the deadline, either wallet clicks{" "}
          <strong>Settle</strong> — the contract refunds both stakes and generates two
          explorer links you can share with a judge.
        </p>

        <p>
          For the ghost scenario: create a bond, join from Wallet B, but only check
          in from one wallet. After the deadline, settle — the wallet that checked in
          receives both stakes, provably, onchain, with no intermediary.
        </p>

        <p>
          No token, no DAO, no feed, no chat — just USDC, Arc, and a deadline.
        </p>
      </div>

      {/* Contract card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
        }}
      >
        <p
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--subtle)",
            margin: 0,
          }}
        >
          Contract · Arc Testnet
        </p>
        {CONTRACT ? (
          <a
            className="mono"
            href={`https://explorer.testnet.arc.io/address/${CONTRACT}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.82rem", color: "var(--accent)", wordBreak: "break-all" }}
          >
            {CONTRACT}
          </a>
        ) : (
          <p className="mono" style={{ fontSize: "0.8rem", color: "var(--subtle)", margin: 0 }}>
            Not deployed — set NEXT_PUBLIC_FAZABOND_ADDRESS in .env
          </p>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.25rem" }}>
          <InfoRow label="USDC" value="0x3600…0000" />
          <InfoRow label="Chain ID" value="5042002" />
          <InfoRow label="Network" value="Arc Testnet" />
        </div>
      </div>

      <Link
        href="/"
        style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}
      >
        ← Back to bonds
      </Link>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <span
        style={{
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--subtle)",
        }}
      >
        {label}
      </span>
      <span className="mono" style={{ fontSize: "0.8rem", color: "var(--ink-2)" }}>
        {value}
      </span>
    </div>
  );
}
