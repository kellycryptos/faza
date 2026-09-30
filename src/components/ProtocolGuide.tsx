"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { arcMainnet, arcTestnet } from "@/lib/arc";
import { useNetwork } from "@/context/NetworkContext";

export function ProtocolGuide() {
  const [open, setOpen] = useState(false);
  const { isConnected } = useAccount();
  const { network, isMainnet, isTestnet, setNetwork } = useNetwork();

  return (
    <div
      style={{
        background: isTestnet
          ? "linear-gradient(135deg, rgba(35, 26, 12, 0.45) 0%, rgba(20, 16, 10, 0.6) 100%)"
          : "linear-gradient(135deg, rgba(18, 52, 90, 0.4) 0%, rgba(13, 27, 47, 0.6) 100%)",
        border: isTestnet
          ? "1px solid rgba(245, 166, 35, 0.35)"
          : "1px solid rgba(46, 230, 166, 0.35)",
        borderRadius: "var(--radius-card)",
        padding: "1rem 1.25rem",
        marginBottom: "1.75rem",
        boxShadow: isTestnet
          ? "0 0 24px rgba(245, 166, 35, 0.06)"
          : "0 0 24px rgba(46, 230, 166, 0.08)",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Clickable Accordion Header */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls="protocol-guide-accordion"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "3px 9px",
              borderRadius: "var(--radius-pill)",
              background: isTestnet ? "rgba(245, 166, 35, 0.15)" : "var(--accent-dim)",
              color: isTestnet ? "var(--amber)" : "var(--accent)",
              border: isTestnet
                ? "1px solid rgba(245, 166, 35, 0.3)"
                : "1px solid rgba(46, 230, 166, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isTestnet ? "var(--amber)" : "var(--accent)",
                boxShadow: isTestnet ? "0 0 6px rgba(245, 166, 35, 0.6)" : "0 0 6px var(--accent-glow)",
              }}
            />
            Protocol Architecture
          </span>
          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)" }}>
            How Faza Works & Live Contracts
          </span>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: open
              ? "rgba(255,255,255,0.08)"
              : isTestnet
              ? "rgba(245, 166, 35, 0.18)"
              : "var(--accent)",
            color: open
              ? "var(--ink)"
              : isTestnet
              ? "var(--amber)"
              : "#07080B",
            border: open
              ? "1px solid var(--border)"
              : isTestnet
              ? "1px solid rgba(245, 166, 35, 0.4)"
              : "none",
            borderRadius: "var(--radius-btn)",
            padding: "0.35rem 0.85rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            transition: "all 0.15s ease",
          }}
        >
          <span>{open ? "Hide guide" : "Protocol Guide"}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "inline-block",
              flexShrink: 0,
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Expandable Accordion Body */}
      {open && (
        <div
          id="protocol-guide-accordion"
          style={{
            marginTop: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
            Faza is an autonomous bilateral coordination and settlement protocol built for{" "}
            <strong>Arc Mainnet</strong> (with Arc Testnet sandbox support) where{" "}
            <strong>USDC functions as the native gas token</strong>. Two wallets lock USDC, commit to identical terms,
            and settle purely onchain with zero intermediary custody.
          </p>

          {/* 3 Step Walkthrough */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0.85rem 1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--accent)" }}>1.</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)" }}>Gas & Settlement</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                <strong style={{ color: "var(--ink)" }}>Arc Mainnet:</strong> Bridge USDC via{" "}
                <a
                  href="https://bridge.arc.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "underline" }}
                >
                  bridge.arc.io
                </a>
                . Gas is fractions of a cent paid directly in USDC.
                <br />
                <span style={{ color: "var(--subtle)" }}>
                  <strong>Testnet Sandbox:</strong> Test tokens available from{" "}
                  <a
                    href="https://faucet.circle.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--muted)", textDecoration: "underline" }}
                  >
                    Circle Faucet
                  </a>
                  .
                </span>
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0.85rem 1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--accent)" }}>2.</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)" }}>Show-up Bonds</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                Wallet A locks a USDC stake ($0.01–$100) and sets a deadline. Wallet B joins with matching stake.
                Both check in before deadline to unlock refund. If one party ghosts, the one who checked in claims both stakes.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0.85rem 1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--accent)" }}>3.</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)" }}>OTC Deal Tickets</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                Seller commits a term sheet hashed onchain (keccak256). Buyer joins with identical hash.
                For Arc ERC-20 tokens, settles atomic delivery vs USDC payment. For offchain transfers, locks a mutual USDC bond.
              </p>
            </div>
          </div>

          {/* Onchain verification row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              fontSize: "0.75rem",
            }}
          >
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ color: isMainnet ? "var(--accent)" : "var(--subtle)", fontWeight: 700 }}>
                {isMainnet ? "▶ Mainnet Contracts (Active):" : "Mainnet Contracts (5042):"}
              </span>
              <a
                href="https://explorer.arc.io/address/0x3e925db0bdcb64991f21a8c32b778c3265b349df"
                target="_blank"
                rel="noopener noreferrer"
                className="mono"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                FazaBond ↗
              </a>
              <a
                href="https://explorer.arc.io/address/0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2"
                target="_blank"
                rel="noopener noreferrer"
                className="mono"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                FazaOTC ↗
              </a>

              <span style={{ color: "var(--border-strong)" }}>|</span>

              <span style={{ color: isTestnet ? "var(--amber)" : "var(--subtle)", fontWeight: 700 }}>
                {isTestnet ? "▶ Testnet Contracts (Active):" : "Testnet (Sandbox):"}
              </span>
              <a
                href="https://explorer.testnet.arc.io/address/0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221"
                target="_blank"
                rel="noopener noreferrer"
                className="mono"
                style={{ color: isTestnet ? "var(--amber)" : "var(--muted)", textDecoration: "none" }}
              >
                FazaBond ↗
              </a>
              <a
                href="https://explorer.testnet.arc.io/address/0xe49a617643c87017daa0ed62ea28317710e6c912"
                target="_blank"
                rel="noopener noreferrer"
                className="mono"
                style={{ color: isTestnet ? "var(--amber)" : "var(--muted)", textDecoration: "none" }}
              >
                FazaOTC ↗
              </a>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isTestnet ? (
                <>
                  <span style={{ color: "var(--amber)", fontWeight: 600 }}>Active View: <strong>Arc Testnet (Sandbox)</strong></span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNetwork("mainnet");
                    }}
                    style={{
                      background: "var(--accent)",
                      color: "#07080B",
                      border: "none",
                      borderRadius: "var(--radius-btn)",
                      padding: "3px 9px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Switch to Mainnet
                  </button>
                </>
              ) : (
                <>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                    Active View: Arc Mainnet (5042 Live)
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNetwork("testnet");
                    }}
                    style={{
                      background: "rgba(245, 166, 35, 0.15)",
                      color: "var(--amber)",
                      border: "1px solid rgba(245, 166, 35, 0.35)",
                      borderRadius: "var(--radius-btn)",
                      padding: "3px 9px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    View Testnet Sandbox
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
