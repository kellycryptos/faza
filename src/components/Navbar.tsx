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
import { FazaLogo } from "@/components/FazaLogo";
import { BorderBeam } from "border-beam";

import { useNetwork } from "@/context/NetworkContext";

function NetworkDropdown({ walletChainId }: { walletChainId?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { network, chainId, isMainnet, isTestnet, setNetwork } = useNetwork();

  const supported = isSupportedChain(walletChainId);

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
        aria-expanded={open}
        title="Switch network between Arc Mainnet and Arc Testnet"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: isTestnet ? "rgba(245, 166, 35, 0.12)" : "var(--surface)",
          border: isTestnet ? "1px solid rgba(245, 166, 35, 0.45)" : "1px solid var(--border)",
          borderRadius: "var(--radius-pill)",
          padding: "4px 11px",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: isMainnet ? "var(--accent)" : "var(--amber)",
            flexShrink: 0,
            boxShadow: isMainnet ? "0 0 6px var(--accent-glow)" : "0 0 6px rgba(245, 166, 35, 0.6)",
          }}
        />
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: isMainnet ? "var(--accent)" : "var(--amber)",
            whiteSpace: "nowrap",
          }}
        >
          {isMainnet ? "ARC MAINNET" : "ARC TESTNET SANDBOX"}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isMainnet ? "var(--subtle)" : "var(--amber)"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            display: "inline-block",
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#0D1117",
            border: "1px solid var(--border-strong)",
            borderRadius: 14,
            overflow: "hidden",
            minWidth: 230,
            zIndex: 100,
            boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
            padding: "4px",
          }}
        >
          <div style={{ padding: "6px 10px 4px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)" }}>
              Select Network View
            </span>
          </div>

          {/* Mainnet Option */}
          <button
            onClick={() => {
              setNetwork("mainnet");
              setOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "0.75rem 0.85rem",
              background: isMainnet ? "rgba(46,230,166,0.08)" : "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s ease",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                flexShrink: 0,
                background: isMainnet ? "var(--accent)" : "var(--border-strong)",
                boxShadow: isMainnet ? "0 0 6px var(--accent-glow)" : "none",
              }}
            />
            <div style={{ textAlign: "left", flex: 1 }}>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Arc Mainnet
                <span
                  style={{
                    fontSize: "0.6rem",
                    background: "var(--accent-dim)",
                    color: "var(--accent)",
                    padding: "1px 5px",
                    borderRadius: 4,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                  }}
                >
                  LIVE
                </span>
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 2 }}>
                Chain ID 5042 · Real USDC
              </div>
            </div>
            {isMainnet && (
              <span style={{ fontSize: "0.72rem", color: "var(--accent)", fontWeight: 800 }}>
                ✓
              </span>
            )}
          </button>

          {/* Testnet Option */}
          <button
            onClick={() => {
              setNetwork("testnet");
              setOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "0.75rem 0.85rem",
              background: isTestnet ? "rgba(245,166,35,0.08)" : "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s ease",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                flexShrink: 0,
                background: isTestnet ? "var(--amber)" : "var(--border-strong)",
                boxShadow: isTestnet ? "0 0 6px rgba(245,166,35,0.6)" : "none",
              }}
            />
            <div style={{ textAlign: "left", flex: 1 }}>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Arc Testnet Sandbox
                <span
                  style={{
                    fontSize: "0.6rem",
                    background: "rgba(245,166,35,0.15)",
                    color: "var(--amber)",
                    padding: "1px 5px",
                    borderRadius: 4,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                  }}
                >
                  SANDBOX
                </span>
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 2 }}>
                Chain ID 5042002 · Testnet Faucet
              </div>
            </div>
            {isTestnet && (
              <span style={{ fontSize: "0.72rem", color: "var(--amber)", fontWeight: 800 }}>
                ✓
              </span>
            )}
          </button>
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
  const { address, chainId: walletChainId } = useAccount();
  const { chainId: activeChainId } = useNetwork();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 60,
        background: "rgba(7,8,11,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 1.25rem",
        gap: "0.75rem",
      }}
    >
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
          flex: 1,
        }}
      >
        <FazaLogo size={28} showText={true} />
      </Link>

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

      <UsdcBalance address={address} chainId={activeChainId} />
      <NetworkDropdown walletChainId={walletChainId} />
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          if (!ready) {
            return (
              <div
                style={{
                  height: 34,
                  width: 110,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--surface)",
                  opacity: 0.5,
                }}
              />
            );
          }

          if (!connected) {
            return (
              <BorderBeam
                size="pulse-inner"
                colorVariant="ocean"
                borderRadius={9999}
                style={{ display: "inline-flex" }}
              >
                <button
                  onClick={openConnectModal}
                  type="button"
                  style={{
                    background: "var(--accent)",
                    color: "#050B14",
                    border: "none",
                    borderRadius: "var(--radius-pill)",
                    padding: "0.4rem 0.95rem",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  Connect Wallet
                </button>
              </BorderBeam>
            );
          }

          if (chain.unsupported) {
            return (
              <button
                onClick={openChainModal}
                type="button"
                style={{
                  background: "rgba(255, 73, 74, 0.15)",
                  color: "var(--danger)",
                  border: "1px solid rgba(255, 73, 74, 0.4)",
                  borderRadius: "var(--radius-pill)",
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Wrong network
              </button>
            );
          }

          return (
            <button
              onClick={openAccountModal}
              type="button"
              style={{
                background: "var(--surface)",
                color: "var(--ink)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-pill)",
                padding: "0.35rem 0.85rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              />
              {account.displayName}
            </button>
          );
        }}
      </ConnectButton.Custom>
    </header>
  );
}
