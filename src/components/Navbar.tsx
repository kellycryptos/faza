"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import {
  arcTestnet,
  arcMainnet,
  ARC_USDC_ADDRESS,
  isSupportedChain,
  getChain,
  formatUsdc,
  shortAddr,
  getExplorerAddress,
} from "@/lib/arc";
import { FazaLogo } from "@/components/FazaLogo";
import { BorderBeam } from "border-beam";
import { FAZABOND_ABI, getFazaBondAddress, FAZABOND_ADDRESS } from "@/lib/contract";
import { FAZAOTC_ABI, getFazaOtcAddress, FAZAOTC_ADDRESS } from "@/lib/otc-contract";
import { useNetwork } from "@/context/NetworkContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function NetworkDropdown({ walletChainId }: { walletChainId?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { isMainnet, isTestnet, setNetwork } = useNetwork();
  const { lang } = useLanguage();

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
        type="button"
        title="Switch network between Arc Mainnet and Arc Testnet"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: isTestnet ? "rgba(245, 166, 35, 0.12)" : "var(--surface)",
          border: isTestnet ? "1px solid rgba(245, 166, 35, 0.45)" : "1px solid var(--border)",
          borderRadius: "var(--radius-pill)",
          padding: "4px 9px",
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
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: isMainnet ? "var(--accent)" : "var(--amber)",
            whiteSpace: "nowrap",
          }}
        >
          <span className="network-text-desktop">
            {isMainnet ? t("networkMainnet", lang) : t("networkTestnet", lang)}
          </span>
          <span className="network-text-mobile">
            {isMainnet ? "Arc" : "Testnet"}
          </span>
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
            width: "max-content",
            minWidth: 230,
            maxWidth: "min(320px, calc(100vw - 20px))",
            zIndex: 100,
            boxShadow: "0 12px 36px rgba(0,0,0,0.65)",
            padding: "4px",
          }}
        >
          <div style={{ padding: "6px 10px 4px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)" }}>
              {t("selectNetwork", lang)}
            </span>
          </div>

          {/* Mainnet Option */}
          <button
            onClick={() => {
              setNetwork("mainnet");
              setOpen(false);
            }}
            type="button"
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
            type="button"
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

