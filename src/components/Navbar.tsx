"use client";

import Link from "next/link";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { activeChain } from "@/lib/arc";

export function Navbar() {
  const { chainId } = useAccount();
  const onRightChain = chainId === activeChain.id;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 60,
        background: "rgba(7,8,11,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 1.25rem",
        gap: "1rem",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          fontSize: "1.1rem",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: "var(--ink)",
          textDecoration: "none",
          flex: 1,
        }}
      >
        Faza
      </Link>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link
          href="/about"
          style={{
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "var(--muted)",
            textDecoration: "none",
          }}
        >
          About
        </Link>
      </nav>

      {/* Chain badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-pill)",
          padding: "3px 10px",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: onRightChain ? "var(--accent)" : "var(--amber)",
            flexShrink: 0,
            boxShadow: onRightChain ? "0 0 6px var(--accent-glow)" : "none",
          }}
        />
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: onRightChain ? "var(--accent)" : "var(--amber)",
            whiteSpace: "nowrap",
          }}
        >
          ARC TESTNET
        </span>
      </div>

      {/* Wallet connect */}
      <ConnectKitButton />
    </header>
  );
}
