# Faza — Project Memory

## Deployed Contracts

| Contract | Chain | Address | Explorer |
|---|---|---|---|
| FazaBond | Arc Testnet (5042002) | `0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221` | [View](https://explorer.testnet.arc.io/address/0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221) |

(Old FazaBoard at `0x138188a8633b3e7ed86bbb7aa7c7a7faf9e90818` — deprecated, note-board product replaced.)

## Active Chain

`activeChain = arcTestnet` (chain ID 5042002). See MAINNET.md to switch to Arc Mainnet (chain ID 5042).

## Key Files

- `contracts/FazaBond.sol` — onchain bond contract
- `src/lib/arc.ts` — chain config, activeChain export, USDC address, helpers
- `src/lib/contract.ts` — ABI + FAZABOND_ADDRESS from env
- `src/components/CreateForm.tsx` — create bond (approve + create tx)
- `src/components/BondCard.tsx` — compact feed card
- `src/components/BondActions.tsx` — join / checkIn / settle / cancel / claim
- `src/hooks/useBonds.ts` — batch-reads all bonds from chain
- `src/app/page.tsx` — home feed + create form
- `src/app/faza/[id]/page.tsx` — single bond page
- `src/app/about/page.tsx` — 6-sentence explainer for judges
