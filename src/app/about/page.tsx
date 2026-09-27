import type { Metadata } from "next";
import Link from "next/link";
import { FazaLogo } from "@/components/FazaLogo";

export const metadata: Metadata = {
  title: "About — Faza Protocol",
  description:
    "Faza is an autonomous bilateral coordination and settlement protocol on Arc. Two-party show-up bonds and cryptographic OTC deal tickets settled in native USDC.",
};

const MAINNET_BOND = process.env.NEXT_PUBLIC_MAINNET_FAZABOND_ADDRESS || "0x3e925db0bdcb64991f21a8c32b778c3265b349df";
const MAINNET_OTC = process.env.NEXT_PUBLIC_MAINNET_FAZAOTC_ADDRESS || "0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2";

const TESTNET_BOND = process.env.NEXT_PUBLIC_FAZABOND_ADDRESS || "0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221";
const TESTNET_OTC = process.env.NEXT_PUBLIC_FAZAOTC_ADDRESS || "0xe49a617643c87017daa0ed62ea28317710e6c912";

export default function AboutPage() {
  return (
    <div
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "3rem 1.25rem 5rem",
        display: "flex",
        flexDirection: "column",
        gap: "2.5rem",
      }}
    >
      <div>
        <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}>
          <FazaLogo size={32} showText={true} badge="Protocol" />
        </Link>
        <p
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "0.5rem",
          }}
        >
          Protocol Documentation
        </p>
        <h1
          className="display"
          style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-0.03em" }}
        >
          What is Faza?
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.05rem", marginTop: "0.5rem", lineHeight: 1.6 }}>
          An autonomous bilateral coordination and settlement protocol on Arc Network. Two counterparties lock USDC into smart contract escrow, commit to verified terms, and settle purely onchain.
        </p>
      </div>

      {/* The Problem & Solution */}
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          The Problem We Solved
        </h2>
        <p style={{ fontSize: "0.925rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          In traditional peer-to-peer agreements, there is no financial friction to prevent ghosting or counterparty default. If someone agrees to attend a meeting, complete a delivery, or honor an OTC commitment, failure to follow through carries zero deterministic penalty.
        </p>
        <p style={{ fontSize: "0.925rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          At the same time, establishing escrow on Ethereum or multi-token L2s for small stakes ($1 to $50) is economically unviable due to gas volatility and the need to purchase separate native gas tokens. Faza solves this by running natively on <strong>Arc</strong>, where <strong>USDC is the gas token</strong> and fees cost fractions of a cent.
        </p>
      </section>

      {/* Instrument 1: Show-up Bonds */}
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 800,
              background: "var(--accent-dim)",
              color: "var(--accent)",
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              letterSpacing: "0.08em",
            }}
          >
            INSTRUMENT 01
          </span>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
            Show-Up Bonds (<span className="mono" style={{ fontSize: "0.9em" }}>FazaBond</span>)
          </h2>
        </div>
        <p style={{ fontSize: "0.925rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          A two-wallet mutual stake contract. Both parties lock equal USDC collateral, establish a deadline, and must submit an onchain <span className="mono" style={{ fontSize: "0.85em" }}>checkIn()</span> before time expires.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.85rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>
              ✓ Mutual Attendance
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5 }}>
              Both wallets check in before deadline. 100% of staked capital is refunded to each party.
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.85rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--danger)", marginBottom: 4 }}>
              ✕ Ghosting Penalty
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5 }}>
              If one wallet ghosts, the wallet that checked in claims both stakes (200% payout).
            </div>
          </div>
        </div>
      </section>

      {/* Instrument 2: OTC Deal Tickets */}
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 800,
              background: "rgba(0,240,255,0.12)",
              color: "#00F0FF",
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              letterSpacing: "0.08em",
            }}
          >
            INSTRUMENT 02
          </span>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
            OTC Deal Tickets (<span className="mono" style={{ fontSize: "0.9em" }}>FazaOTC</span>)
          </h2>
        </div>
        <p style={{ fontSize: "0.925rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          A bilateral agreement ticket that hashes commercial terms onchain using <span className="mono" style={{ fontSize: "0.85em" }}>keccak256</span>. The buyer can only enter the contract if their local copy of the terms computes to the identical hash.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.85rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
              1. Atomic Onchain PvP Token Swaps
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
              For Arc ERC-20 tokens: Buyer locks USDC purchase price and collateral stake; seller locks collateral stake. At settlement, the contract executes an atomic exchange: tokens to buyer, USDC to seller. If seller defaults, buyer receives a full refund of price plus both stakes.
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.85rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
              2. Offchain Asset Agreements with Escrowed Bond
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
              For stock certificates, advisory milestones, or private equity: the contract anchors the terms hash and holds a mutual USDC collateral bond. When the offchain exchange completes, counterparties confirm and retrieve their bonds.
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture */}
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          Smart Contract Security Architecture
        </h2>
        <ul style={{ paddingLeft: "1.25rem", margin: 0, fontSize: "0.9rem", color: "var(--ink-2)", lineHeight: 1.7 }}>
          <li>
            <strong>Pull-over-Push Settlement:</strong> Settlement functions credit internal accounting mappings (<span className="mono" style={{ fontSize: "0.85em" }}>claimable[address]</span>) instead of pushing raw transfers. Users claim their funds independently via <span className="mono" style={{ fontSize: "0.85em" }}>claim()</span>, eliminating DoS vectors and reentrancy loops.
          </li>
          <li>
            <strong>OpenZeppelin SafeERC20:</strong> All token transfers utilize standard, battle-tested OpenZeppelin wrappers.
          </li>
          <li>
            <strong>Native Predeploy Integration:</strong> Interacts directly with Arc&apos;s predeployed native USDC contract at <span className="mono" style={{ fontSize: "0.85em" }}>0x3600000000000000000000000000000000000000</span>.
          </li>
          <li>
            <strong>Zero Custodial Override:</strong> No admin keys, no DAO overrides, no upgradeability proxies. All bond resolutions execute deterministically.
          </li>
        </ul>
      </section>

      {/* Mainnet Contracts Card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid rgba(46,230,166,0.35)",
          borderRadius: "var(--radius-card)",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          boxShadow: "0 0 20px rgba(46,230,166,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--accent)",
              margin: 0,
            }}
          >
            Live Contracts · Arc Mainnet (Primary Production)
          </p>
          <span style={{ fontSize: "0.68rem", background: "var(--accent-dim)", color: "var(--accent)", padding: "2px 8px", borderRadius: "var(--radius-pill)", fontWeight: 700 }}>
            LIVE
          </span>
        </div>

        <ContractRow label="FazaBond" addr={MAINNET_BOND} explorerBase="https://explorer.arc.io" />
        <ContractRow label="FazaOTC" addr={MAINNET_OTC} explorerBase="https://explorer.arc.io" />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.25rem" }}>
          <InfoRow label="USDC" value="0x3600…0000" />
          <InfoRow label="Chain ID" value="5042" />
          <InfoRow label="Network" value="Arc Mainnet" />
        </div>
      </div>

      {/* Testnet Contracts Card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
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
          Sandbox Contracts · Arc Testnet (Secondary)
        </p>

        <ContractRow label="FazaBond (Testnet)" addr={TESTNET_BOND} explorerBase="https://explorer.testnet.arc.io" />
        <ContractRow label="FazaOTC (Testnet)" addr={TESTNET_OTC} explorerBase="https://explorer.testnet.arc.io" />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.25rem" }}>
          <InfoRow label="USDC" value="0x3600…0000" />
          <InfoRow label="Chain ID" value="5042002" />
          <InfoRow label="Network" value="Arc Testnet" />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link
          href="/"
          style={{ fontSize: "0.85rem", color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}
        >
          ← Return to App
        </Link>
        <a
          href="https://github.com/kellycryptos/faza"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}
        >
          GitHub Repository ↗
        </a>
      </div>
    </div>
  );
}

function ContractRow({ label, addr, explorerBase }: { label: string; addr: string; explorerBase: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
      {addr ? (
        <a
          className="mono"
          href={`${explorerBase}/address/${addr}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "0.82rem", color: "var(--accent)", wordBreak: "break-all" }}
        >
          {addr}
        </a>
      ) : (
        <span className="mono" style={{ fontSize: "0.8rem", color: "var(--subtle)" }}>
          not deployed
        </span>
      )}
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
