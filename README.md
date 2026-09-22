# Faza

**Show up, or forfeit the stake.**

Faza is a two-party show-up bond on Arc. One wallet opens a bond with a title, a USDC stake, and a deadline. A second wallet joins with the same stake. Both check in onchain before the deadline, and the stakes are refunded. One ghosts, and the other takes both.

---

## Live contract

| | |
|---|---|
| **Contract** | `FazaBond` |
| **Network** | Arc Testnet |
| **Chain ID** | `5042002` |
| **Address** | `0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221` |
| **Explorer** | https://explorer.testnet.arc.io/address/0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221 |
| **USDC** | `0x3600000000000000000000000000000000000000` |

---

## Two-wallet demo

1. **Fund both wallets** — get testnet USDC from [faucet.circle.com](https://faucet.circle.com) or the Arc Studio sidebar.
2. **Wallet A** — connect to Arc Testnet, click **New bond**, set a title, stake $0.50 USDC, deadline 30 minutes out. Approve USDC, sign the create tx. Copy the `/faza/[id]` URL.
3. **Wallet B** — open the URL in a second browser profile, click **Join**, approve USDC, sign. Both stakes are now locked.
4. **Both wallets** — before the deadline, each clicks **Check in** and signs.
5. **Either wallet** — after the deadline, click **Settle**. The contract refunds both stakes and emits a `Settled` event with an explorer link.
6. **Ghost scenario** — skip step 4 from one wallet. Settle after the deadline. The wallet that checked in receives both stakes.

---

## Arc network

| | Testnet | Mainnet |
|---|---|---|
| Chain ID | `5042002` | `5042` |
| RPC | `https://rpc.testnet.arc.io` | `https://rpc.mainnet.arc.io` |
| Explorer | `https://explorer.testnet.arc.io` | `https://explorer.arc.io` |
| USDC | `0x3600000000000000000000000000000000000000` | Same |

On Arc, USDC is the native gas token. Gas fees are stable and measured in fractions of a cent, so a $0.01 stake is practical. No separate ETH required.

---

## Run locally

```bash
cp .env.example .env.local
# Add your WalletConnect Project ID (free at cloud.walletconnect.com)
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Required | Value |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | From [cloud.walletconnect.com](https://cloud.walletconnect.com) |
| `NEXT_PUBLIC_FAZABOND_ADDRESS` | Yes | `0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221` |

---

## How Arc Studio deployed this

Arc Studio scaffolded the full-stack app, wrote `FazaBond.sol`, ran a two-pass security audit (finding and fixing: stakes locked with no cancel path; push-based settlement bricked by blocklisted addresses), compiled the contract with Foundry, deployed it to Arc Testnet, and wired the deployed address into the frontend — all without leaving the chat. The testnet contract at the address above is live and callable.

---

## Architecture

```
contracts/FazaBond.sol         — create, join, checkIn, settle, cancel, claim
src/lib/arc.ts                 — chain config, helpers, activeChain
src/lib/contract.ts            — ABI + address
src/components/CreateForm.tsx  — USDC approve + create tx
src/components/BondCard.tsx    — feed card with status pills
src/components/BondActions.tsx — join / checkIn / settle / cancel / claim
src/hooks/useBonds.ts          — batch-reads all bonds from chain
src/app/page.tsx               — home: hero, stats, feed
src/app/faza/[id]/page.tsx     — single bond: two-column parties, countdown, actions
src/app/about/page.tsx         — what Faza is + judge path
```

Bond lifecycle:
1. `create(title, stake, deadline)` — USDC locked from creator
2. `join(bondId)` — same stake locked from joiner
3. `checkIn(bondId)` — each party marks themselves present before deadline
4. `settle(bondId)` — credits `claimable[addr]` after deadline
5. `claim()` — each party withdraws their USDC (pull model, Arc-blocklist safe)
6. `cancel(bondId)` — creator reclaims stake if nobody joined and deadline passed

---

## Mainnet

> Arc Studio deploys to testnet only. Studio gets you the working app. You move the same contract to mainnet manually before the grant deadline.

See **MAINNET.md** for exact steps:

1. Change `activeChain = arcMainnet` in `src/lib/arc.ts`
2. Deploy `FazaBond` to Arc Mainnet (chain ID `5042`) with Foundry
3. Set `NEXT_PUBLIC_FAZABOND_ADDRESS` to the new address
4. Redeploy the frontend to Vercel

The USDC address (`0x3600…0000`) is the same on mainnet and testnet — no change needed there.

---

## License

MIT
