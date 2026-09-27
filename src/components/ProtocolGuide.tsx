"use client";

import { useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { arcMainnet, arcTestnet } from "@/lib/arc";

export function ProtocolGuide() {
  const [open, setOpen] = useState(false);
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const isMainnet = chainId === arcMainnet.id;
  const isTestnet = chainId === arcTestnet.id;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(18, 52, 90, 0.4) 0%, rgba(13, 27, 47, 0.6) 100%)",
        border: "1px solid rgba(46, 230, 166, 0.35)",
        borderRadius: "var(--radius-card)",
        padding: "1rem 1.25rem",
        marginBottom: "1.75rem",
        boxShadow: "0 0 24px rgba(46, 230, 166, 0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
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
              background: "var(--accent-dim)",
              color: "var(--accent)",
              border: "1px solid rgba(46, 230, 166, 0.3)",
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
                background: "var(--accent)",
                boxShadow: "0 0 6px var(--accent-glow)",
              }}
            />
            Protocol Architecture
          </span>
          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)" }}>
            How Faza Works & Live Contracts
          </span>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            background: open ? "rgba(255,255,255,0.08)" : "var(--accent)",
            color: open ? "var(--ink)" : "#07080B",
            border: open ? "1px solid var(--border)" : "none",
            borderRadius: "var(--radius-btn)",
            padding: "0.35rem 0.85rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            transition: "all 0.15s ease",
          }}
        >
          {open ? "Hide guide ▲" : "Protocol Guide ▼"}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
            Faza is an autonomous bilateral coordination and settlement protocol built for{" "}
            <strong>Arc Mainnet</strong> (with Arc Testnet sandbox support) where{" "}
            <strong>USDC functions as the native gas token</strong>. Two wallets lock USDC, commit to identical terms,
            and settle purely onchain with zero intermediary custody.
          </p>

          {/* Test steps */}
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
              <span style={{ color: "var(--subtle)", fontWeight: 600 }}>Mainnet Contracts (5042):</span>
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

              <span style={{ color: "var(--subtle)" }}>Testnet (Sandbox):</span>
              <a
                href="https://explorer.testnet.arc.io/address/0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221"
                target="_blank"
                rel="noopener noreferrer"
                className="mono"
                style={{ color: "var(--muted)", textDecoration: "none" }}
              >
                FazaBond ↗
              </a>
              <a
                href="https://explorer.testnet.arc.io/address/0xe49a617643c87017daa0ed62ea28317710e6c912"
                target="_blank"
                rel="noopener noreferrer"
                className="mono"
                style={{ color: "var(--muted)", textDecoration: "none" }}
              >
                FazaOTC ↗
              </a>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isTestnet ? (
                <>
                  <span style={{ color: "var(--amber)" }}>Current: <strong>Arc Testnet (Sandbox)</strong></span>
                  <button
                    onClick={() => switchChain({ chainId: arcMainnet.id })}
                    style={{
                      background: "var(--accent)",
                      color: "#07080B",
                      border: "none",
                      borderRadius: "var(--radius-btn)",
                      padding: "2px 8px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Switch to Mainnet
                  </button>
                </>
              ) : (
                <span style={{ color: isMainnet ? "var(--accent)" : "var(--subtle)", fontWeight: 600 }}>
                  {isMainnet ? "✓ Connected to Arc Mainnet (5042)" : "Arc Mainnet (Chain ID 5042)"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
