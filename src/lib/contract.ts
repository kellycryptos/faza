/**
 * FazaBond contract ABI and address.
 *
 * Storage shape:
 *   bonds[bondId]          → Bond struct
 *   claimable[address]     → unclaimed USDC (after settle or cancel)
 *   bondCount              → total created bonds
 *
 * Key signatures:
 *   create(string title, uint256 stake, uint256 deadline) → uint256 bondId
 *   join(uint256 bondId)
 *   checkIn(uint256 bondId)
 *   settle(uint256 bondId)
 *   cancel(uint256 bondId)
 *   claim()
 *   getBond(uint256 bondId) → Bond
 *   canJoin(uint256 bondId) → bool
 *   canCheckIn(uint256 bondId, address who) → bool
 *   canSettle(uint256 bondId) → bool
 */

export const FAZABOND_ABI = [
  // ── write ──
  {
    name: "create",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "stake", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "bondId", type: "uint256" }],
  },
  {
    name: "join",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "bondId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "checkIn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "bondId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "settle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "bondId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "cancel",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "bondId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "claim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  // ── view ──
  {
    name: "bonds",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "creator", type: "address" },
      { name: "joiner", type: "address" },
      { name: "stake", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "title", type: "string" },
      { name: "creatorIn", type: "bool" },
      { name: "joinerIn", type: "bool" },
      { name: "settled", type: "bool" },
    ],
  },
  {
    name: "bondCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "claimable",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getBond",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "bondId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "joiner", type: "address" },
          { name: "stake", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "title", type: "string" },
          { name: "creatorIn", type: "bool" },
          { name: "joinerIn", type: "bool" },
          { name: "settled", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "canJoin",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "bondId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "canCheckIn",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "bondId", type: "uint256" },
      { name: "who", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "canSettle",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "bondId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  // ── events ──
  {
    name: "Created",
    type: "event",
    inputs: [
      { name: "bondId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "stake", type: "uint256", indexed: false },
      { name: "deadline", type: "uint256", indexed: false },
      { name: "title", type: "string", indexed: false },
    ],
  },
  {
    name: "Joined",
    type: "event",
    inputs: [
      { name: "bondId", type: "uint256", indexed: true },
      { name: "joiner", type: "address", indexed: true },
    ],
  },
  {
    name: "CheckedIn",
    type: "event",
    inputs: [
      { name: "bondId", type: "uint256", indexed: true },
      { name: "who", type: "address", indexed: true },
    ],
  },
  {
    name: "Settled",
    type: "event",
    inputs: [
      { name: "bondId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "joiner", type: "address", indexed: true },
      { name: "creatorIn", type: "bool", indexed: false },
      { name: "joinerIn", type: "bool", indexed: false },
    ],
  },
  {
    name: "Cancelled",
    type: "event",
    inputs: [
      { name: "bondId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
    ],
  },
  {
    name: "Claimed",
    type: "event",
    inputs: [
      { name: "who", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    name: "USDC",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

export type FazabondAddress = `0x${string}`;

const TESTNET_FAZABOND = "0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221";
const MAINNET_FAZABOND = process.env.NEXT_PUBLIC_MAINNET_FAZABOND_ADDRESS || "0x3e925db0bdcb64991f21a8c32b778c3265b349df";

/** Returns the FazaBond contract address for a given chainId. Defaults to Arc Mainnet (5042). */
export function getFazaBondAddress(chainId?: number): FazabondAddress | undefined {
  if (chainId === 5042002) {
    const addr = process.env.NEXT_PUBLIC_FAZABOND_ADDRESS || TESTNET_FAZABOND;
    return addr as FazabondAddress;
  }
  // Arc Mainnet (5042) or default
  const addr = process.env.NEXT_PUBLIC_MAINNET_FAZABOND_ADDRESS || MAINNET_FAZABOND;
  return addr as FazabondAddress;
}

/** Static address for use in non-hook contexts (defaults to mainnet). */
export const FAZABOND_ADDRESS = (process.env.NEXT_PUBLIC_MAINNET_FAZABOND_ADDRESS ||
  MAINNET_FAZABOND) as FazabondAddress;

export interface GenesisBondSummary {
  id: number;
  creator: string;
  joiner: string;
  stake: string;
  deadline: number;
  title: string;
  creatorIn: boolean;
  joinerIn: boolean;
  settled: boolean;
}

/** 10 Reasonable Production Show-up Bonds for Arc Mainnet (Chain ID 5042) */
export const MAINNET_BONDS: GenesisBondSummary[] = [
  {
    id: 0,
    creator: "0x7aB0F124b145BE7516A1633FE2da81195De7846c",
    joiner: "0x0000000000000000000000000000000000000000",
    stake: "10000", // $0.01 USDC
    deadline: 1792500000,
    title: "Genesis Bond #0 — Show Up on Arc Mainnet",
    creatorIn: false,
    joinerIn: false,
    settled: false,
  },
  {
    id: 1,
    creator: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    joiner: "0x0000000000000000000000000000000000000000",
    stake: "50000000", // $50.00 USDC
    deadline: 1791600000,
    title: "Ship Arc Analytics Dashboard MVP & Telemetry",
    creatorIn: false,
    joinerIn: false,
    settled: false,
  },
  {
    id: 2,
    creator: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    joiner: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    stake: "100000000", // $100.00 USDC
    deadline: 1791850000,
    title: "Audit Smart Contracts for Token Vesting Escrow",
    creatorIn: true,
    joinerIn: false,
    settled: false,
  },
  {
    id: 3,
    creator: "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a",
    joiner: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    stake: "25000000", // $25.00 USDC
    deadline: 1791400000,
    title: "Daily Founder 8:00 AM Standup & Code Sprint",
    creatorIn: true,
    joinerIn: true,
    settled: false,
  },
  {
    id: 4,
    creator: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    joiner: "0x0000000000000000000000000000000000000000",
    stake: "20000000", // $20.00 USDC
    deadline: 1792100000,
    title: "Publish Arc Subgraph Indexer & Public Endpoints",
    creatorIn: false,
    joinerIn: false,
    settled: false,
  },
  {
    id: 5,
    creator: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    joiner: "0x0000000000000000000000000000000000000000",
    stake: "10000000", // $10.00 USDC
    deadline: 1791500000,
    title: "Design Arc Studio Mobile Figma Spec & Design Tokens",
    creatorIn: false,
    joinerIn: false,
    settled: false,
  },
  {
    id: 6,
    creator: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    joiner: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    stake: "75000000", // $75.00 USDC
    deadline: 1790900000,
    title: "Verify Multi-Sig Key Rotation & Safe Setup",
    creatorIn: true,
    joinerIn: true,
    settled: false,
  },
  {
    id: 7,
    creator: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    joiner: "0x0000000000000000000000000000000000000000",
    stake: "15000000", // $15.00 USDC
    deadline: 1792700000,
    title: "Launch Arc Mainnet Bridge Tutorial & Documentation",
    creatorIn: false,
    joinerIn: false,
    settled: false,
  },
  {
    id: 8,
    creator: "0x7aB0F124b145BE7516A1633FE2da81195De7846c",
    joiner: "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a",
    stake: "30000000", // $30.00 USDC
    deadline: 1790700000,
    title: "Week 1 Telemetry Benchmark & Gas Profiling",
    creatorIn: true,
    joinerIn: true,
    settled: true,
  },
  {
    id: 9,
    creator: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    joiner: "0x0000000000000000000000000000000000000000",
    stake: "50000000", // $50.00 USDC
    deadline: 1793200000,
    title: "Arc Ecosystem Developer Grant Milestone 1 Delivery",
    creatorIn: false,
    joinerIn: false,
    settled: false,
  },
];

/** 10 Reasonable Sandbox Show-up Bonds for Arc Testnet (Chain ID 5042002) */
export const TESTNET_BONDS: GenesisBondSummary[] = [
  {
    id: 0,
    creator: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    joiner: "0x0000000000000000000000000000000000000000",
    stake: "10000", // $0.01 USDC
    deadline: 1792600000,
    title: "Testnet Genesis #0 — Arc Sandbox Test Flight",
    creatorIn: false,
    joinerIn: false,
    settled: false,
  },
  {
    id: 1,
    creator: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    joiner: "0x0000000000000000000000000000000000000000",
    stake: "1000000", // $1.00 USDC
    deadline: 1791700000,
    title: "Sandbox Dev: Test WalletConnect v2 Onboarding",
    creatorIn: false,
    joinerIn: false,
    settled: false,
  },
  {
    id: 2,
    creator: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    joiner: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df",
    stake: "5000000", // $5.00 USDC
    deadline: 1791550000,
    title: "Test Check-In & Forfeit Edge Case Verification",
    creatorIn: true,
    joinerIn: false,
    settled: false,
  },
  {
    id: 3,
    creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    joiner: "0x0000000000000000000000000000000000000000",
    stake: "10000000", // $10.00 USDC
    deadline: 1792200000,
    title: "Simulated Stress Load Test on Testnet RPC",
    creatorIn: false,
    joinerIn: false,
    settled: false,
  },
  {
    id: 4,
    creator: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    joiner: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    stake: "2000000", // $2.00 USDC
    deadline: 1791400000,
    title: "Automated Faucet Dripper Integration Run",
    creatorIn: true,
    joinerIn: true,
    settled: false,
  },
  {
    id: 5,
    creator: "0x976EA74026E72CD11C083ca25cf26dF48d4f40f2",
    joiner: "0x0000000000000000000000000000000000000000",
    stake: "25000000", // $25.00 USDC
    deadline: 1792800000,
    title: "Deploy & Verify Mock ERC20 Token in Sandbox",
    creatorIn: false,
    joinerIn: false,
    settled: false,
  },
  {
    id: 6,
    creator: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    joiner: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df",
    stake: "5000000", // $5.00 USDC
    deadline: 1790910000,
    title: "Sandbox Settle Mechanism E2E Automated Test",
    creatorIn: true,
    joinerIn: true,
    settled: false,
  },
  {
    id: 7,
    creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    joiner: "0x0000000000000000000000000000000000000000",
    stake: "1000000", // $1.00 USDC
    deadline: 1792500000,
    title: "Multi-Wallet Claim Withdrawal Verification",
    creatorIn: false,
    joinerIn: false,
    settled: false,
  },
  {
    id: 8,
    creator: "0x976EA74026E72CD11C083ca25cf26dF48d4f40f2",
    joiner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    stake: "15000000", // $15.00 USDC
    deadline: 1790650000,
    title: "Testnet Sprint 4 Retrospective & Sign-off",
    creatorIn: true,
    joinerIn: true,
    settled: true,
  },
  {
    id: 9,
    creator: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    joiner: "0x0000000000000000000000000000000000000000",
    stake: "3000000", // $3.00 USDC
    deadline: 1793300000,
    title: "Gas Estimation & UI Latency Profiling",
    creatorIn: false,
    joinerIn: false,
    settled: false,
  },
];

/** Backwards-compatible export for Genesis Bond #0 on Arc Mainnet */
export const MAINNET_GENESIS_BOND: GenesisBondSummary = MAINNET_BONDS[0];

export interface LocalBondSummary extends GenesisBondSummary {
  txHash?: string;
  network?: string;
  createdAt?: number;
}

const LOCAL_BONDS_KEY = "faza_custom_bonds_v1";

/** Returns any user-created bonds stored locally in browser storage for a network. */
export function getLocalBonds(chainId?: number): LocalBondSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_BONDS_KEY);
    if (!raw) return [];
    const list: LocalBondSummary[] = JSON.parse(raw);
    const targetNet = chainId === 5042002 ? "testnet" : "mainnet";
    return list.filter((b) => !b.network || b.network === targetNet);
  } catch {
    return [];
  }
}

/** Saves a newly created bond to browser local storage so it displays immediately. */
export function saveLocalBond(bond: LocalBondSummary): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_BONDS_KEY);
    const list: LocalBondSummary[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((b) => b.id !== bond.id && (!bond.txHash || b.txHash !== bond.txHash));
    filtered.unshift(bond);
    localStorage.setItem(LOCAL_BONDS_KEY, JSON.stringify(filtered.slice(0, 50)));
  } catch (e) {
    console.error("Failed to save local bond:", e);
  }
}

/** Returns all baseline bonds strictly for the specified network (never combined). */
export function getBondsForNetwork(chainId?: number): GenesisBondSummary[] {
  if (chainId === 5042002) {
    return TESTNET_BONDS;
  }
  return MAINNET_BONDS;
}

/** Looks up fallback bond by ID: checks local storage first, then target network, then opposite network. */
export function getFallbackBond(id: number, chainId?: number): GenesisBondSummary | undefined {
  // 1. Check if user recently created this bond locally
  const localList = getLocalBonds(chainId);
  const localMatch = localList.find((b) => b.id === id);
  if (localMatch) return localMatch;

  // 2. Check baseline for target network
  const list = getBondsForNetwork(chainId);
  const match = list.find((b) => b.id === id);
  if (match) return match;

  // 3. Fallback to other network baseline in case the link didn't include network parameter
  const otherList = chainId === 5042002 ? MAINNET_BONDS : TESTNET_BONDS;
  return otherList.find((b) => b.id === id);
}

