# Faza

**Show up, or forfeit the stake. Agree a deal, or forfeit the bond.**

Faza is an onchain coordination app on Arc. It has two instruments:

1. **Show-up Bond** (`FazaBond`) — two wallets each lock USDC. Both check in before a deadline and each gets their stake back. One ghosts and the other takes both.
2. **OTC Deal Ticket** (`FazaOTC`) — two parties commit to an exchange. For tokens on Arc it settles USDC against the asset (PvP delivery). For offchain stock it commits the terms onchain and enforces a USDC show-up bond.

**Honest framing:** For tokens that live on Arc, Faza settles USDC against the asset in one contract call. For a stock that is still offchain, Faza holds the terms hash and enforces a USDC bond — the share itself moves through your broker. The contract never claims to custody real-world certificates.

---

## Contracts (Arc Testnet)

| Contract | Address | Explorer |
|---|---|---|
| `FazaBond` | `0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221` | [View](https://explorer.testnet.arc.io/address/0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221) |
| `FazaOTC` | `0xe49a617643c87017daa0ed62ea28317710e6c912` | [View](https://explorer.testnet.arc.io/address/0xe49a617643c87017daa0ed62ea28317710e6c912) |

USDC on Arc (testnet and mainnet): `0x3600000000000000000000000000000000000000`

---

## Network

| | Testnet | Mainnet |
|---|---|---|
| Chain ID | 5042002 | 5042 |
| RPC | `https://rpc.testnet.arc.io` | `https://rpc.mainnet.arc.io` |
| Explorer | `https://explorer.testnet.arc.io` | `https://explorer.arc.io` |
| USDC | `0x3600000000000000000000000000000000000000` | same |

---

## Two-wallet demo — Show-up Bond

1. **Wallet A:** Connect to Arc Testnet, get test USDC, click **Bonds → New bond**, set a title, stake $0.10, and a deadline 30 minutes out. Sign two txs (approve + create).
2. **Wallet B:** Connect, open the bond from the feed, click **Join**. Sign two txs (approve + join).
3. **Both wallets:** Open the bond page, click **Check In** before the deadline.
4. **Either wallet:** After the deadline, click **Settle**. Both get their stake back. Explorer link appears on every tx.

Ghost scenario: skip Check In from one wallet, then Settle — the wallet that checked in takes both stakes.

---

## Two-wallet demo — OTC Deal (PvP token)

1. **Wallet A (seller):** Click **OTC → New OTC deal**. Paste a term sheet, enter the Arc ERC-20 token address, size, USDC price, stake, and deadline. Sign (approve USDC stake + create).
2. **Wallet B (buyer):** Open the deal, click **Join** — approves `priceUsdc + stake` USDC. Sign.
3. **Both wallets:** Click **Attest** (confirms you read the same term sheet hash).
4. **Wallet A (seller):** Approve the token contract to let FazaOTC spend your tokens.
5. **Either wallet:** After the deadline, click **Settle** — tokens move seller → buyer, USDC moves buyer → seller, stakes refunded. If seller never approved tokens, buyer gets a forfeit (purchase price + both stakes).

Offchain stock flow: leave asset address blank. Both call **Confirm done** after the broker transfer. Settle after the deadline — both confirmed → stakes refund; one confirmed → that party takes both stakes.

---

## Run locally

```bash
git clone https://github.com/kellycryptos/faza
cd faza
bun install
cp .env.example .env.local
# fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | From [cloud.walletconnect.com](https://cloud.walletconnect.com) |
| `NEXT_PUBLIC_FAZABOND_ADDRESS` | No | Overrides built-in testnet address |
| `NEXT_PUBLIC_FAZAOTC_ADDRESS` | No | Overrides built-in testnet address |

---

## Deploy contracts manually

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

cd faza
bun install  # installs OpenZeppelin

export PRIVATE_KEY=0x...  # your deployer key
forge script scripts/deploy-fazabond.sh --rpc-url https://rpc.testnet.arc.io --broadcast
# or deploy directly:
forge create contracts/FazaBond.sol:FazaBond \
  --rpc-url https://rpc.testnet.arc.io \
  --private-key $PRIVATE_KEY

forge create contracts/FazaOTC.sol:FazaOTC \
  --rpc-url https://rpc.testnet.arc.io \
  --private-key $PRIVATE_KEY
```

---

## How Arc Studio deployed this

Arc Studio wrote the contracts, ran two audit passes (corpus + functional), fixed every finding, compiled with Foundry, and deployed both contracts to Arc Testnet using Circle's Smart Contract Platform. The frontend was scaffolded as a Next.js App Router app, wired to the deployed addresses, and pushed to this repo.

---

## Mainnet section

**Arc Studio stays on testnet.** The contracts at `0xf620...` and `0xe49a...` are on Arc Testnet (chain ID 5042002) and use test USDC only.

To go live on Arc Mainnet (chain ID 5042) before the grant deadline:

1. In `src/lib/arc.ts`, change `export const activeChain = arcTestnet` → `export const activeChain = arcMainnet`
2. Deploy both contracts to mainnet with your own wallet:
   ```
   forge create contracts/FazaBond.sol:FazaBond \
     --rpc-url https://rpc.mainnet.arc.io \
     --private-key $PRIVATE_KEY

   forge create contracts/FazaOTC.sol:FazaOTC \
     --rpc-url https://rpc.mainnet.arc.io \
     --private-key $PRIVATE_KEY
   ```
3. Set `NEXT_PUBLIC_FAZABOND_ADDRESS` and `NEXT_PUBLIC_FAZAOTC_ADDRESS` to the new addresses in your Vercel env vars
4. Redeploy on Vercel

See `MAINNET.md` for the full checklist. Real USDC is involved — review the contracts independently before moving to mainnet.

---

## Stack

- Next.js 15 App Router, TypeScript
- wagmi v2 + viem, ConnectKit
- Foundry (forge) for contracts
- OpenZeppelin 5.1.0
- Arc Testnet (chain ID 5042002), USDC gas

---

## License

MIT
