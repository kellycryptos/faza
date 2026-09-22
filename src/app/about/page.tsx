import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Faza",
  description:
    "Faza is an onchain ticket for two-party deals on Arc. Show-up bonds and OTC deal tickets, both settled in USDC.",
};

const BOND_ADDR = process.env.NEXT_PUBLIC_FAZABOND_ADDRESS ?? "";
const OTC_ADDR = process.env.NEXT_PUBLIC_FAZAOTC_ADDRESS ?? "";

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
          Arc is where USDC is the native gas token — no separate ETH to bridge or buy.
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
          <strong>Judge path — Bond:</strong> Connect Wallet A to Arc Testnet, click{" "}
          <strong>New bond</strong> on the Bonds tab, stake $0.50 USDC, set a deadline
          30 minutes out. Copy the bond URL. Open it in a second browser profile with{" "}
          Wallet B. Wallet B clicks <strong>Join</strong>. Both wallets click{" "}
          <strong>Check in</strong>. After the deadline, either wallet clicks{" "}
          <strong>Settle</strong>, then <strong>Claim</strong>. Both stakes return.
          You have two explorer links.
        </p>

        <p>
          <strong>Judge path — OTC (offchain bond):</strong> Click <strong>New OTC deal</strong>{" "}
          on the OTC tab. Leave asset blank (offchain). Paste a term sheet, note the hash.
          Wallet B joins with the same hash — if the hashes differ the contract reverts.
          Both wallets click <strong>Attest</strong>, then <strong>Confirm done</strong>.
          After the deadline, either wallet settles. Both stakes return.
        </p>

        <p>
          No token, no DAO, no order book, no price feed. Just USDC, Arc, a deadline,
          and the party that did not show up losing the stake.
        </p>
      </div>

      {/* Contracts card */}
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
          Contracts · Arc Testnet
        </p>

        <ContractRow label="FazaBond" addr={BOND_ADDR} />
        <ContractRow label="FazaOTC" addr={OTC_ADDR} />

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

function ContractRow({ label, addr }: { label: string; addr: string }) {
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
          href={`https://explorer.testnet.arc.io/address/${addr}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "0.82rem", color: "var(--accent)", wordBreak: "break-all" }}
        >
          {addr}
        </a>
      ) : (
        <span className="mono" style={{ fontSize: "0.8rem", color: "var(--subtle)" }}>
          not set — add NEXT_PUBLIC_{label.toUpperCase().replace(/[^A-Z]/g, "_")}_ADDRESS to .env
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
