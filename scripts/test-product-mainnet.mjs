import {
  createWalletClient,
  createPublicClient,
  http,
  formatUnits,
  parseAbi,
  defineChain,
  keccak256,
  toHex,
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
const FAZAOTC_ADDRESS = "0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2";
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

async function main() {
  const privateKey =
    process.env.PRIVATE_KEY ||
    (process.env.TEST_PRIVATE_KEY ?? "");

  if (!privateKey) {
    console.error("Please provide PRIVATE_KEY in environment or .env.local");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  console.log(`Using wallet: ${account.address}`);

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

  console.log(`Native gas: ${formatUnits(gasBal, 18)} USDC`);
  console.log(`ERC-20 balance: ${formatUnits(usdcBal, 6)} USDC`);

  const stake = 10_000n; // $0.01 USDC

  // 1. Create Bond
  console.log("\n--- Testing FazaBond on Arc Mainnet ---");
  console.log("Checking USDC allowance for FazaBond...");
  const bondAllowance = await publicClient.readContract({
    address: ARC_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [account.address, FAZABOND_ADDRESS],
  });

  if (bondAllowance < stake) {
    console.log("Approving FazaBond for $0.05 USDC...");
    const approveTx = await walletClient.writeContract({
      address: ARC_USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [FAZABOND_ADDRESS, 50_000n],
    });
    console.log(`Approve tx: ${approveTx}`);
    await publicClient.waitForTransactionReceipt({ hash: approveTx });
    console.log("FazaBond approval confirmed!");
  } else {
    console.log("Allowance already sufficient.");
  }

  const bondDeadline = BigInt(Math.floor(Date.now() / 1000) + 48 * 3600);
  const bondTitle = "Genesis Bond #0 — Show Up on Arc Mainnet";

  console.log(`Creating bond: "${bondTitle}" ($0.01 stake)...`);
  const bondTx = await walletClient.writeContract({
    address: FAZABOND_ADDRESS,
    abi: FAZABOND_ABI,
    functionName: "create",
    args: [bondTitle, stake, bondDeadline],
  });
  console.log(`Bond create tx sent: ${bondTx}`);
  const bondReceipt = await publicClient.waitForTransactionReceipt({ hash: bondTx });
  console.log(`Bond created in block ${bondReceipt.blockNumber}!`);

  const bondCount = await publicClient.readContract({
    address: FAZABOND_ADDRESS,
    abi: FAZABOND_ABI,
    functionName: "bondCount",
  });
  const createdBondId = Number(bondCount) - 1;
  console.log(`Total Mainnet Bonds: ${bondCount} (Latest ID: ${createdBondId})`);

  // 2. Create OTC Deal
  console.log("\n--- Testing FazaOTC on Arc Mainnet ---");
  console.log("Checking USDC allowance for FazaOTC...");
  const otcAllowance = await publicClient.readContract({
    address: ARC_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [account.address, FAZAOTC_ADDRESS],
  });

  if (otcAllowance < stake) {
    console.log("Approving FazaOTC for $0.05 USDC...");
    const approveOtcTx = await walletClient.writeContract({
      address: ARC_USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [FAZAOTC_ADDRESS, 50_000n],
    });
    console.log(`Approve tx: ${approveOtcTx}`);
    await publicClient.waitForTransactionReceipt({ hash: approveOtcTx });
    console.log("FazaOTC approval confirmed!");
  } else {
    console.log("Allowance already sufficient.");
  }

  const termsText = "Genesis Deal #0 on Arc Mainnet. Two-party OTC commitment in USDC. Show up or forfeit.";
  const termsHash = keccak256(toHex(termsText));
  const otcDeadline = BigInt(Math.floor(Date.now() / 1000) + 48 * 3600);
  const asset = "0x0000000000000000000000000000000000000000"; // Offchain bond only

  console.log(`Creating OTC Deal with termsHash: ${termsHash}...`);
  const otcTx = await walletClient.writeContract({
    address: FAZAOTC_ADDRESS,
    abi: FAZAOTC_ABI,
    functionName: "create",
    args: [termsHash, asset, 1n, stake, stake, otcDeadline],
  });
  console.log(`OTC create tx sent: ${otcTx}`);
  const otcReceipt = await publicClient.waitForTransactionReceipt({ hash: otcTx });
  console.log(`OTC Deal created in block ${otcReceipt.blockNumber}!`);

  const dealCount = await publicClient.readContract({
    address: FAZAOTC_ADDRESS,
    abi: FAZAOTC_ABI,
    functionName: "dealCount",
  });
  const createdDealId = Number(dealCount) - 1;
  console.log(`Total Mainnet OTC Deals: ${dealCount} (Latest ID: ${createdDealId})`);

  console.log("\n============================================================");
  console.log("Arc Mainnet Product Testing Complete!");
  console.log("");
  console.log(`  Bond #0 Page:   https://faza-v1.vercel.app/faza/${createdBondId}`);
  console.log(`  Bond Tx:        https://explorer.arc.io/tx/${bondTx}`);
  console.log("");
  console.log(`  Deal #0 Page:   https://faza-v1.vercel.app/otc/${createdDealId}`);
  console.log(`  Deal Tx:        https://explorer.arc.io/tx/${otcTx}`);
  console.log("");
  console.log(`  Main App Feed:  https://faza-v1.vercel.app (Switch to Arc Mainnet)`);
  console.log("============================================================\n");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
