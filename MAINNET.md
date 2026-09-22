# Faza — Mainnet Migration

> Arc Studio deploys to testnet only. Follow these steps yourself to move both contracts to Arc Mainnet (chain ID 5042). FazaBoard.sol is deprecated — ignore it.

## What changes

| | Testnet | Mainnet |
|---|---|---|
| Chain ID | `5042002` | `5042` |
| RPC | `https://rpc.testnet.arc.io` | `https://rpc.mainnet.arc.io` |
| Explorer | `https://explorer.testnet.arc.io` | `https://explorer.arc.io` |
| USDC | `0x3600000000000000000000000000000000000000` | Same address |
| `activeChain` | `arcTestnet` | `arcMainnet` |

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

Prerequisites: Foundry installed, mainnet wallet funded with USDC for gas.

```bash
forge build

export PRIVATE_KEY=0x...   # your mainnet deployer key — never commit

forge create contracts/FazaBond.sol:FazaBond \
  --rpc-url https://rpc.mainnet.arc.io \
  --private-key "$PRIVATE_KEY"
```

Note the `Deployed to:` address — call it `BOND_MAINNET`.

### 3. Deploy FazaOTC to Arc Mainnet

```bash
forge create contracts/FazaOTC.sol:FazaOTC \
  --rpc-url https://rpc.mainnet.arc.io \
  --private-key "$PRIVATE_KEY"
```

Note the `Deployed to:` address — call it `OTC_MAINNET`.

### 4. Set environment variables

In your Vercel dashboard (or `.env.local` for local mainnet testing):

```
NEXT_PUBLIC_FAZABOND_ADDRESS=<BOND_MAINNET>
NEXT_PUBLIC_FAZAOTC_ADDRESS=<OTC_MAINNET>
```

Both variables must be set. The app falls back to the hardcoded testnet addresses when they are absent — wrong on mainnet.

### 5. Redeploy to Vercel

Push the `activeChain` change, set the two env vars in Vercel, and trigger a new deploy. The app now targets Arc Mainnet and uses real USDC.

### 6. Keep testnet working in parallel (optional)

Create a second Vercel project pointing at the same repo with testnet env vars. The testnet contracts at the original addresses remain live — no action needed on-chain.

---

## Verify it works after mainnet deploy

**Bond loop:**
1. Fund a mainnet wallet with USDC (bridge from another chain via [bridge.arc.io](https://bridge.arc.io)).
2. Create a bond with a $0.01 stake and a 10-minute deadline.
3. Join from Wallet B.
4. Check in from both wallets.
5. After deadline: Settle, then Claim. Confirm both USDC balances updated.

**Offchain OTC loop:**
1. Wallet A creates an OTC deal: asset blank (offchain), terms hash, stake, 10-minute deadline.
2. Wallet B joins with the same terms hash.
3. Both attest.
4. Both confirm done before deadline.
5. After deadline: Settle, then Claim.

**PvP OTC loop (only if you have an Arc ERC-20):**
1. Wallet A creates deal with asset = ERC-20 token address, size, and USDC price.
2. Wallet B joins — approves `priceUsdc + stake` USDC.
3. Both attest.
4. Wallet A approves FazaOTC to spend `size` tokens.
5. After deadline: Settle — tokens move A→B, USDC moves B→A, stakes refunded.

---

## Addresses to record after mainnet deploy

| Contract | Mainnet address | Explorer |
|---|---|---|
| `FazaBond` | `TBD — fill after deploy` | `https://explorer.arc.io/address/<addr>` |
| `FazaOTC` | `TBD — fill after deploy` | `https://explorer.arc.io/address/<addr>` |

Update this file and `README.md` with the real addresses before grant submission.
