"use client";

import { useState } from "react";
import Link from "next/link";
import { FazaLogo } from "@/components/FazaLogo";
import { useNetwork } from "@/context/NetworkContext";
import { getExplorerAddress, shortAddr } from "@/lib/arc";
import { getFazaBondAddress, FAZABOND_ADDRESS } from "@/lib/contract";
import { getFazaOtcAddress, FAZAOTC_ADDRESS } from "@/lib/otc-contract";

export function Footer() {
  const { network, chainId, isMainnet, isTestnet, setNetwork } = useNetwork();
  const [copiedBond, setCopiedBond] = useState(false);
  const [copiedOtc, setCopiedOtc] = useState(false);

  const bondAddress = getFazaBondAddress(chainId) ?? FAZABOND_ADDRESS;
  const otcAddress = getFazaOtcAddress(chainId) ?? FAZAOTC_ADDRESS;

  const copyToClipboard = (text: string, type: "bond" | "otc") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === "bond") {
        setCopiedBond(true);
        setTimeout(() => setCopiedBond(false), 2000);
      } else {
        setCopiedOtc(true);
        setTimeout(() => setCopiedOtc(false), 2000);
      }
    }
  };

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #07080B 0%, #0A0E17 100%)",
        borderTop: "1px solid var(--border)",
        color: "var(--ink-2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top ambient accent glow line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: isTestnet
            ? "linear-gradient(90deg, transparent 0%, rgba(245, 166, 35, 0.4) 30%, rgba(245, 166, 35, 0.8) 50%, rgba(245, 166, 35, 0.4) 70%, transparent 100%)"
            : "linear-gradient(90deg, transparent 0%, rgba(46, 230, 166, 0.3) 30%, rgba(46, 230, 166, 0.7) 50%, rgba(46, 230, 166, 0.3) 70%, transparent 100%)",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "3.5rem 1.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: "3rem",
        }}
      >
        {/* Main Grid: Brand & Navigation */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "2.5rem 2rem",
          }}
        >
          {/* Brand & Protocol Mission Column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              gridColumn: "span 1",
            }}
          >
            <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
              <FazaLogo size={32} showText={true} />
            </Link>

            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--muted)", margin: 0 }}>
              Autonomous bilateral coordination &amp; cryptographic settlement on Arc. Show-up micro-bonds and OTC deal escrow locked in native USDC.
            </p>

            {/* Live Network & System Status Monitor */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-card)",
                padding: "0.75rem 0.95rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)" }}>
                  Network Status
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: isTestnet ? "var(--amber)" : "var(--accent)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: isTestnet ? "var(--amber)" : "var(--accent)",
                      boxShadow: isTestnet ? "0 0 6px rgba(245,166,35,0.7)" : "0 0 6px var(--accent)",
                      display: "inline-block",
                    }}
                  />
                  {isTestnet ? "Testnet Active" : "Mainnet Live"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem" }}>
                <span style={{ color: "var(--ink)" }}>{isTestnet ? "Arc Testnet (5042002)" : "Arc Mainnet (5042)"}</span>
                <button
                  onClick={() => setNetwork(isTestnet ? "mainnet" : "testnet")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Switch
                </button>
              </div>

              <div style={{ fontSize: "0.7rem", color: "var(--subtle)" }}>
                Settlement &amp; Gas: <strong style={{ color: "var(--ink-2)" }}>USDC Predeploy</strong> (&lt;$0.001/tx)
              </div>
            </div>

            {/* Social Buttons */}
            <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", marginTop: "0.25rem" }}>
              <a
                href="https://github.com/kellycryptos/faza"
                target="_blank"
                rel="noopener noreferrer"
                title="Faza GitHub Repository"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-pill)",
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </a>

              <a
                href="https://x.com/Fazaotc"
                target="_blank"
                rel="noopener noreferrer"
                title="Faza on X"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-pill)",
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>@Fazaotc</span>
              </a>
            </div>
          </div>

          {/* Column 1: Protocol & Products */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              Protocol
            </span>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <li>
                <Link href="/" className="footer-link" style={{ fontSize: "0.84rem" }}>
                  Show-Up Micro-Bonds
                </Link>
              </li>
              <li>
                <Link href="/" className="footer-link" style={{ fontSize: "0.84rem" }}>
                  Bilateral OTC Tickets
                </Link>
              </li>
              <li>
                <Link href="/#claimable-section" className="footer-link" style={{ fontSize: "0.84rem" }}>
                  Withdrawals &amp; Claim Hub
                </Link>
              </li>
              <li>
                <Link href="/about" className="footer-link" style={{ fontSize: "0.84rem" }}>
                  Protocol Whitepaper &amp; Docs
                </Link>
              </li>
              <li>
                <Link href="/about#how-it-works" className="footer-link" style={{ fontSize: "0.84rem" }}>
                  How It Works (Bilateral Lock)
                </Link>
              </li>
              <li>
                <Link href="/about#contracts" className="footer-link" style={{ fontSize: "0.84rem" }}>
                  Verified Contract Registry
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Legal, Terms & Risk (Crucial Pro Section) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              Terms &amp; Disclaimers
            </span>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <li>
                <Link href="/terms" className="footer-link" style={{ fontSize: "0.84rem", fontWeight: 600 }}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/terms#risks" className="footer-link" style={{ fontSize: "0.84rem" }}>
                  Risk Disclosure &amp; Forfeits
                </Link>
              </li>
              <li>
                <Link href="/terms#nature" className="footer-link" style={{ fontSize: "0.84rem" }}>
                  Non-Custodial Architecture
                </Link>
              </li>
              <li>
                <Link href="/terms#disclaimers" className="footer-link" style={{ fontSize: "0.84rem" }}>
                  Protocol Disclaimers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="footer-link" style={{ fontSize: "0.84rem" }}>
                  Privacy &amp; Onchain Notice
                </Link>
              </li>
              <li>
                <Link href="/terms#prohibited" className="footer-link" style={{ fontSize: "0.84rem" }}>
                  Sanctions &amp; Prohibited Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Arc Ecosystem & Contracts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              Arc Network
            </span>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <li>
                <a
                  href="https://explorer.arc.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ fontSize: "0.84rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <span>Arc Mainnet Explorer</span>
                  <span style={{ fontSize: "0.7rem" }}>↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://explorer.testnet.arc.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ fontSize: "0.84rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <span>Arc Testnet Explorer</span>
                  <span style={{ fontSize: "0.7rem" }}>↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://faucet.circle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ fontSize: "0.84rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <span>Circle USDC Faucet</span>
                  <span style={{ fontSize: "0.7rem" }}>↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://docs.arc.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ fontSize: "0.84rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <span>Arc Documentation</span>
                  <span style={{ fontSize: "0.7rem" }}>↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://explorer.arc.io/address/0x3600000000000000000000000000000000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ fontSize: "0.84rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <span>Native USDC Predeploy</span>
                  <span style={{ fontSize: "0.7rem" }}>↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contract Quick-Copy Bar */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-card)",
            padding: "1rem 1.25rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1.25rem",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--subtle)" }}>
              Active Contracts ({isTestnet ? "Testnet" : "Mainnet"}):
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
            {/* Bond Contract Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--surface-muted)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-pill)",
                padding: "3px 10px",
                fontSize: "0.76rem",
              }}
            >
              <span style={{ color: "var(--subtle)", fontWeight: 600 }}>Bond:</span>
              <a
                href={getExplorerAddress(bondAddress, chainId)}
                target="_blank"
                rel="noopener noreferrer"
                translate="no"
                className="mono notranslate"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                {shortAddr(bondAddress)}
              </a>
              <button
                onClick={() => copyToClipboard(bondAddress, "bond")}
                title="Copy FazaBond Address"
                style={{
                  background: "none",
                  border: "none",
                  color: copiedBond ? "var(--accent)" : "var(--subtle)",
                  cursor: "pointer",
                  fontSize: "0.72rem",
                  padding: "0 2px",
                }}
              >
                {copiedBond ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {/* OTC Contract Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--surface-muted)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-pill)",
                padding: "3px 10px",
                fontSize: "0.76rem",
              }}
            >
              <span style={{ color: "var(--subtle)", fontWeight: 600 }}>OTC:</span>
              <a
                href={getExplorerAddress(otcAddress, chainId)}
                target="_blank"
                rel="noopener noreferrer"
                translate="no"
                className="mono notranslate"
                style={{ color: isTestnet ? "var(--amber)" : "var(--accent)", textDecoration: "none" }}
              >
                {shortAddr(otcAddress)}
              </a>
              <button
                onClick={() => copyToClipboard(otcAddress, "otc")}
                title="Copy FazaOTC Address"
                style={{
                  background: "none",
                  border: "none",
                  color: copiedOtc ? "var(--accent)" : "var(--subtle)",
                  cursor: "pointer",
                  fontSize: "0.72rem",
                  padding: "0 2px",
                }}
              >
                {copiedOtc ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div
          style={{
            borderTop: "1px solid rgba(28, 36, 51, 0.6)",
            paddingTop: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              lineHeight: 1.6,
              color: "var(--subtle)",
              margin: 0,
              maxWidth: 960,
            }}
          >
            <strong>Protocol Disclaimer:</strong> Faza is an autonomous, open-source decentralized smart contract protocol on Arc. Smart contracts execute deterministically and irreversibly. Faza does not hold custody of user funds, act as an escrow agent, or provide financial, investment, or legal advice. By connecting your wallet and interacting with the contracts, you agree to the{" "}
            <Link href="/terms" style={{ color: "var(--muted)", textDecoration: "underline" }}>
              Terms of Service
            </Link>
            , acknowledge the{" "}
            <Link href="/terms#risks" style={{ color: "var(--muted)", textDecoration: "underline" }}>
              Risk Disclosures
            </Link>
            , and accept sole responsibility for counterparty evaluation and private key custody.
          </p>

          {/* Bottom Copyright & Quick Legal Anchors */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
              fontSize: "0.75rem",
              color: "var(--subtle)",
            }}
          >
            <div>
              © {new Date().getFullYear()} Faza Protocol. All rights reserved. Open-source under MIT License.
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/terms" className="footer-link">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href="/privacy" className="footer-link">
                Privacy Notice
              </Link>
              <span>•</span>
              <Link href="/terms#risks" className="footer-link">
                Risk Warning
              </Link>
              <span>•</span>
              <Link href="/about" className="footer-link">
                About Protocol
              </Link>
              <span>•</span>
              <a
                href="https://github.com/kellycryptos/faza"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
