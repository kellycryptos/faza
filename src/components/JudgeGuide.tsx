"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { arcMainnet, arcTestnet } from "@/lib/arc";
import { getFazaBondAddress } from "@/lib/contract";
import { getFazaOtcAddress } from "@/lib/otc-contract";

export function JudgeGuide() {
  const [open, setOpen] = useState(false);
  const { chainId } = useAccount();

  const isMainnet = chainId === arcMainnet.id;
  const bondAddr = getFazaBondAddress(chainId ?? arcMainnet.id);
  const otcAddr = getFazaOtcAddress(chainId ?? arcMainnet.id);

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
            DoraHacks Arc Microgrants
          </span>
          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)" }}>
            Judge Quick Tour & Verification
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
          {open ? "Hide guide ▲" : "60-Second Test Path ▼"}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>
            Faza is an onchain show-up bond and OTC coordination protocol built specifically for{" "}
            <strong>Arc Mainnet</strong> and <strong>Arc Testnet</strong> where <strong>USDC is the native gas asset</strong>.
          </p>

          {/* Test steps */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0.75rem",
            }}
          >
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
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)" }}>Get Gas / USDC</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                Testnet:{" "}
                <a
                  href="https://faucet.circle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "underline" }}
                >
                  Circle Faucet
                </a>{" "}
                (free testnet USDC).
                <br />
                Mainnet:{" "}
                <a
                  href="https://bridge.arc.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "underline" }}
                >
                  Arc Bridge
                </a>{" "}
                (gas is fractions of a cent).
              </p>
            </div>

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
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)" }}>Test a Show-up Bond</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                Click <strong>New bond</strong>, stake $0.10, deadline 15m. Copy URL into second wallet/incognito, click{" "}
                <strong>Join</strong>, check in, and settle!
              </p>
            </div>

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
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)" }}>Inspect OTC Ticket</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                Commit terms with live onchain keccak256 hash. Buyer verifies & joins matching terms without intermediary risk.
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
              <span style={{ color: "var(--subtle)", fontWeight: 600 }}>Verified Mainnet Contracts:</span>
              <a
                href="https://explorer.arc.io/address/0x3e925db0bdcb64991f21a8c32b778c3265b349df"
                target="_blank"
                rel="noopener noreferrer"
                className="mono"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                FazaBond (5042) ↗
              </a>
              <a
                href="https://explorer.arc.io/address/0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2"
                target="_blank"
                rel="noopener noreferrer"
                className="mono"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                FazaOTC (5042) ↗
              </a>
            </div>

            <span style={{ color: "var(--subtle)" }}>
              Network: <strong>{isMainnet ? "Arc Mainnet (5042)" : "Arc Testnet (5042002)"}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
