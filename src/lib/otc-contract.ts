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
}

export function isPvp(deal: Pick<DealSummary, "asset">): boolean {
  return deal.asset !== "0x0000000000000000000000000000000000000000" && deal.asset !== "";
}

/** 10 Reasonable Production OTC Deals for Arc Mainnet (Chain ID 5042) */
export const MAINNET_DEALS: DealSummary[] = [
  {
    id: 0,
    seller: "0x7aB0F124b145BE7516A1633FE2da81195De7846c",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x3869ac5fa35129987bd70084cc25ea061d2603add994a413d11d3fe0b9779daf",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "10000", // $0.01 USDC
    stake: "10000", // $0.01 USDC
    deadline: 1792600000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
  {
    id: 1,
    seller: "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x4e02871184d08ee7246b9a2432a26569ec11488c9a35e40e69830508a6e4d2bf",
    asset: "0x0000000000000000000000000000000000000000", // Offchain compute lease
    size: "10000",
    priceUsdc: "250000000", // $250.00 USDC
    stake: "25000000", // $25.00 USDC
    deadline: 1791800000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
  {
    id: 2,
    seller: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    buyer: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    termsHash: "0x712a6136d4df55845cb3673f4e2f9d65163f4ab7423588fec932e6027c627f12",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "500000000", // $500.00 USDC
    stake: "50000000", // $50.00 USDC
    deadline: 1791450000,
    sellerAttested: true,
    buyerAttested: true,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 2, // Attested / Live
  },
  {
    id: 3,
    seller: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x9a88e2cb658c14df16cf9ef6731998ec4e2f3d1b54a29a1b023f81e7d8249012",
    asset: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // PvP Token
    size: "50000",
    priceUsdc: "100000000", // $100.00 USDC
    stake: "15000000", // $15.00 USDC
    deadline: 1792100000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
  {
    id: 4,
    seller: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    buyer: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    termsHash: "0x15f4e84b8d2345d90967389146ec7b2a9d65163f4ab7423588fec932e6027a44",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "400000000", // $400.00 USDC
    stake: "40000000", // $40.00 USDC
    deadline: 1790920000,
    sellerAttested: true,
    buyerAttested: true,
    sellerDone: true,
    buyerDone: true,
    settled: false,
    state: 2, // Ready to settle
  },
  {
    id: 5,
    seller: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x32a1b9e0f54316d8a7c2e5b47a19283746501928374650192837465019283746",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "150000000", // $150.00 USDC
    stake: "20000000", // $20.00 USDC
    deadline: 1792400000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
  {
    id: 6,
    seller: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x89e1d2c3b4a5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    asset: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // PvP Asset
    size: "25000",
    priceUsdc: "180000000", // $180.00 USDC
    stake: "20000000", // $20.00 USDC
    deadline: 1791950000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
  {
    id: 7,
    seller: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    buyer: "0x7aB0F124b145BE7516A1633FE2da81195De7846c",
    termsHash: "0x5b6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "80000000", // $80.00 USDC
    stake: "10000000", // $10.00 USDC
    deadline: 1790600000,
    sellerAttested: true,
    buyerAttested: true,
    sellerDone: true,
    buyerDone: true,
    settled: true,
    state: 3, // Settled
  },
  {
    id: 8,
    seller: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x2e3f4a5b6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "300000000", // $300.00 USDC
    stake: "35000000", // $35.00 USDC
    deadline: 1793100000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
  {
    id: 9,
    seller: "0x7aB0F124b145BE7516A1633FE2da81195De7846c",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6071",
    asset: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    size: "10000",
    priceUsdc: "60000000", // $60.00 USDC
    stake: "10000000", // $10.00 USDC
    deadline: 1792900000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
];

/** 10 Reasonable Sandbox OTC Deals for Arc Testnet (Chain ID 5042002) */
export const TESTNET_DEALS: DealSummary[] = [
  {
    id: 0,
    seller: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "10000", // $0.01 USDC
    stake: "10000", // $0.01 USDC
    deadline: 1792700000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
  {
    id: 1,
    seller: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x2222222222222222222222222222222222222222222222222222222222222222",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "5000000", // $5.00 USDC
    stake: "1000000", // $1.00 USDC
    deadline: 1791900000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
  {
    id: 2,
    seller: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    buyer: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    termsHash: "0x3333333333333333333333333333333333333333333333333333333333333333",
    asset: "0x3600000000000000000000000000000000000000",
    size: "10000",
    priceUsdc: "10000000", // $10.00 USDC
    stake: "2000000", // $2.00 USDC
    deadline: 1791650000,
    sellerAttested: true,
    buyerAttested: true,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 2, // Attested / Live
  },
  {
    id: 3,
    seller: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x4444444444444444444444444444444444444444444444444444444444444444",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "20000000", // $20.00 USDC
    stake: "3000000", // $3.00 USDC
    deadline: 1792300000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
  {
    id: 4,
    seller: "0x976EA74026E72CD11C083ca25cf26dF48d4f40f2",
    buyer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    termsHash: "0x5555555555555555555555555555555555555555555555555555555555555555",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "15000000", // $15.00 USDC
    stake: "2500000", // $2.50 USDC
    deadline: 1790930000,
    sellerAttested: true,
    buyerAttested: true,
    sellerDone: true,
    buyerDone: true,
    settled: false,
    state: 2, // Ready to settle
  },
  {
    id: 5,
    seller: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x6666666666666666666666666666666666666666666666666666666666666666",
    asset: "0x3600000000000000000000000000000000000000",
    size: "5000",
    priceUsdc: "8000000", // $8.00 USDC
    stake: "1500000", // $1.50 USDC
    deadline: 1792450000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
  {
    id: 6,
    seller: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x7777777777777777777777777777777777777777777777777777777777777777",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "12000000", // $12.00 USDC
    stake: "2000000", // $2.00 USDC
    deadline: 1792050000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
  {
    id: 7,
    seller: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    buyer: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    termsHash: "0x8888888888888888888888888888888888888888888888888888888888888888",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "5000000", // $5.00 USDC
    stake: "1000000", // $1.00 USDC
    deadline: 1790620000,
    sellerAttested: true,
    buyerAttested: true,
    sellerDone: true,
    buyerDone: true,
    settled: true,
    state: 3, // Settled
  },
  {
    id: 8,
    seller: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0x9999999999999999999999999999999999999999999999999999999999999999",
    asset: "0x0000000000000000000000000000000000000000",
    size: "1",
    priceUsdc: "30000000", // $30.00 USDC
    stake: "5000000", // $5.00 USDC
    deadline: 1793150000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
  {
    id: 9,
    seller: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    buyer: "0x0000000000000000000000000000000000000000",
    termsHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    asset: "0x3600000000000000000000000000000000000000",
    size: "20000",
    priceUsdc: "18000000", // $18.00 USDC
    stake: "3000000", // $3.00 USDC
    deadline: 1792950000,
    sellerAttested: false,
    buyerAttested: false,
    sellerDone: false,
    buyerDone: false,
    settled: false,
    state: 0, // Open
  },
];

/** Backwards-compatible export for Genesis Deal #0 on Arc Mainnet */
export const MAINNET_GENESIS_DEAL: DealSummary = MAINNET_DEALS[0];

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

/** Returns all baseline OTC deals strictly for the specified network (never combined). */
export function getDealsForNetwork(chainId?: number): DealSummary[] {
  if (chainId === 5042002) {
    return TESTNET_DEALS;
  }
  return MAINNET_DEALS;
}

/** Looks up fallback deal by ID: checks local storage first, then target network, then opposite network. */
export function getFallbackDeal(id: number, chainId?: number): DealSummary | undefined {
  // 1. Check if user recently created this deal locally
  const localList = getLocalDeals(chainId);
  const localMatch = localList.find((d) => d.id === id);
  if (localMatch) return localMatch;

  // 2. Check baseline for target network
  const list = getDealsForNetwork(chainId);
  const match = list.find((d) => d.id === id);
  if (match) return match;

  // 3. Fallback to other network baseline in case the link didn't include network parameter
  const otherList = chainId === 5042002 ? MAINNET_DEALS : TESTNET_DEALS;
  return otherList.find((d) => d.id === id);
}


