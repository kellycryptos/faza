# Faza — Project Memory

## Deployed Contracts

| Contract | Chain | Address | Explorer |
|---|---|---|---|
| FazaBond | Arc Mainnet (5042) | `0x3e925db0bdcb64991f21a8c32b778c3265b349df` | [View](https://explorer.arc.io/address/0x3e925db0bdcb64991f21a8c32b778c3265b349df) |
| FazaOTC | Arc Mainnet (5042) | `0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2` | [View](https://explorer.arc.io/address/0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2) |
| FazaBond | Arc Testnet (5042002) | `0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221` | [View](https://explorer.testnet.arc.io/address/0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221) |
| FazaOTC | Arc Testnet (5042002) | `0xe49a617643c87017daa0ed62ea28317710e6c912` | [View](https://explorer.testnet.arc.io/address/0xe49a617643c87017daa0ed62ea28317710e6c912) |

(Old FazaBoard at `0x138188a8633b3e7ed86bbb7aa7c7a7faf9e90818` — deprecated, note-board product replaced.)

## Active Chain

`activeChain = arcMainnet` (chain ID 5042). Both Arc Mainnet and Arc Testnet are supported.

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
