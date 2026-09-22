# Faza — Mainnet Migration

> Arc Studio deploys to testnet only. Follow these steps yourself after October 14 to move FazaBond to Arc Mainnet.

## What changes

| | Testnet | Mainnet |
|---|---|---|
| Chain ID | `5042002` | `5042` |
| RPC | `https://rpc.testnet.arc.io` | `https://rpc.mainnet.arc.io` |
| Explorer | `https://explorer.testnet.arc.io` | `https://explorer.arc.io` |
| USDC | `0x3600000000000000000000000000000000000000` | Same address |
| activeChain | `arcTestnet` | `arcMainnet` |

USDC address is identical on both networks — no change needed there.

---

## Steps

### 1. Swap the active chain in source

In `src/lib/arc.ts`, change the one export:

```ts
// Before
export const activeChain = arcTestnet;

// After
export const activeChain = arcMainnet;
```

### 2. Deploy FazaBond to Arc Mainnet

Prerequisites: Foundry installed, USDC funded mainnet wallet.

```bash
# Build first
forge build

# Export your private key (local only — never commit)
export PRIVATE_KEY=0x...

# Deploy
forge create contracts/FazaBond.sol:FazaBond \
  --rpc-url https://rpc.mainnet.arc.io \
  --private-key "$PRIVATE_KEY" \
  --broadcast
```

Copy the `Deployed to:` address from the output.

### 3. Update the contract address

In your production environment (Vercel dashboard or `.env.local`):

```
NEXT_PUBLIC_FAZABOND_ADDRESS=0x<new mainnet address>
```

### 4. Keep testnet working

The testnet contract and the testnet deploy of the app remain untouched. To run both in parallel, create a second Vercel project pointing at the `main` branch with testnet env vars, and a production project with mainnet vars — or use Vercel preview/production split.

### 5. Redeploy to Vercel

Push the `activeChain` change and trigger a new Vercel deploy. The app now targets Arc Mainnet and uses real USDC.

---

## Verify it works

1. Fund a mainnet wallet with USDC (bridge from another chain via [bridge.arc.io](https://bridge.arc.io)).
2. Create a bond with a $0.01 stake and a 5-minute deadline.
3. Join from a second wallet.
4. Check in from both.
5. Settle — confirm both stakes are claimable.
