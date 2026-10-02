import type { Metadata } from "next";
import Link from "next/link";
import { FazaLogo } from "@/components/FazaLogo";

export const metadata: Metadata = {
  title: "Terms of Service & Protocol Disclaimers — Faza",
  description:
    "Terms of Service, non-custodial smart contract disclosure, assumption of risk, and privacy notice for Faza Protocol on Arc.",
};

const MAINNET_BOND = "0x3e925db0bdcb64991f21a8c32b778c3265b349df";
const MAINNET_OTC = "0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2";
const TESTNET_BOND = "0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221";
const TESTNET_OTC = "0xe49a617643c87017daa0ed62ea28317710e6c912";
const ARC_USDC = "0x3600000000000000000000000000000000000000";

const sections = [
  { id: "nature", label: "1. Non-Custodial Nature" },
  { id: "instruments", label: "2. Protocol Instruments" },
  { id: "gas-settlement", label: "3. Arc & USDC Gas" },
  { id: "pull-payment", label: "4. Pull-Payment Withdrawals" },
  { id: "risks", label: "5. Assumption of Risk" },
  { id: "no-advice", label: "6. No Financial Advice" },
  { id: "disclaimers", label: "7. Disclaimer of Warranties" },
  { id: "liability", label: "8. Limitation of Liability" },
  { id: "privacy", label: "9. Privacy & Public Ledger" },
  { id: "prohibited", label: "10. Prohibited Uses" },
];

