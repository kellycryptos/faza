import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Faza",
  description:
    "Faza is an onchain ticket for two-party deals on Arc. Show-up bonds and OTC deal tickets, both settled in USDC.",
};

const MAINNET_BOND = process.env.NEXT_PUBLIC_MAINNET_FAZABOND_ADDRESS || "0x3e925db0bdcb64991f21a8c32b778c3265b349df";
const MAINNET_OTC = process.env.NEXT_PUBLIC_MAINNET_FAZAOTC_ADDRESS || "0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2";

const TESTNET_BOND = process.env.NEXT_PUBLIC_FAZABOND_ADDRESS || "0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221";
const TESTNET_OTC = process.env.NEXT_PUBLIC_FAZAOTC_ADDRESS || "0xe49a617643c87017daa0ed62ea28317710e6c912";

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
          Faza is an onchain ticket for two-party commitments settled in USDC on Arc.
          The first instrument is a show-up bond: both parties stake USDC, check in before
          a deadline, and each gets their stake back. The one who ghosts forfeits their stake
          to the one who showed. The second instrument is an OTC deal ticket: two parties
          commit to a trade, hash the terms onchain, and settle either a live token swap or
          a USDC bond against an offchain transfer.
        </p>

        <p>
          Arc is where USDC is the native gas token — no separate ETH or native token to bridge or buy.
          Gas fees are stable and cost fractions of a cent, so a $0.01 stake or a small
          OTC bond is not eaten by gas before it settles. That makes tiny coordination
          instruments practical for the first time.
        </p>

        <p>
          Every action — create, join, checkIn, attest, confirmDone, settle — is a real
          onchain transaction. Settlement is determined entirely by contract logic in
          <span className="mono" style={{ fontSize: "0.875em" }}> FazaBond</span> and
          <span className="mono" style={{ fontSize: "0.875em" }}> FazaOTC</span>.
          No server can override it, and nothing moves without a confirmed transaction.
          For OTC deals where the asset is an Arc token, the contract does a literal PvP
          swap: tokens go to the buyer, USDC goes to the seller, in one call. For offchain
          stock or any asset that lives outside Arc, the contract holds only the terms hash
          and the USDC bond — the share itself does not teleport.
        </p>

        <p>
          <strong>How to use — Show-up Bond:</strong> Connect your wallet to Arc Mainnet (or Arc Testnet for testing), click{" "}
          <strong>New bond</strong> on the Bonds tab, stake $0.10 USDC (or any amount $0.01–$100), set a deadline.
          Share the bond URL with your counterparty. The second wallet clicks <strong>Join</strong>.
          Both wallets click <strong>Check in</strong> before the deadline.
          After the deadline, either wallet clicks <strong>Settle</strong>, then <strong>Claim</strong>.
          Both stakes return, verified onchain.
        </p>

        <p>
          <strong>How to use — OTC Deal Ticket:</strong> Click <strong>New deal</strong>{" "}
          on the OTC tab. Leave asset blank for offchain agreements, or enter an Arc ERC-20 token address.
          Paste a term sheet, note the cryptographic hash. The buyer joins with the matching hash—if terms differ,
          the contract reverts. Both parties attest and confirm, then settle onchain.
        </p>

        <p>
          No token, no DAO, no order book, no price feed. Just USDC, Arc, a deadline,
          and the party that did not show up losing the stake.
        </p>
      </div>

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
            Live Contracts · Arc Mainnet (Primary)
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

      <Link
        href="/"
        style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}
      >
        ← Back
      </Link>
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
