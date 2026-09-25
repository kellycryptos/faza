/**
 * Arc chain configuration for Faza.
 *
 * Supports both Arc Testnet (5042002) and Arc Mainnet (5042).
 * The active chain adapts to the wallet's connected network.
 *
 * USDC on Arc is a fixed predeploy at the same address on every Arc network.
 * Source: https://docs.arc.io/arc/references/contract-addresses
 *
 * On Arc, native gas IS USDC — one asset, two views:
 *   - ERC-20 view: 6 decimals — use for all balances, transfers, display
 *   - Native view: 18 decimals — used only for gas / msg.value
 */

import { defineChain } from "viem";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { decimals: 18, name: "USDC", symbol: "USDC" },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.io"] }, // arc-studio-allow-onchain-literal
  },
  blockExplorers: {
    default: { name: "Arc Testnet Explorer", url: "https://explorer.testnet.arc.io" },
  },
});

export const arcMainnet = defineChain({
  id: 5042,
  name: "Arc",
  nativeCurrency: { decimals: 18, name: "USDC", symbol: "USDC" },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.arc.io"] }, // arc-studio-allow-onchain-literal
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://explorer.arc.io" },
  },
});

export const SUPPORTED_CHAINS = [arcTestnet, arcMainnet] as const;

/** The default chain for new connections. Swap to arcMainnet after manual deploy per MAINNET.md. */
export const activeChain = arcTestnet;

/** USDC predeploy on all Arc networks (mainnet and testnet). 6 decimals (ERC-20 view). */
export const ARC_USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000" as `0x${string}`; // arc-studio-allow-onchain-literal

export const USDC_DECIMALS = 6;

/** $0.01 in 6-decimal USDC */
export const MIN_STAKE_USDC = 10_000n;
/** $100.00 in 6-decimal USDC */
export const MAX_STAKE_USDC = 100_000_000n;

/** Returns the Arc chain object for a given chainId, or undefined if unsupported. */
export function getChain(chainId?: number) {
  if (chainId === arcMainnet.id) return arcMainnet;
  if (chainId === arcTestnet.id) return arcTestnet;
  return undefined;
}

/** Returns true if the chainId is a supported Arc network. */
export function isSupportedChain(chainId?: number): boolean {
  return chainId === arcMainnet.id || chainId === arcTestnet.id;
}

/** Explorer tx URL for the given chain (falls back to activeChain). */
export function getExplorerTx(hash: string, chainId?: number): string {
  const chain = getChain(chainId) ?? activeChain;
  return `${chain.blockExplorers.default.url}/tx/${hash}`;
}

/** Explorer address URL for the given chain (falls back to activeChain). */
export function getExplorerAddress(addr: string, chainId?: number): string {
  const chain = getChain(chainId) ?? activeChain;
  return `${chain.blockExplorers.default.url}/address/${addr}`;
}

/** @deprecated use getExplorerTx(hash, chainId) */
export function explorerTx(hash: `0x${string}`): string {
  return getExplorerTx(hash);
}
/** @deprecated use getExplorerAddress(addr, chainId) */
export function explorerAddress(addr: string): string {
  return getExplorerAddress(addr);
}

/** Parse "$0.10" → 100000n (6-decimal USDC) */
export function parseUsdcAmount(dollars: string): bigint {
  const n = parseFloat(dollars);
  if (isNaN(n) || n <= 0) return 0n;
  return BigInt(Math.round(n * 1_000_000));
}

/** Format 100000n → "$0.10" */
export function formatUsdc(raw: bigint | string | number): string {
  const dollars = Number(BigInt(raw)) / 1_000_000;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(dollars);
}

export function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Format a unix timestamp as "Sep 21, 2026 18:30" */
export function formatDeadline(ts: number): string {
  return new Date(ts * 1000).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/** Live countdown: returns "2h 14m", "45s", "Ended", etc. */
export function formatCountdown(deadlineTs: number): string {
  const secs = deadlineTs - Math.floor(Date.now() / 1000);
  if (secs <= 0) return "Ended";
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h < 24) return `${h}h ${m}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}