export default function TermsPage() {
  return (
    <div
      style={{
        maxWidth: 780,
        margin: "0 auto",
        padding: "3rem 1.25rem 6rem",
        display: "flex",
        flexDirection: "column",
        gap: "2.5rem",
      }}
    >
      {/* Header */}
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
          <FazaLogo size={32} showText={true} badge="Legal" />
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
          Protocol Terms & Legal Framework
        </p>

        <h1
          className="display"
          style={{
            fontSize: "2.25rem",
            fontWeight: 800,
            color: "var(--ink)",
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
          }}
        >
          Terms of Service & Risk Disclosure
        </h1>

        <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginTop: "0.75rem", lineHeight: 1.6 }}>
          Last modified: <strong>October 2026</strong> · Deployed to Arc Mainnet (Chain ID 5042) &amp; Arc Testnet (Chain ID 5042002).
        </p>
      </div>

      {/* Summary Highlights Card */}
      <section
        style={{
          background: "linear-gradient(180deg, rgba(46, 230, 166, 0.06) 0%, rgba(16, 20, 28, 0.95) 100%)",
          border: "1px solid rgba(46, 230, 166, 0.3)",
          borderRadius: "var(--radius-card)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1rem" }}>⚡</span>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent)", margin: 0, letterSpacing: "0.02em" }}>
            Summary of Critical Protocol Terms
          </h2>
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.25rem",
            color: "var(--ink-2)",
            fontSize: "0.88rem",
            lineHeight: 1.7,
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          <li>
            <strong>Non-Custodial:</strong> Faza is autonomous smart contract software. We never hold, intermediate, or control your private keys, USDC, or escrowed stakes.
          </li>
          <li>
            <strong>Irreversible Onchain Settlement:</strong> Once a bond or OTC deal is executed, checked in, attested, or settled on Arc, transactions cannot be reversed, paused, or altered by any party or admin.
          </li>
          <li>
            <strong>USDC Native Gas:</strong> On Arc Network, native gas fees are paid in USDC. All stakes, collateral, and payouts are denominated in 6-decimal ERC-20 USDC.
          </li>
          <li>
            <strong>Pull-Payment Architecture:</strong> Settled funds and forfeit stakes are credited to your address onchain and must be withdrawn using the <code>claim()</code> function.
          </li>
          <li>
            <strong>Self-Directed Risk:</strong> You are solely responsible for verifying counterparty wallet addresses, deadline timestamps, terms hashes, and compliance with your local laws.
          </li>
        </ul>
      </section>

      {/* Quick Nav Anchors */}
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1rem",
        }}
      >
        <span
          style={{
            width: "100%",
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--subtle)",
            marginBottom: "0.25rem",
          }}
        >
          Table of Contents
        </span>
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--ink-2)",
              textDecoration: "none",
              padding: "4px 10px",
              background: "var(--surface-muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-pill)",
              transition: "all 0.15s ease",
            }}
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* Section 1 */}
      <section
        id="nature"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          1. Non-Custodial Nature &amp; Acceptance
        </h2>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          By accessing the Faza web interface (<code>faza-v1.vercel.app</code> or any mirror), interacting with the Faza smart contracts on the Arc Network, or connecting a Web3 wallet, you acknowledge and agree to be bound by these Terms of Service. If you do not agree to these terms, do not connect your wallet or initiate any transactions.
        </p>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          Faza is not an exchange, bank, broker, escrow agent, or financial institution. Faza provides decentralized, peer-to-peer smart contract templates allowing two independent wallets to coordinate commitments and execute bilateral atomic settlements on the Arc blockchain. All operations are decentralized and non-custodial.
        </p>
      </section>

      {/* Section 2 */}
      <section
        id="instruments"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          2. Protocol Instruments: Show-Up Bonds &amp; OTC Tickets
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>
            2.1 Show-Up Bonds (FazaBond)
          </h3>
          <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
            A Show-Up Bond is a bilateral commitment mechanism. Party A locks a specified USDC stake and sets an immutable unix timestamp deadline. Party B joins by locking an equal USDC stake. Both parties must call <code>checkIn()</code> before the deadline expires. Upon calling <code>settle()</code>:
          </p>
          <ul style={{ paddingLeft: "1.25rem", fontSize: "0.86rem", color: "var(--ink-2)", lineHeight: 1.6 }}>
            <li>If both parties check in: each party receives 100% of their stake back.</li>
            <li>If only one party checks in: the compliant party wins the entire pot (both stakes).</li>
            <li>If neither party checks in: both stakes are returned to their respective depositors.</li>
            <li>If an unjoined bond expires: the creator may cancel and reclaim 100% of their initial stake.</li>
          </ul>

          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--amber)", margin: "0.5rem 0 0" }}>
            2.2 Cryptographic OTC Deal Tickets (FazaOTC)
          </h3>
          <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
            An OTC Deal Ticket binds an off-chain delivery agreement to a deterministic onchain escrow. The deal parameters are hashed using <code>keccak256</code> to produce an immutable <code>termsHash</code>. Counterparties join by matching this terms hash and depositing equal stakes. The buyer attests to payment or physical delivery, and the seller confirms execution, settling the ticket autonomously without trusted middlemen.
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section
        id="gas-settlement"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          3. Arc Network Architecture &amp; Native USDC Gas
        </h2>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          Faza smart contracts run natively on <strong>Arc</strong> (Chain ID 5042 on Mainnet, 5042002 on Testnet). On Arc, native gas is paid directly in USDC via Circle&apos;s native predeploy contract (<code>0x3600000000000000000000000000000000000000</code>).
        </p>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          Users do not need to acquire volatile secondary gas tokens (like ETH, SOL, or MATIC). However, you must maintain a sufficient balance of native USDC in your wallet to cover sub-cent transaction gas fees. The protocol is not responsible for failed transactions caused by gas starvation or network congestion.
        </p>
      </section>

      {/* Section 4 */}
      <section
        id="pull-payment"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          4. Pull-Payment Security Pattern (&quot;Claim&quot;)
        </h2>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          To prevent denial-of-service (DoS) attacks and reentrancy vulnerabilities, Faza implements the industry-standard <strong>Pull-Over-Push</strong> payment architecture. When a bond or deal settles, the contract updates an internal balance mapping: <code>claimable[userAddress]</code>.
        </p>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          Funds are not automatically pushed to your wallet during settlement. To withdraw your proceeds or refunded stakes to your external wallet, you must initiate a withdrawal transaction via the <code>claim()</code> method or using the &quot;Claim / Withdraw&quot; banner in the Faza interface.
        </p>
      </section>

      {/* Section 5 */}
      <section
        id="risks"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--danger)", margin: 0 }}>
          5. Assumption of Risk &amp; Bilateral Default
        </h2>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          Engaging in decentralized bilateral contracts involves significant financial and operational risks:
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
            gap: "0.4rem",
          }}
        >
          <li>
            <strong>Stake Forfeiture:</strong> If you fail to call <code>checkIn()</code> before the strict deadline timestamp for any reason (including forgotten passwords, internet outages, or browser failures), your stake will be permanently forfeited to your counterparty.
          </li>
          <li>
            <strong>Smart Contract Vulnerabilities:</strong> While the contracts follow standard Solidity security practices, no software is infallible. Undiscovered bugs, compiler issues, or blockchain node exploits could result in lost funds.
          </li>
          <li>
            <strong>Block Timestamp Variance:</strong> Onchain timestamps rely on block headers. Miners or validators may experience minor timestamp variations. Users should ensure deadlines provide adequate margin for settlement.
          </li>
          <li>
            <strong>Counterparty Performance:</strong> Faza verifies onchain stake locking and cryptographic signatures. It cannot independently inspect physical goods, external off-chain wire transfers, or subjective meeting attendance.
          </li>
        </ul>
      </section>

      {/* Section 6 & 7 */}
      <section
        id="no-advice"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          6. No Investment or Financial Advice
        </h2>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          Nothing on the Faza website, smart contracts, documentation, or social channels constitutes financial, legal, tax, or investment advice. Faza is solely an open protocol for bilateral commitments. You are solely responsible for determining whether any commitment or OTC arrangement is appropriate for your financial situation.
        </p>
      </section>

      {/* Section 7 */}
      <section
        id="disclaimers"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          7. Disclaimer of Warranties
        </h2>
        <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0, textTransform: "uppercase", letterSpacing: "0.02em" }}>
          THE PROTOCOL, INTERFACE, SMART CONTRACTS, AND ALL ASSOCIATED SERVICES ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, OR UNINTERRUPTED ERROR-FREE PERFORMANCE.
        </p>
      </section>

      {/* Section 8 */}
      <section
        id="liability"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          8. Limitation of Liability
        </h2>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          Under no circumstances shall the creators, developers, contributors, or affiliated entities of Faza be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, digital assets, USDC, or goodwill, arising out of or in connection with your access to, use of, or inability to use the protocol.
        </p>
      </section>

      {/* Section 9 */}
      <section
        id="privacy"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.1rem" }}>🔒</span>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
            9. Privacy Policy &amp; Public Onchain Data
          </h2>
        </div>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          Faza is privacy-first and does not collect or store personal identifiable information (PII):
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
            gap: "0.4rem",
          }}
        >
          <li>
            <strong>No Tracking / No Cookies:</strong> The Faza interface does not use tracking cookies, analytics trackers, or user behavioral profiling scripts.
          </li>
          <li>
            <strong>Public Blockchain Transparency:</strong> When you connect your wallet and execute a transaction, your public wallet address, transaction hash, stake amount, and timestamp are broadcasted to the decentralized Arc Network. Blockchain data is inherently public and permanent.
          </li>
          <li>
            <strong>Local Storage:</strong> The interface saves your preferred network view (Mainnet vs. Testnet) locally on your device in your browser&apos;s localStorage for convenience.
          </li>
        </ul>
      </section>

      {/* Section 10 */}
      <section
        id="prohibited"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
          10. Prohibited Uses &amp; Sanctions Compliance
        </h2>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          You represent and warrant that you are not a resident of, or located in, any country subject to comprehensive international sanctions (including OFAC, EU, or UN sanctions lists), nor are you an individual or entity on any restricted party list.
        </p>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--ink-2)", margin: 0 }}>
          You agree not to use Faza for money laundering, financing terrorism, sanctions evasion, illegal gambling, fraud, or any unlawful commercial trade.
        </p>
      </section>

      {/* Deployed Smart Contract Reference Table */}
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
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)", margin: 0 }}>
            Official Smart Contract Directory
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "0.25rem" }}>
            Verify you are interacting solely with genuine Faza smart contracts on Arc Network:
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <ContractEntry
            network="Arc Mainnet (Chain ID 5042)"
            name="FazaBond"
            address={MAINNET_BOND}
            explorer="https://explorer.arc.io"
          />
          <ContractEntry
            network="Arc Mainnet (Chain ID 5042)"
            name="FazaOTC"
            address={MAINNET_OTC}
            explorer="https://explorer.arc.io"
          />
          <ContractEntry
            network="Arc Testnet (Chain ID 5042002)"
            name="FazaBond"
            address={TESTNET_BOND}
            explorer="https://explorer.testnet.arc.io"
          />
          <ContractEntry
            network="Arc Testnet (Chain ID 5042002)"
            name="FazaOTC"
            address={TESTNET_OTC}
            explorer="https://explorer.testnet.arc.io"
          />
          <ContractEntry
            network="All Arc Networks"
            name="USDC Predeploy (Gas & Settlement)"
            address={ARC_USDC}
            explorer="https://explorer.arc.io"
          />
        </div>
      </section>

      {/* Return to App CTA */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          padding: "1.5rem",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
        }}
      >
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)" }}>
            Ready to lock a bilateral commitment?
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
            Create a Show-up Bond or OTC Ticket in seconds with native USDC.
          </div>
        </div>
        <Link
          href="/"
          style={{
            background: "var(--accent)",
            color: "#050B14",
            padding: "0.5rem 1.25rem",
            borderRadius: "var(--radius-pill)",
            fontSize: "0.85rem",
            fontWeight: 700,
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Launch Protocol App →
        </Link>
      </div>
    </div>
  );
}

function ContractEntry({
  network,
  name,
  address,
  explorer,
}: {
  network: string;
  name: string;
  address: string;
  explorer: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        padding: "0.65rem 0.85rem",
        background: "var(--surface-muted)",
        border: "1px solid var(--border)",
        borderRadius: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ink)" }}>{name}</span>
        <span style={{ fontSize: "0.68rem", color: "var(--subtle)" }}>{network}</span>
      </div>
      <a
        href={`${explorer}/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mono"
        style={{
          fontSize: "0.76rem",
          color: "var(--accent)",
          textDecoration: "none",
          wordBreak: "break-all",
        }}
      >
        {address} ↗
      </a>
    </div>
  );
}
