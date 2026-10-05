import { type Address } from "viem";

const TESTNET_FAZAOTC = "0xe49a617643c87017daa0ed62ea28317710e6c912";
const MAINNET_FAZAOTC = process.env.NEXT_PUBLIC_MAINNET_FAZAOTC_ADDRESS || "0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2";

/** Returns the FazaOTC contract address for a given chainId. Defaults to Arc Mainnet (5042). */
export function getFazaOtcAddress(chainId?: number): Address | undefined {
  if (chainId === 5042002) {
    const addr = process.env.NEXT_PUBLIC_FAZAOTC_ADDRESS || TESTNET_FAZAOTC;
    return addr as Address;
  }
  // Arc Mainnet (5042) or default
  const addr = process.env.NEXT_PUBLIC_MAINNET_FAZAOTC_ADDRESS || MAINNET_FAZAOTC;
  return addr as Address;
}

/** Static address for use in non-hook contexts (defaults to mainnet). */
export const FAZAOTC_ADDRESS = (process.env.NEXT_PUBLIC_MAINNET_FAZAOTC_ADDRESS ??
  MAINNET_FAZAOTC) as Address;

export const FAZAOTC_ABI = [
  // State-changing
  {
    name: "create",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "termsHash", type: "bytes32" },
      { name: "asset", type: "address" },
      { name: "size", type: "uint256" },
      { name: "priceUsdc", type: "uint256" },
      { name: "stake", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "dealId", type: "uint256" }],
  },
  {
    name: "join",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "dealId", type: "uint256" },
      { name: "termsHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "attest",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "confirmDone",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "settle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "cancel",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "claim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  // Views
  {
    name: "dealCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getDeal",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "seller", type: "address" },
          { name: "buyer", type: "address" },
          { name: "termsHash", type: "bytes32" },
          { name: "asset", type: "address" },
          { name: "size", type: "uint256" },
          { name: "priceUsdc", type: "uint256" },
          { name: "stake", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "sellerAttested", type: "bool" },
          { name: "buyerAttested", type: "bool" },
          { name: "sellerDone", type: "bool" },
          { name: "buyerDone", type: "bool" },
          { name: "settled", type: "bool" },
          { name: "state", type: "uint8" },
        ],
      },
    ],
  },
  {
    name: "claimable",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "canJoin",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "canSettle",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  // Events
  {
    name: "DealCreated",
    type: "event",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "termsHash", type: "bytes32", indexed: false },
      { name: "asset", type: "address", indexed: false },
      { name: "size", type: "uint256", indexed: false },
      { name: "priceUsdc", type: "uint256", indexed: false },
      { name: "stake", type: "uint256", indexed: false },
      { name: "deadline", type: "uint256", indexed: false },
    ],
  },
  {
    name: "DealJoined",
    type: "event",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "buyer", type: "address", indexed: true },
    ],
  },
  {
    name: "DealSettled",
    type: "event",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "pvp", type: "bool", indexed: false },
    ],
  },
  {
    name: "DealForfeited",
    type: "event",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: false },
    ],
  },
] as const;

export const DEAL_STATES = ["Open", "Joined", "Attested", "Settled", "Forfeit", "Cancelled"] as const;
export type DealState = (typeof DEAL_STATES)[number];

export interface DealSummary {
  id: number;
  seller: string;
  buyer: string;
  termsHash: string;
  asset: string;
  size: string;
  priceUsdc: string;
  stake: string;
  deadline: number;
  sellerAttested: boolean;
  buyerAttested: boolean;
  sellerDone: boolean;
  buyerDone: boolean;
  settled: boolean;
  state: number; // DealState enum index
  isOnchain?: boolean;
}

export function isPvp(deal: Pick<DealSummary, "asset">): boolean {
  return deal.asset !== "0x0000000000000000000000000000000000000000" && deal.asset !== "";
}

/** Real OTC deals are loaded directly onchain from the Arc blockchain. */
export const MAINNET_DEALS: DealSummary[] = [];
export const TESTNET_DEALS: DealSummary[] = [];
export const MAINNET_GENESIS_DEAL: DealSummary | undefined = undefined;

export interface LocalDealSummary extends DealSummary {
  title?: string;
  termSheet?: string;
  txHash?: string;
  network?: string;
  createdAt?: number;
}

const LOCAL_DEALS_KEY = "faza_custom_deals_v1";

/** Returns any user-created OTC deals stored locally in browser storage for a network. */
export function getLocalDeals(chainId?: number): LocalDealSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_DEALS_KEY);
    if (!raw) return [];
    const list: LocalDealSummary[] = JSON.parse(raw);
    const targetNet = chainId === 5042002 ? "testnet" : "mainnet";
    return list.filter((d) => !d.network || d.network === targetNet);
  } catch {
    return [];
  }
}

/** Saves a newly created OTC deal to browser local storage so it displays immediately. */
export function saveLocalDeal(deal: LocalDealSummary): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_DEALS_KEY);
    const list: LocalDealSummary[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((d) => d.id !== deal.id && (!deal.txHash || d.txHash !== deal.txHash));
    filtered.unshift(deal);
    localStorage.setItem(LOCAL_DEALS_KEY, JSON.stringify(filtered.slice(0, 50)));
  } catch (e) {
    console.error("Failed to save local deal:", e);
  }
}

export function getDealsForNetwork(_chainId?: number): DealSummary[] {
  return [];
}

export function getFallbackDeal(id: number, chainId?: number): DealSummary | undefined {
  const localList = getLocalDeals(chainId);
  return localList.find((d) => d.id === id);
}
