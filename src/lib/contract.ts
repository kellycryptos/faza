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
const MAINNET_FAZABOND = process.env.NEXT_PUBLIC_MAINNET_FAZABOND_ADDRESS ?? "";

/** Returns the FazaBond contract address for a given chainId. */
export function getFazaBondAddress(chainId?: number): FazabondAddress | undefined {
  if (chainId === 5042) {
    const addr = MAINNET_FAZABOND || process.env.NEXT_PUBLIC_FAZABOND_ADDRESS;
    return addr ? (addr as FazabondAddress) : undefined;
  }
  // testnet (5042002) or no chainId — use env override or testnet default
  const addr = process.env.NEXT_PUBLIC_FAZABOND_ADDRESS || TESTNET_FAZABOND;
  return addr as FazabondAddress;
}

/** Static address for use in non-hook contexts (defaults to testnet). */
export const FAZABOND_ADDRESS = (process.env.NEXT_PUBLIC_FAZABOND_ADDRESS ||
  TESTNET_FAZABOND) as FazabondAddress;