function ClaimableFundsBadge({ address, chainId }: { address?: `0x${string}`; chainId?: number }) {
  const bondContractAddr = getFazaBondAddress(chainId);
  const otcContractAddr = getFazaOtcAddress(chainId);

  const { data: bondClaimable } = useReadContract({
    address: bondContractAddr || undefined,
    abi: FAZABOND_ABI,
    functionName: "claimable",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!address && !!bondContractAddr, refetchInterval: 8000 },
  });

  const { data: otcClaimable } = useReadContract({
    address: otcContractAddr || undefined,
    abi: FAZAOTC_ABI,
    functionName: "claimable",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!address && !!otcContractAddr, refetchInterval: 8000 },
  });

  const total = (bondClaimable ? (bondClaimable as bigint) : 0n) + (otcClaimable ? (otcClaimable as bigint) : 0n);

  if (!address || total <= 0n) return null;

  return (
    <Link
      href="/#claimable-section"
      title="You have settled or refunded stakes ready to withdraw!"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: "var(--radius-pill)",
        background: "rgba(46, 230, 166, 0.12)",
        border: "1px solid var(--accent)",
        color: "var(--accent)",
        fontSize: "0.72rem",
        fontWeight: 700,
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      <span>🎁</span>
      <span translate="no" className="notranslate tabular">{formatUsdc(total)}</span>
      <span style={{ fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#050B14", background: "var(--accent)", padding: "1px 5px", borderRadius: 4 }}>
        Claim
      </span>
    </Link>
  );
}

function MobileClaimIcon({ address, chainId }: { address?: `0x${string}`; chainId?: number }) {
  const bondContractAddr = getFazaBondAddress(chainId);
  const otcContractAddr = getFazaOtcAddress(chainId);

  const { data: bondClaimable } = useReadContract({
    address: bondContractAddr || undefined,
    abi: FAZABOND_ABI,
    functionName: "claimable",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!address && !!bondContractAddr, refetchInterval: 8000 },
  });

  const { data: otcClaimable } = useReadContract({
    address: otcContractAddr || undefined,
    abi: FAZAOTC_ABI,
    functionName: "claimable",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!address && !!otcContractAddr, refetchInterval: 8000 },
  });

  const total = (bondClaimable ? (bondClaimable as bigint) : 0n) + (otcClaimable ? (otcClaimable as bigint) : 0n);

  if (!address || total <= 0n) return null;

  return (
    <Link
      href="/#claimable-section"
      title="You have settled or refunded stakes ready to withdraw!"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "rgba(46, 230, 166, 0.14)",
        border: "1px solid var(--accent)",
        color: "var(--accent)",
        fontSize: "0.85rem",
        textDecoration: "none",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <span>🎁</span>
      <span
        style={{
          position: "absolute",
          top: -2,
          right: -2,
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "var(--accent)",
          boxShadow: "0 0 6px var(--accent-glow)",
        }}
      />
    </Link>
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
    <div
      title="USDC is Arc's native gas asset. All transactions and settlements use USDC."
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: "var(--radius-pill)",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        whiteSpace: "nowrap",
      }}
    >
      <span translate="no" className="notranslate tabular" style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--ink-2)" }}>
        {formatUsdc(data as bigint)}
      </span>
      <span style={{ fontSize: "0.68rem", color: "var(--subtle)", fontWeight: 600 }}>USDC</span>
      <span
        title="Arc uses USDC natively for gas"
        style={{
          fontSize: "0.58rem",
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--accent)",
          background: "rgba(46, 230, 166, 0.1)",
          padding: "1px 5px",
          borderRadius: 4,
          display: "inline-flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        GAS
      </span>
      {isTestnet && (data as bigint) < 1_000_000n && (
        <a
          href="https://faucet.circle.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: "var(--amber)",
            textDecoration: "none",
            background: "rgba(245,166,35,0.12)",
            padding: "1px 6px",
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
  const { chainId: activeChainId, isMainnet, isTestnet, setNetwork } = useNetwork();
  const { lang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  // Read USDC balance for drawer
  const { data: usdcBalanceRaw } = useReadContract({
    address: ARC_USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: activeChainId,
    query: { enabled: !!address, refetchInterval: 10_000 },
  });
  const usdcBalance = usdcBalanceRaw as bigint | undefined;

  // Read claimable funds for drawer
  const bondContractAddr = getFazaBondAddress(activeChainId) ?? FAZABOND_ADDRESS;
  const otcContractAddr = getFazaOtcAddress(activeChainId) ?? FAZAOTC_ADDRESS;

  const { data: bondClaimable } = useReadContract({
    address: bondContractAddr || undefined,
    abi: FAZABOND_ABI,
    functionName: "claimable",
    args: address ? [address] : undefined,
    chainId: activeChainId,
    query: { enabled: !!address && !!bondContractAddr, refetchInterval: 8000 },
  });

  const { data: otcClaimable } = useReadContract({
    address: otcContractAddr || undefined,
    abi: FAZAOTC_ABI,
    functionName: "claimable",
    args: address ? [address] : undefined,
    chainId: activeChainId,
    query: { enabled: !!address && !!otcContractAddr, refetchInterval: 8000 },
  });

  const totalClaimable = (bondClaimable ? (bondClaimable as bigint) : 0n) + (otcClaimable ? (otcClaimable as bigint) : 0n);

  // Close menu on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const copyAddress = () => {
    if (address && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  return (
    <>
      <header className="navbar-header">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <FazaLogo size={27} showText={true} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hide-on-mobile"
          style={{ display: "flex", gap: "1rem", alignItems: "center", marginLeft: "1.25rem" }}
        >
          <Link
            href="/about"
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "var(--muted)",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
          >
            {t("navAbout", lang)}
          </Link>
          <LanguageSwitcher />
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right Action Items */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexShrink: 0 }}>
          {/* Desktop-only badges */}
          <div className="hide-on-mobile" style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <ClaimableFundsBadge address={address} chainId={activeChainId} />
            <UsdcBalance address={address} chainId={activeChainId} />
          </div>

          {/* Mobile-only compact claim icon */}
          <div className="show-on-mobile">
            <MobileClaimIcon address={address} chainId={activeChainId} />
          </div>

          {/* Network Switcher Dropdown */}
          <NetworkDropdown walletChainId={walletChainId} />

          {/* Wallet Connect / Account Button */}
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
                      height: 32,
                      width: 80,
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
                        padding: "0.38rem 0.85rem",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span className="connect-text-desktop">{t("connectWallet", lang)}</span>
                      <span className="connect-text-mobile">{t("connectWallet", lang)}</span>
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
                      padding: "0.38rem 0.75rem",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span className="connect-text-desktop">{t("wrongNetwork", lang)}</span>
                    <span className="connect-text-mobile">{t("switchNetwork", lang)}</span>
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
                    padding: "0.35rem 0.7rem",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      boxShadow: "0 0 5px var(--accent-glow)",
                      flexShrink: 0,
                    }}
                  />
                  <span>{account.displayName}</span>
                </button>
              );
            }}
          </ConnectButton.Custom>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            type="button"
            className="show-on-mobile"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: mobileMenuOpen ? "var(--border-strong)" : "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--ink)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              flexShrink: 0,
              position: "relative",
              transition: "all 0.15s ease",
            }}
          >
            {mobileMenuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
            {totalClaimable > 0n && !mobileMenuOpen && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  boxShadow: "0 0 6px var(--accent-glow)",
                }}
              />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-anim"
          style={{
            position: "fixed",
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 49,
            background: "rgba(7, 8, 11, 0.98)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            overflowY: "auto",
            padding: "1.25rem 1rem 3rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Section: Connected Account Info (if connected) */}
          {address ? (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-card)",
                padding: "1rem 1.15rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      boxShadow: "0 0 8px var(--accent-glow)",
                    }}
                  />
                  <span translate="no" className="mono notranslate" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
                    {shortAddr(address)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    onClick={copyAddress}
                    type="button"
                    style={{
                      background: "var(--surface-muted)",
                      border: "1px solid var(--border)",
                      color: copiedAddr ? "var(--accent)" : "var(--muted)",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: "0.72rem",
                      cursor: "pointer",
                    }}
                  >
                    {copiedAddr ? "Copied!" : "Copy"}
                  </button>
                  <a
                    href={getExplorerAddress(address, activeChainId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "var(--surface-muted)",
                      border: "1px solid var(--border)",
                      color: "var(--muted)",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: "0.72rem",
                      textDecoration: "none",
                    }}
                  >
                    Explorer ↗
                  </a>
                </div>
              </div>

              {/* USDC Gas Balance */}
              <div
                style={{
                  background: "var(--surface-muted)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "0.75rem 0.9rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)" }}>
                    Arc Gas &amp; Settlement Balance
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                    <span translate="no" className="notranslate tabular" style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)" }}>
                      {usdcBalance !== undefined ? formatUsdc(usdcBalance) : "—"}
                    </span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)" }}>USDC</span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      background: "rgba(46, 230, 166, 0.12)",
                      color: "var(--accent)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      display: "inline-block",
                      marginBottom: 4,
                    }}
                  >
                    GAS TOKEN
                  </span>
                  {isTestnet && (usdcBalance ?? 0n) < 1_000_000n && (
                    <div>
                      <a
                        href="https://faucet.circle.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "var(--amber)",
                          textDecoration: "none",
                        }}
                      >
                        Free Faucet ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Unclaimed funds in drawer */}
              {totalClaimable > 0n && (
                <div
                  style={{
                    background: "rgba(46, 230, 166, 0.1)",
                    border: "1px solid var(--accent)",
                    borderRadius: 10,
                    padding: "0.75rem 0.9rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)" }}>
                      🎁 Unclaimed Stakes Available
                    </div>
                    <div translate="no" className="notranslate tabular" style={{ fontSize: "1rem", fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>
                      {formatUsdc(totalClaimable)}
                    </div>
                  </div>
                  <Link
                    href="/#claimable-section"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      background: "var(--accent)",
                      color: "#050B14",
                      padding: "0.4rem 0.85rem",
                      borderRadius: "var(--radius-btn)",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Withdraw
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Disconnected prompt */
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-card)",
                padding: "1.1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--ink)" }}>
                Connect to Faza on Arc
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                Create and join bilateral show-up bonds and OTC deals settled in native USDC.
              </p>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openConnectModal();
                    }}
                    type="button"
                    style={{
                      background: "var(--accent)",
                      color: "#050B14",
                      border: "none",
                      borderRadius: "var(--radius-btn)",
                      padding: "0.6rem 1rem",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          )}

          {/* Network Switcher Card in Drawer */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              padding: "0.85rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)" }}>
              Network Mode
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => {
                  setNetwork("mainnet");
                  setMobileMenuOpen(false);
                }}
                style={{
                  background: isMainnet ? "rgba(46, 230, 166, 0.15)" : "var(--surface-muted)",
                  border: isMainnet ? "1px solid var(--accent)" : "1px solid var(--border)",
                  color: isMainnet ? "var(--accent)" : "var(--muted)",
                  padding: "0.6rem 0.5rem",
                  borderRadius: 8,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <span>Arc Mainnet</span>
                <span style={{ fontSize: "0.62rem", opacity: 0.8 }}>Chain 5042 · Live</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNetwork("testnet");
                  setMobileMenuOpen(false);
                }}
                style={{
                  background: isTestnet ? "rgba(245, 166, 35, 0.15)" : "var(--surface-muted)",
                  border: isTestnet ? "1px solid var(--amber)" : "1px solid var(--border)",
                  color: isTestnet ? "var(--amber)" : "var(--muted)",
                  padding: "0.6rem 0.5rem",
                  borderRadius: 8,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <span>Arc Sandbox</span>
                <span style={{ fontSize: "0.62rem", opacity: 0.8 }}>Chain 5042002</span>
              </button>
            </div>
          </div>

          {/* Language Switcher Card in Drawer */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              padding: "0.85rem 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--subtle)" }}>
              {lang === "zh" ? "语言设置 / Language" : "Language / 语言"}
            </div>
            <LanguageSwitcher />
          </div>

          {/* Navigation Links List */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1.1rem",
                color: "var(--ink)",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 600,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>⚡</span>
                <span>Show-up Bonds</span>
              </div>
              <span style={{ color: "var(--subtle)", fontSize: "0.8rem" }}>→</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1.1rem",
                color: "var(--ink)",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 600,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>📖</span>
                <span>Protocol Documentation &amp; About</span>
              </div>
              <span style={{ color: "var(--subtle)", fontSize: "0.8rem" }}>→</span>
            </Link>

            <Link
              href="/terms"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1.1rem",
                color: "var(--ink)",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 600,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>📜</span>
                <span>Terms of Service</span>
              </div>
              <span style={{ color: "var(--subtle)", fontSize: "0.8rem" }}>→</span>
            </Link>

            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1.1rem",
                color: "var(--ink)",
                textDecoration: "none",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>🔒</span>
                <span>Privacy Policy</span>
              </div>
              <span style={{ color: "var(--subtle)", fontSize: "0.8rem" }}>→</span>
            </Link>
          </div>

          {/* Social & Protocol Links */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "0.5rem" }}>
            <a
              href="https://x.com/Fazaotc"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--muted)",
                fontSize: "0.78rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              𝕏 @Fazaotc
            </a>
            <span style={{ color: "var(--border-strong)" }}>·</span>
            <a
              href="https://github.com/kellycryptos/faza"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--muted)",
                fontSize: "0.78rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              GitHub ↗
            </a>
            <span style={{ color: "var(--border-strong)" }}>·</span>
            <a
              href="https://explorer.arc.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--muted)",
                fontSize: "0.78rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              Arc Explorer ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
