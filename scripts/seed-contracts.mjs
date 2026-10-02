import fs from "fs";
import {
  createWalletClient,
  createPublicClient,
  http,
  formatUnits,
  parseAbi,
  defineChain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const arcMainnet = defineChain({
  id: 5042,
  name: "Arc Mainnet",
  nativeCurrency: { decimals: 18, name: "USDC", symbol: "USDC" },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.arc.io"] },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://explorer.arc.io" },
  },
});

const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { decimals: 18, name: "USDC", symbol: "USDC" },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.io"] },
  },
  blockExplorers: {
    default: { name: "Arc Testnet Explorer", url: "https://explorer.testnet.arc.io" },
  },
});

const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
]);

const FAZABOND_ABI = parseAbi([
  "function create(string title, uint256 stake, uint256 deadline) returns (uint256)",
  "function bondCount() view returns (uint256)",
]);

const FAZAOTC_ABI = parseAbi([
  "function create(bytes32 termsHash, address asset, uint256 size, uint256 priceUsdc, uint256 stake, uint256 deadline) returns (uint256)",
  "function dealCount() view returns (uint256)",
]);

function loadEnvKey() {
  if (process.env.PRIVATE_KEY) return process.env.PRIVATE_KEY;
  if (fs.existsSync(".env.local")) {
    const content = fs.readFileSync(".env.local", "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      const match = trimmed.match(/^(?:export\s+)?PRIVATE_KEY\s*=\s*(.*)$/);
      if (match) {
        let val = match[1].trim().replace(/^["']|["']$/g, "").split(/\s+#/)[0].trim();
        const hexMatch = val.match(/0x[a-fA-F0-9]{64}|[a-fA-F0-9]{64}/);
        if (hexMatch) return hexMatch[0];
        if (val) return val;
      }
    }
  }
  return null;
}

const MAINNET_BONDS_CONFIG = [
  { title: "Genesis Bond #0 — Show Up on Arc Mainnet", stake: 10_000n, days: 30 },
  { title: "Ship Arc Analytics Dashboard MVP & Telemetry", stake: 10_000n, days: 14 },
  { title: "Audit Smart Contracts for Token Vesting Escrow", stake: 20_000n, days: 21 },
  { title: "Daily Founder 8:00 AM Standup & Code Sprint", stake: 10_000n, days: 7 },
  { title: "Publish Arc Subgraph Indexer & Public Endpoints", stake: 15_000n, days: 10 },
  { title: "Design Arc Studio Mobile Figma Spec & Design Tokens", stake: 10_000n, days: 12 },
  { title: "Verify Multi-Sig Key Rotation & Safe Setup", stake: 25_000n, days: 5 },
  { title: "Launch Arc Mainnet Bridge Tutorial & Documentation", stake: 10_000n, days: 18 },
  { title: "Week 1 Telemetry Benchmark & Gas Profiling", stake: 20_000n, days: 4 },
  { title: "Arc Ecosystem Developer Grant Milestone 1 Delivery", stake: 30_000n, days: 25 },
];

const TESTNET_BONDS_CONFIG = [
  { title: "Testnet Genesis #0 — Arc Sandbox Test Flight", stake: 10_000n, days: 30 },
  { title: "Sandbox Dev: Test WalletConnect v2 Onboarding", stake: 10_000n, days: 14 },
  { title: "Test Check-In & Forfeit Edge Case Verification", stake: 20_000n, days: 21 },
  { title: "Simulated Stress Load Test on Testnet RPC", stake: 15_000n, days: 7 },
  { title: "Automated Faucet Dripper Integration Run", stake: 10_000n, days: 10 },
  { title: "Deploy & Verify Mock ERC20 Token in Sandbox", stake: 25_000n, days: 12 },
  { title: "Sandbox Settle Mechanism E2E Automated Test", stake: 10_000n, days: 5 },
  { title: "Multi-Wallet Claim Withdrawal Verification", stake: 10_000n, days: 18 },
  { title: "Testnet Sprint 4 Retrospective & Sign-off", stake: 20_000n, days: 4 },
  { title: "Gas Estimation & UI Latency Profiling", stake: 15_000n, days: 25 },
];

const MAINNET_DEALS_CONFIG = [
  {
    termsHash: "0x3869ac5fa35129987bd70084cc25ea061d2603add994a413d11d3fe0b9779daf",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 10_000n,
    stake: 10_000n,
    days: 30,
  },
  {
    termsHash: "0x4e02871184d08ee7246b9a2432a26569ec11488c9a35e40e69830508a6e4d2bf",
    asset: "0x0000000000000000000000000000000000000000",
    size: 10000n,
    priceUsdc: 250_000_000n,
    stake: 10_000n,
    days: 14,
  },
  {
    termsHash: "0x712a6136d4df55845cb3673f4e2f9d65163f4ab7423588fec932e6027c627f12",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 500_000_000n,
    stake: 20_000n,
    days: 10,
  },
  {
    termsHash: "0x9a88e2cb658c14df16cf9ef6731998ec4e2f3d1b54a29a1b023f81e7d8249012",
    asset: "0x3600000000000000000000000000000000000000",
    size: 50000n,
    priceUsdc: 100_000_000n,
    stake: 15_000n,
    days: 20,
  },
  {
    termsHash: "0x15f4e84b8d2345d90967389146ec7b2a9d65163f4ab7423588fec932e6027a44",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 400_000_000n,
    stake: 25_000n,
    days: 8,
  },
  {
    termsHash: "0x32a1b9e0f54316d8a7c2e5b47a19283746501928374650192837465019283746",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 150_000_000n,
    stake: 15_000n,
    days: 16,
  },
  {
    termsHash: "0x89e1d2c3b4a5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
    asset: "0x3600000000000000000000000000000000000000",
    size: 25000n,
    priceUsdc: 180_000_000n,
    stake: 20_000n,
    days: 12,
  },
  {
    termsHash: "0x5b6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 80_000_000n,
    stake: 10_000n,
    days: 6,
  },
  {
    termsHash: "0x2e3f4a5b6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 300_000_000n,
    stake: 30_000n,
    days: 22,
  },
  {
    termsHash: "0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6071",
    asset: "0x3600000000000000000000000000000000000000",
    size: 10000n,
    priceUsdc: 60_000_000n,
    stake: 10_000n,
    days: 28,
  },
];

const TESTNET_DEALS_CONFIG = [
  {
    termsHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 10_000n,
    stake: 10_000n,
    days: 30,
  },
  {
    termsHash: "0x2222222222222222222222222222222222222222222222222222222222222222",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 5_000_000n,
    stake: 1_000_000n,
    days: 14,
  },
  {
    termsHash: "0x3333333333333333333333333333333333333333333333333333333333333333",
    asset: "0x3600000000000000000000000000000000000000",
    size: 10000n,
    priceUsdc: 10_000_000n,
    stake: 2_000_000n,
    days: 10,
  },
  {
    termsHash: "0x4444444444444444444444444444444444444444444444444444444444444444",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 20_000_000n,
    stake: 3_000_000n,
    days: 20,
  },
  {
    termsHash: "0x5555555555555555555555555555555555555555555555555555555555555555",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 15_000_000n,
    stake: 2_500_000n,
    days: 8,
  },
  {
    termsHash: "0x6666666666666666666666666666666666666666666666666666666666666666",
    asset: "0x3600000000000000000000000000000000000000",
    size: 5000n,
    priceUsdc: 8_000_000n,
    stake: 1_500_000n,
    days: 16,
  },
  {
    termsHash: "0x7777777777777777777777777777777777777777777777777777777777777777",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 12_000_000n,
    stake: 2_000_000n,
    days: 12,
  },
  {
    termsHash: "0x8888888888888888888888888888888888888888888888888888888888888888",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 5_000_000n,
    stake: 1_000_000n,
    days: 6,
  },
  {
    termsHash: "0x9999999999999999999999999999999999999999999999999999999999999999",
    asset: "0x0000000000000000000000000000000000000000",
    size: 1n,
    priceUsdc: 30_000_000n,
    stake: 5_000_000n,
    days: 22,
  },
  {
    termsHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    asset: "0x3600000000000000000000000000000000000000",
    size: 20000n,
    priceUsdc: 18_000_000n,
    stake: 3_000_000n,
    days: 28,
  },
];

async function main() {
  const isTestnet = process.argv.includes("--network=testnet") || process.argv.includes("--testnet");
  const chain = isTestnet ? arcTestnet : arcMainnet;
  const bondContractAddr = isTestnet
    ? "0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221"
    : "0x3e925db0bdcb64991f21a8c32b778c3265b349df";
  const otcContractAddr = isTestnet
    ? "0xe49a617643c87017daa0ed62ea28317710e6c912"
    : "0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2";

  console.log(`\n============================================================`);
  console.log(`Seeding Faza Contracts on ${chain.name} (Chain ID: ${chain.id})`);
  console.log(`FazaBond: ${bondContractAddr}`);
  console.log(`FazaOTC:  ${otcContractAddr}`);
  console.log(`============================================================\n`);

  const rawKey = loadEnvKey();
  if (!rawKey) {
    console.error("ERROR: PRIVATE_KEY not found in .env.local or environment.");
    console.error("Please add PRIVATE_KEY=0x... to .env.local to run onchain seed.");
    process.exit(1);
  }

  const formattedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const account = privateKeyToAccount(formattedKey);
  console.log(`Wallet Address: ${account.address}`);

  const publicClient = createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });

  const gasBal = await publicClient.getBalance({ address: account.address });
  const usdcBal = await publicClient.readContract({
    address: ARC_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [account.address],
  });

  console.log(`Native Gas Balance: ${formatUnits(gasBal, 18)} USDC`);
  console.log(`ERC-20 Balance:     ${formatUnits(usdcBal, 6)} USDC`);

  const bondsConfig = isTestnet ? TESTNET_BONDS_CONFIG : MAINNET_BONDS_CONFIG;
  const dealsConfig = isTestnet ? TESTNET_DEALS_CONFIG : MAINNET_DEALS_CONFIG;

  const totalBondStake = bondsConfig.reduce((acc, b) => acc + b.stake, 0n);
  const totalDealStake = dealsConfig.reduce((acc, d) => acc + d.stake, 0n);
  const totalNeeded = totalBondStake + totalDealStake;

  console.log(`Total USDC Stake required for all 10 bonds + 10 deals: ${formatUnits(totalNeeded, 6)} USDC`);

  if (usdcBal < totalNeeded) {
    console.warn(`\nWARNING: Balance is ${formatUnits(usdcBal, 6)} USDC, which is less than ${formatUnits(totalNeeded, 6)} USDC.`);
    console.warn(`Transactions will proceed for as many items as balance allows.\n`);
  }

  // 1. Approve FazaBond
  console.log(`Approving FazaBond (${bondContractAddr}) to spend USDC...`);
  const bondApproveTx = await walletClient.writeContract({
    address: ARC_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [bondContractAddr, 10_000_000_000n],
  });
  await publicClient.waitForTransactionReceipt({ hash: bondApproveTx });
  console.log(`FazaBond approved! Tx: ${bondApproveTx}`);

  // 2. Approve FazaOTC
  console.log(`Approving FazaOTC (${otcContractAddr}) to spend USDC...`);
  const otcApproveTx = await walletClient.writeContract({
    address: ARC_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [otcContractAddr, 10_000_000_000n],
  });
  await publicClient.waitForTransactionReceipt({ hash: otcApproveTx });
  console.log(`FazaOTC approved! Tx: ${otcApproveTx}`);

  // 3. Create Bonds
  console.log(`\n--- Creating 10 Show-Up Bonds ---`);
  const now = Math.floor(Date.now() / 1000);
  for (let i = 0; i < bondsConfig.length; i++) {
    const b = bondsConfig[i];
    const deadline = BigInt(now + b.days * 86400);
    try {
      console.log(`Creating Bond #${i}: "${b.title}" (Stake: ${formatUnits(b.stake, 6)} USDC)...`);
      const tx = await walletClient.writeContract({
        address: bondContractAddr,
        abi: FAZABOND_ABI,
        functionName: "create",
        args: [b.title, b.stake, deadline],
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`  ✓ Bond #${i} confirmed in block ${receipt.blockNumber} (tx: ${tx})`);
    } catch (err) {
      console.error(`  ✗ Error creating bond #${i}:`, err.message);
    }
  }

  // 4. Create OTC Deals
  console.log(`\n--- Creating 10 OTC Deals ---`);
  for (let i = 0; i < dealsConfig.length; i++) {
    const d = dealsConfig[i];
    const deadline = BigInt(now + d.days * 86400);
    try {
      console.log(`Creating Deal #${i} (Price: ${formatUnits(d.priceUsdc, 6)} USDC, Stake: ${formatUnits(d.stake, 6)} USDC)...`);
      const tx = await walletClient.writeContract({
        address: otcContractAddr,
        abi: FAZAOTC_ABI,
        functionName: "create",
        args: [d.termsHash, d.asset, d.size, d.priceUsdc, d.stake, deadline],
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`  ✓ Deal #${i} confirmed in block ${receipt.blockNumber} (tx: ${tx})`);
    } catch (err) {
      console.error(`  ✗ Error creating deal #${i}:`, err.message);
    }
  }

  const finalBondCount = await publicClient.readContract({
    address: bondContractAddr,
    abi: FAZABOND_ABI,
    functionName: "bondCount",
  });
  const finalDealCount = await publicClient.readContract({
    address: otcContractAddr,
    abi: FAZAOTC_ABI,
    functionName: "dealCount",
  });

  console.log(`\n============================================================`);
  console.log(`Seeding Complete for ${chain.name}!`);
  console.log(`  Total Bonds onchain: ${finalBondCount}`);
  console.log(`  Total Deals onchain: ${finalDealCount}`);
  console.log(`============================================================\n`);
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
