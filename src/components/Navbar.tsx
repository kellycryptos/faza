"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain, useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import {
  arcTestnet, arcMainnet, ARC_USDC_ADDRESS,
  isSupportedChain, getChain, formatUsdc,
} from "@/lib/arc";

function NetworkDropdown({ chainId }: { chainId?: number }) {
  const [open, setOpen] = useState(false);
  const { switchChain } = useSwitchChain();
  const ref = useRef<HTMLDivElement>(null);

  const supported = isSupportedChain(chainId);
  const current = getChain(chainId);
  const isMainnet = chainId === arcMainnet.id;
  const isTestnet = chainId === arcTestnet.id;

  const dotColor = !chainId ? "var(--accent)"
    : isMainnet ? "var(--accent)"
    : isTestnet ? "var(--amber)"
    : "#FF494A";

  const label = !chainId ? "ARC MAINNET"
    : isMainnet ? "ARC MAINNET"
    : isTestnet ? "ARC TESTNET"
    : "WRONG NETWORK";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-pill)", padding: "3px 10px",
          cursor: "pointer",
        }}
      >
        <span style={{
          width: 6, height: 6, borderRadius: "50%", background: dotColor,
          flexShrink: 0, boxShadow: isMainnet || !chainId ? "0 0 6px var(--accent-glow)" : "none",
        }} />
        <span style={{
          fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: !chainId || isMainnet ? "var(--accent)" : isTestnet ? "var(--amber)" : "#FF494A",
          whiteSpace: "nowrap",
        }}>
          {label}
        </span>
        <span style={{ color: "var(--subtle)", fontSize: "0.6rem" }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, overflow: "hidden", minWidth: 200, zIndex: 100,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          {/* Mainnet first */}
          {[arcMainnet, arcTestnet].map((chain) => {
            const active = chainId === chain.id;
            const isMain = chain.id === arcMainnet.id;
            return (
              <button
                key={chain.id}
                onClick={() => { switchChain({ chainId: chain.id }); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "0.75rem 1rem",
                  background: active ? "rgba(46,230,166,0.07)" : "transparent",
                  border: "none", cursor: "pointer",
                  borderBottom: isMain ? "1px solid var(--border)" : "none",
                  textAlign: "left",
                }}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                  background: active
                    ? (isMain ? "var(--accent)" : "var(--amber)")
                    : "var(--border-strong)",
                }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--ink)", display: "flex", alignItems: "center", gap: 6 }}>
                    {chain.name}
                    <span style={{
                      fontSize: "0.6rem",
                      background: isMain ? "var(--accent-dim)" : "rgba(245,166,35,0.12)",
                      color: isMain ? "var(--accent)" : "var(--amber)",
                      padding: "1px 5px", borderRadius: 4, fontWeight: 700,
                    }}>
                      {isMain ? "PRIMARY" : "SANDBOX"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--subtle)" }}>
                    {isMain ? "Arc Mainnet · 5042 (Live)" : "Arc Testnet · 5042002"}
                  </div>
                </div>
                {active && (
                  <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: isMain ? "var(--accent)" : "var(--amber)", fontWeight: 700 }}>
                    Active
                  </span>
                )}
              </button>
            );
          })}

          {!supported && chainId && (
            <div style={{ padding: "0.6rem 1rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                onClick={() => { switchChain({ chainId: arcMainnet.id }); setOpen(false); }}
                style={{
                  width: "100%", background: "var(--accent)", color: "#050B14",
                  border: "none", borderRadius: 8, padding: "0.45rem",
                  fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                }}
              >
                Switch to Arc Mainnet (Primary)
              </button>
              <button
                onClick={() => { switchChain({ chainId: arcTestnet.id }); setOpen(false); }}
                style={{
                  width: "100%", background: "transparent", color: "var(--muted)",
                  border: "1px solid var(--border)", borderRadius: 8, padding: "0.35rem",
                  fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                }}
              >
                Switch to Arc Testnet
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UsdcBalance({ address, chainId }: { address?: `0x${string}`; chainId?: number }) {
  const chain = getChain(chainId);
  const { data } = useReadContract({
    address: ARC_USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: chainId,
    query: { enabled: !!address && !!chain, refetchInterval: 10_000 },
  });

  const isTestnet = chainId === arcTestnet.id;

  if (!address || !chain || data === undefined) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: "var(--radius-pill)",
      background: "var(--surface)", border: "1px solid var(--border)",
    }}>
      <span className="tabular" style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--ink-2)" }}>
        {formatUsdc(data as bigint)}
      </span>
      <span style={{ fontSize: "0.68rem", color: "var(--subtle)", fontWeight: 600 }}>USDC</span>
      {isTestnet && (data as bigint) < 1_000_000n && (
        <a
          href="https://faucet.circle.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em",
            color: "var(--accent)", textDecoration: "none",
            background: "rgba(46,230,166,0.1)", padding: "1px 6px",
            borderRadius: 4,
          }}
        >
          Faucet
        </a>
      )}
    </div>
  );
}

export function Navbar() {
  const { address, chainId } = useAccount();

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 60,
        background: "rgba(7,8,11,0.88)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 1.25rem", gap: "0.75rem",
      }}
    >
      <Link href="/" style={{
        fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.04em",
        color: "var(--ink)", textDecoration: "none", flex: 1,
      }}>
        Faza
      </Link>

      <nav style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link href="/about" style={{
          fontSize: "0.85rem", fontWeight: 500, color: "var(--muted)", textDecoration: "none",
        }}>
          About
        </Link>
      </nav>

      <UsdcBalance address={address} chainId={chainId} />
      <NetworkDropdown chainId={chainId} />
      <ConnectButton showBalance={false} chainStatus="none" />
    </header>
  );
}
