import { type Address } from "viem";

const TESTNET_FAZAOTC = "0xe49a617643c87017daa0ed62ea28317710e6c912";
const MAINNET_FAZAOTC = process.env.NEXT_PUBLIC_MAINNET_FAZAOTC_ADDRESS || "0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2";

/** Returns the FazaOTC contract address for a given chainId. */
export function getFazaOtcAddress(chainId?: number): Address | undefined {
  if (chainId === 5042) {
    const addr = MAINNET_FAZAOTC || process.env.NEXT_PUBLIC_FAZAOTC_ADDRESS;
    return addr ? (addr as Address) : undefined;
  }
  const addr = process.env.NEXT_PUBLIC_FAZAOTC_ADDRESS || TESTNET_FAZAOTC;
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
}

export function isPvp(deal: Pick<DealSummary, "asset">): boolean {
  return deal.asset !== "0x0000000000000000000000000000000000000000" && deal.asset !== "";
}
