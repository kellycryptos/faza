# Faza — Mainnet Deploy

> Arc Studio's platform deployer targets testnets only. Mainnet deploy is manual.
> Run the steps below from your own machine after you have tested the full bond and OTC loops on testnet.

---

## Network facts

| | Value |
|---|---|
| Chain ID | `5042` |
| RPC | `https://rpc.mainnet.arc.io` |
| Explorer | `https://explorer.arc.io` |
| USDC | `0x3600000000000000000000000000000000000000` |
| Native gas | USDC (same pool as ERC-20 balance) |

USDC address is identical on testnet (`5042002`) and mainnet (`5042`) — no change needed in the contracts.

---

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed (`forge` in PATH)
- A mainnet wallet private key in `$PRIVATE_KEY` (never commit this)
- That wallet must hold Arc Mainnet USDC for gas. Bridge from another chain at [bridge.arc.io](https://bridge.arc.io) if needed. A few cents covers both deploys.

---

## Step 1 — Compile

```bash
cd /path/to/faza
forge build
```

Both `FazaBond` and `FazaOTC` must compile with zero errors before proceeding. `via_ir = true` is already set in `foundry.toml`.

---

## Step 2 — Deploy both contracts (one command)

```bash
export PRIVATE_KEY=0x...   # your funded mainnet wallet key — never commit
bash scripts/deploy-mainnet.sh
```

The script deploys `FazaBond` then `FazaOTC`, prints both addresses, and shows the exact Vercel env var lines to copy.

### Manual alternative (if you prefer running forge directly)

```bash
# FazaBond
forge create contracts/FazaBond.sol:FazaBond \
  --rpc-url https://rpc.mainnet.arc.io \
  --private-key "$PRIVATE_KEY" \
  --broadcast

# FazaOTC
forge create contracts/FazaOTC.sol:FazaOTC \
  --rpc-url https://rpc.mainnet.arc.io \
  --private-key "$PRIVATE_KEY" \
  --broadcast
```

Copy the `Deployed to:` address from each output.

---

## Step 3 — Verify USDC constant (optional sanity check)

```bash
# Replace 0xBOND and 0xOTC with actual addresses
cast call 0xBOND "USDC()(address)" --rpc-url https://rpc.mainnet.arc.io
cast call 0xOTC  "USDC()(address)" --rpc-url https://rpc.mainnet.arc.io
# Both should return: 0x3600000000000000000000000000000000000000
```

---

## Step 4 — Set Vercel environment variables

In the Vercel dashboard for `faza-v1.vercel.app`, go to **Settings → Environment Variables** and add:

```
NEXT_PUBLIC_FAZABOND_ADDRESS=0x<mainnet FazaBond address>
NEXT_PUBLIC_FAZAOTC_ADDRESS=0x<mainnet FazaOTC address>
```

Leave `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` unchanged.

---

## Step 5 — Flip the active chain in source

In `src/lib/arc.ts`, change the one export:

```ts
// Before (testnet)
export const activeChain = arcTestnet;

// After (mainnet)
export const activeChain = arcMainnet;
```

---

## Step 6 — Push and redeploy

```bash
git add src/lib/arc.ts
git commit -m "switch to Arc Mainnet"
git push origin main
```

Vercel will auto-deploy. The Navbar badge will change from **ARC TESTNET** to **ARC MAINNET**.

---

## Step 7 — Keep testnet working in parallel (optional)

The testnet contracts at the original addresses remain untouched. To run both environments:
- Create a second Vercel project pointing at a `testnet` branch with the testnet env vars
- Production project (`main`) uses mainnet vars

---

## Testnet addresses (reference)

| Contract | Arc Testnet (`5042002`) | Explorer |
|---|---|---|
| FazaBond | `0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221` | [View](https://explorer.testnet.arc.io/address/0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221) |
| FazaOTC | `0xe49a617643c87017daa0ed62ea28317710e6c912` | [View](https://explorer.testnet.arc.io/address/0xe49a617643c87017daa0ed62ea28317710e6c912) |

---

## Mainnet addresses (fill in after deploy)

| Contract | Arc Mainnet (`5042`) | Explorer |
|---|---|---|
| FazaBond | `pending` | — |
| FazaOTC | `pending` | — |

Paste the addresses here and push once you have them.
