/**
 * Arc chain configuration for Faza (show-up bond).
 *
 * ACTIVE CHAIN: Arc Testnet (chain ID 5042002).
 * Arc Mainnet (chain ID 5042) is the final destination — see MAINNET.md.
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

/** Active chain — swap to arcMainnet after the manual deploy described in MAINNET.md. */
export const activeChain = arcTestnet;

/** USDC predeploy on all Arc networks (mainnet and testnet). 6 decimals (ERC-20 view). */
export const ARC_USDC_ADDRESS =
  "0x3600000000000000000000000000000000000000" as const; // arc-studio-allow-onchain-literal

export const USDC_DECIMALS = 6;

/** $0.01 in 6-decimal USDC */
export const MIN_STAKE_USDC = 10_000n;
/** $100.00 in 6-decimal USDC */
export const MAX_STAKE_USDC = 100_000_000n;

export function explorerTx(hash: `0x${string}`): string {
  return `${activeChain.blockExplorers.default.url}/tx/${hash}`;
}
export function explorerAddress(addr: string): string {
  return `${activeChain.blockExplorers.default.url}/address/${addr}`;
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
