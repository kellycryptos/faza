# Faza

**Show up, or forfeit the stake.**

Faza is a two-party coordination app on [Arc](https://arc.io). Two wallets lock USDC, commit to the same terms, and settle onchain.

It is not a DEX, not a brokerage, and not a content paywall.

| | |
|---|---|
| App | [faza-v1.vercel.app](https://faza-v1.vercel.app/) |
| Status | Live on Arc Testnet |
| Repo | [github.com/kellycryptos/faza](https://github.com/kellycryptos/faza) |
| Built by | [@kellycryptos](https://github.com/kellycryptos) |
| Network | Arc Testnet `5042002` now. Arc Mainnet `5042` before the grant deadline. |
| License | MIT |

---

## What it does

Two instruments, one UI.

**Bond.** Wallet A opens a Faza with a title, a USDC stake, and a deadline. Wallet B joins with the same stake. Both check in onchain before time runs out. Settle refunds both, or the wallet that showed takes both stakes. Then each side `claim()`s their USDC.

**OTC ticket.** Seller posts a term sheet. The contract stores `keccak256(terms)` plus size, price, and asset. Buyer must join with the same hash. Both attest.

- If `asset` is an ERC-20 on Arc, settle is PvP: tokens to the buyer, USDC to the seller, stakes back.
- If `asset` is `address(0)`, the share moves offchain. Faza only enforces the USDC bond and the terms hash. The contract does not custody stock certificates.

That split is the product. Do not read this as an onchain stock exchange.

---

## Why Arc

USDC is gas on Arc. Settlement is cheap enough that a $0.10 bond is usable. Both legs of a small ticket can finish in a few transactions without a separate gas token.

---

## Live contracts (Arc Testnet)

| Contract | Address | Explorer |
|---|---|---|
| `FazaBond` | `0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221` | [explorer](https://explorer.testnet.arc.io/address/0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221) |
| `FazaOTC` | `0xe49a617643c87017daa0ed62ea28317710e6c912` | [explorer](https://explorer.testnet.arc.io/address/0xe49a617643c87017daa0ed62ea28317710e6c912) |
| USDC | `0x3600000000000000000000000000000000000000` | same address on testnet and mainnet |

`FazaBoard.sol` is leftover from an earlier note-paywall sketch. Ignore it.

---

## Network

| | Testnet | Mainnet |
|---|---|---|
| Chain ID | `5042002` | `5042` |
| RPC | `https://rpc.testnet.arc.io` | `https://rpc.mainnet.arc.io` |
| Explorer | `https://explorer.testnet.arc.io` | `https://explorer.arc.io` |
| USDC | `0x3600000000000000000000000000000000000000` | same |

---

## Judge path

Open [faza-v1.vercel.app](https://faza-v1.vercel.app/). Switch the wallet to Arc Testnet.

**Bond (do this first)**

1. Fund two wallets with test USDC from [faucet.circle.com](https://faucet.circle.com).
2. Wallet A: Bonds → New bond → title, $0.10, deadline ~30 minutes out. Approve + create.
3. Wallet B: open the bond → Join. Approve + join.
4. Both wallets: Check in before the deadline.
5. After the deadline: Settle, then Claim. Save the explorer links.

Ghost path: skip check-in on one wallet. The wallet that checked in takes both stakes.

**OTC, offchain stock (bond only)**

1. Leave asset address blank.
2. Paste a short term sheet. Confirm the live hash before publish.
3. Buyer joins with the same hash.
4. Both Attest, both Confirm done, then Settle and Claim.

**OTC, PvP token**

Same as above, with an Arc ERC-20 in the asset field. Seller must approve that token before settle. If the seller never delivers, the buyer can take a forfeit of purchase price plus both stakes.

---

## Grant one-liner

Faza is an onchain ticket for two-party deals on Arc. For tokens on Arc it settles USDC against the asset in one contract. For stock that is still offchain it commits the terms hash and enforces a USDC show-up bond.

---

## Stack

- Next.js 15 App Router, TypeScript
- wagmi v2, viem, ConnectKit
- Foundry + OpenZeppelin 5
- Arc, USDC as gas
- Hosted on Vercel

```
contracts/FazaBond.sol      create, join, checkIn, settle, cancel, claim
contracts/FazaOTC.sol       create, join, attest, confirmDone, settle, claim
src/app/page.tsx            Bonds / OTC tabs
src/app/faza/[id]           bond page
src/app/otc/[id]            deal page
src/lib/arc.ts              chain config
MAINNET.md                  manual mainnet deploy
```

---

## Run locally

```bash
git clone https://github.com/kellycryptos/faza
cd faza
bun install
cp .env.example .env.local
# set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | [cloud.walletconnect.com](https://cloud.walletconnect.com) |
| `NEXT_PUBLIC_FAZABOND_ADDRESS` | No | defaults to the testnet bond |
| `NEXT_PUBLIC_FAZAOTC_ADDRESS` | No | defaults to the testnet OTC contract |

Vercel production should set all three. WalletConnect is required for the connect modal. The two contract vars should match the table above until mainnet.

---

## Mainnet

Arc Studio deploys to testnet only. The grant needs Arc Mainnet.

1. Read `MAINNET.md`.
2. Deploy `FazaBond` and `FazaOTC` to chain id `5042`.
3. Flip `activeChain` to `arcMainnet` in `src/lib/arc.ts`.
4. Set both contract env vars on Vercel.
5. Redeploy [faza-v1.vercel.app](https://faza-v1.vercel.app/).
6. Repeat the two-wallet bond loop with real USDC and keep the explorer links.

Review the contracts before mainnet. Real USDC moves.

---

## Disclaimer

Faza is experimental software. Offchain stock tickets do not transfer securities. You are responsible for any deal you open, including local law around actual share transfers.

---

## License

MIT
