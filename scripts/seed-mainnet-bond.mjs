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
  name: "Arc",
  nativeCurrency: { decimals: 18, name: "USDC", symbol: "USDC" },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.arc.io"] },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://explorer.arc.io" },
  },
});

const FAZABOND_ADDRESS = "0x3e925db0bdcb64991f21a8c32b778c3265b349df";
const ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

const ERC20_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
]);

const FAZABOND_ABI = parseAbi([
  "function create(string title, uint256 stake, uint256 deadline) returns (uint256)",
  "function bondCount() view returns (uint256)",
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

async function main() {
  const rawKey = loadEnvKey();
  if (!rawKey) {
    console.error("ERROR: PRIVATE_KEY not found in .env.local or environment.");
    process.exit(1);
  }

  const formattedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const account = privateKeyToAccount(formattedKey);
  console.log(`Wallet address: ${account.address}`);

  const publicClient = createPublicClient({
    chain: arcMainnet,
    transport: http("https://rpc.mainnet.arc.io"),
  });

  const walletClient = createWalletClient({
    account,
    chain: arcMainnet,
    transport: http("https://rpc.mainnet.arc.io"),
  });

  const gasBal = await publicClient.getBalance({ address: account.address });
  const usdcBal = await publicClient.readContract({
    address: ARC_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [account.address],
  });

  console.log(`Native Gas: ${formatUnits(gasBal, 18)} USDC`);
  console.log(`ERC-20 Balance: ${formatUnits(usdcBal, 6)} USDC`);

  const stake = 10_000n; // $0.01 USDC
  if (usdcBal < stake) {
    console.error("Insufficient USDC balance to stake $0.01");
    process.exit(1);
  }

  console.log("\nStep 1: Approving FazaBond to spend $0.01 USDC...");
  const approveTx = await walletClient.writeContract({
    address: ARC_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [FAZABOND_ADDRESS, stake],
  });
  console.log(`Approval tx sent: ${approveTx}`);
  await publicClient.waitForTransactionReceipt({ hash: approveTx });
  console.log("Approval confirmed!");

  console.log("\nStep 2: Creating Genesis Bond #0 on Arc Mainnet...");
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 24 * 3600); // 24 hours
  const title = "Genesis Bond #0 — Arc Mainnet Launch";

  const createTx = await walletClient.writeContract({
    address: FAZABOND_ADDRESS,
    abi: FAZABOND_ABI,
    functionName: "create",
    args: [title, stake, deadline],
  });
  console.log(`Create tx sent: ${createTx}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: createTx });
  console.log(`Create confirmed in block ${receipt.blockNumber}!`);

  const count = await publicClient.readContract({
    address: FAZABOND_ADDRESS,
    abi: FAZABOND_ABI,
    functionName: "bondCount",
  });
  console.log(`Total bonds on Arc Mainnet: ${count}`);

  console.log("\n============================================================");
  console.log("Genesis Bond Created Successfully!");
  console.log(`  Bond ID: ${Number(count) - 1}`);
  console.log(`  Stake: $0.01 USDC`);
  console.log(`  Tx Explorer: https://explorer.arc.io/tx/${createTx}`);
  console.log(`  App URL: https://faza-v1.vercel.app/faza/${Number(count) - 1}`);
  console.log("============================================================\n");
}

main().catch((err) => {
  console.error("Failed to seed bond:", err);
  process.exit(1);
});
