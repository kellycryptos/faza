import fs from "fs";
import path from "path";
import { createWalletClient, createPublicClient, http, formatUnits, defineChain } from "viem";
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

function loadEnvKey() {
  if (process.env.PRIVATE_KEY) return process.env.PRIVATE_KEY;
  if (fs.existsSync(".env.local")) {
    const content = fs.readFileSync(".env.local", "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      const match = trimmed.match(/^(?:export\s+)?PRIVATE_KEY\s*=\s*(.*)$/);
      if (match) {
        let val = match[1].trim();
        val = val.replace(/^["']|["']$/g, "").trim();
        val = val.split(/\s+#/)[0].trim();
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
    console.error("Please add to .env.local:\n  PRIVATE_KEY=0x...");
    process.exit(1);
  }

  const formattedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const account = privateKeyToAccount(formattedKey);
  console.log(`Deployer address: ${account.address}`);

  const publicClient = createPublicClient({
    chain: arcMainnet,
    transport: http("https://rpc.mainnet.arc.io"),
  });

  const walletClient = createWalletClient({
    account,
    chain: arcMainnet,
    transport: http("https://rpc.mainnet.arc.io"),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Account gas balance: ${formatUnits(balance, 18)} USDC`);

  if (balance === 0n) {
    console.error("\nERROR: Deployer wallet has 0 USDC balance on Arc Mainnet.");
    console.error(`Please fund ${account.address} with a small amount (~$0.20 USDC) on Arc Mainnet.`);
    process.exit(1);
  }

  const bondArtifact = JSON.parse(fs.readFileSync("cache/compiled/FazaBond.json", "utf8"));
  const otcArtifact = JSON.parse(fs.readFileSync("cache/compiled/FazaOTC.json", "utf8"));

  console.log("\nDeploying FazaBond to Arc Mainnet...");
  const bondTxHash = await walletClient.deployContract({
    abi: bondArtifact.abi,
    bytecode: bondArtifact.bytecode,
  });
  console.log(`FazaBond deploy tx sent: ${bondTxHash}`);
  const bondReceipt = await publicClient.waitForTransactionReceipt({ hash: bondTxHash });
  const bondAddress = bondReceipt.contractAddress;
  console.log(`FazaBond deployed at: ${bondAddress}`);

  console.log("\nDeploying FazaOTC to Arc Mainnet...");
  const otcTxHash = await walletClient.deployContract({
    abi: otcArtifact.abi,
    bytecode: otcArtifact.bytecode,
  });
  console.log(`FazaOTC deploy tx sent: ${otcTxHash}`);
  const otcReceipt = await publicClient.waitForTransactionReceipt({ hash: otcTxHash });
  const otcAddress = otcReceipt.contractAddress;
  console.log(`FazaOTC deployed at: ${otcAddress}`);

  console.log("\nVerifying USDC address on deployed contracts...");
  const bondUsdc = await publicClient.readContract({
    address: bondAddress,
    abi: bondArtifact.abi,
    functionName: "USDC",
  });
  const otcUsdc = await publicClient.readContract({
    address: otcAddress,
    abi: otcArtifact.abi,
    functionName: "USDC",
  });
  console.log(`FazaBond.USDC() = ${bondUsdc}`);
  console.log(`FazaOTC.USDC()  = ${otcUsdc}`);

  console.log("\n============================================================");
  console.log("Mainnet Deployment Complete!");
  console.log(`  NEXT_PUBLIC_MAINNET_FAZABOND_ADDRESS=${bondAddress}`);
  console.log(`  NEXT_PUBLIC_MAINNET_FAZAOTC_ADDRESS=${otcAddress}`);
  console.log(`  Explorer Bond: https://explorer.arc.io/address/${bondAddress}`);
  console.log(`  Explorer OTC:  https://explorer.arc.io/address/${otcAddress}`);
  console.log("============================================================\n");
}

main().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
