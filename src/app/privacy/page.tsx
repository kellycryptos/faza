import type { Metadata } from "next";
import Link from "next/link";
import { FazaLogo } from "@/components/FazaLogo";

export const metadata: Metadata = {
  title: "Privacy Policy & Onchain Data Notice — Faza",
  description:
    "Privacy policy and onchain public ledger disclosure for Faza Protocol on Arc.",
};

export default function PrivacyPage() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "3rem 1.25rem 6rem",
        display: "flex",
        flexDirection: "column",
        gap: "2.5rem",
      }}
    >
      <div>
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: "1.25rem",
            color: "var(--muted)",
            fontSize: "0.82rem",
            fontWeight: 500,
          }}
        >
          <span>←</span> Back to Protocol App
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
          <FazaLogo size={32} showText={true} badge="Privacy" />
        </div>

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
          Data &amp; Privacy Notice
        </p>

        <h1
          className="display"
          style={{
            fontSize: "2.25rem",
            fontWeight: 800,
            color: "var(--ink)",
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          Privacy Policy &amp; Onchain Notice
        </h1>

        <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginTop: "0.75rem", lineHeight: 1.6 }}>
          Last modified: <strong>October 2026</strong> · Faza Protocol adheres to a strict zero-telemetry, zero-custody standard.
        </p>
      </div>

      {/* Main Card */}
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          1. We Do Not Collect Personal Information
        </h2>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          Faza does not require you to provide your name, email address, physical address, phone number, government ID, or banking details. There are no registration forms, no login accounts, and no KYC databases maintained by Faza.
        </p>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          You access the protocol exclusively through your decentralized Web3 wallet (e.g. MetaMask, Rainbow, Coinbase Wallet, or WalletConnect).
        </p>
      </section>

      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          2. No Tracking, Telemetry, or Third-Party Cookies
        </h2>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          The Faza user interface does not load Google Analytics, Meta Pixel, Hotjar, Mixpanel, or any surveillance ad-tech trackers. We do not sell, rent, or monetize your activity.
        </p>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          Your browser may store local preferences (such as your chosen network toggle: Arc Mainnet vs. Arc Testnet) inside your browser&apos;s own local storage (<code>localStorage</code>). This never leaves your device.
        </p>
      </section>

      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          3. Nature of Public Blockchains
        </h2>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          When you broadcast a transaction to the Arc Network (such as creating a Show-Up Bond, locking USDC stake, attesting to an OTC deal, or claiming rewards), that transaction becomes a permanent, immutable part of the public Arc blockchain ledger.
        </p>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          Public records include:
        </p>
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.25rem",
            color: "var(--ink-2)",
            fontSize: "0.88rem",
            lineHeight: 1.7,
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
          }}
        >
          <li>Your public wallet address (<code>0x...</code>)</li>
          <li>USDC transaction amounts and gas fee expenditures</li>
          <li>Unix timestamp of execution and deadline</li>
          <li>Cryptographic terms hash (<code>keccak256</code>) of OTC tickets</li>
          <li>Smart contract function invocation and event logs</li>
        </ul>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          Public blockchain data cannot be erased, edited, or suppressed by Faza or any single entity.
        </p>
      </section>

      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          4. RPC Nodes &amp; Infrastructure
        </h2>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          When querying smart contract state or sending transactions, your browser connects to public Arc RPC nodes (<code>rpc.mainnet.arc.io</code> or <code>rpc.testnet.arc.io</code>). Standard internet protocol headers (such as your IP address) may be processed by node providers solely to deliver RPC responses, subject to their respective network infrastructure policies.
        </p>
      </section>

      {/* Nav back */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <Link
          href="/terms"
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--accent)",
            textDecoration: "none",
          }}
        >
          Read Terms of Service →
        </Link>
        <span style={{ color: "var(--border-strong)" }}>•</span>
        <Link
          href="/about"
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--ink-2)",
            textDecoration: "none",
          }}
        >
          Protocol Documentation →
        </Link>
      </div>
    </div>
  );
}
