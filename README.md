# Faza

**Autonomous Two-Party Micro-Bonds & Cryptographic OTC Deal Tickets on Arc**

*Show up, or forfeit the stake.*

Faza is a trustless, bilateral coordination protocol built natively on [Arc](https://arc.io). Two counterparties lock USDC into smart contract escrow, commit to mathematically identical terms, and settle purely onchain with cryptographic finality.

It is designed specifically for peer-to-peer commitments: show-up bonds, service milestones, bilateral SLAs, and OTC deal tickets.

| Metric / Parameter | Value |
|---|---|
| **Production App** | [faza-v1.vercel.app](https://faza-v1.vercel.app/) |
| **Primary Network** | Arc Mainnet (Chain ID `5042`) |
| **Sandbox Network** | Arc Testnet (Chain ID `5042002`) |
| **Settlement & Gas Token** | Native USDC (`0x3600000000000000000000000000000000000000`) |
| **License** | MIT |

---

## What We Built

Traditional contracts between two individuals suffer from two fundamental problems:
1. **Ghosting & Coordination Friction**: No financial penalty exists when a counterparty fails to show up or uphold a verbal agreement.
2. **Fee Drag**: On Ethereum or L2s, setting up an escrow for small commitments ($1 to $50) is impractical because multi-asset gas fees eat the principal before settlement.

Faza solves this by implementing autonomous state machines on Arc, where **USDC is the native gas token**. Because transaction fees cost fractions of a cent and require no separate gas token, micro-commitments from $0.01 to $100 become economically viable.

Faza provides two core financial instruments:

### 1. Show-Up Bonds (`FazaBond.sol`)

A two-wallet mutual assurance contract where both parties place equal capital at stake to guarantee presence and performance:

- **Create**: Wallet A initiates a bond by depositing a USDC stake ($0.01–$100), specifying a title and a strict timestamp deadline.
- **Join**: Wallet B matches the exact stake amount into the contract before the deadline.
- **Check-In**: Both parties must submit an onchain `checkIn()` transaction before the deadline expires.
- **Settlement Outcomes**:
  - **Mutual Compliance**: If both wallets check in, both receive 100% of their deposited stakes back.
  - **One-Sided Ghosting**: If only one wallet checks in before the deadline, that wallet claims the entire pool (both stakes), penalizing the ghosting party.
  - **Mutual Failure**: If neither wallet checks in, both original stakes are returned upon settlement.
  - **Unjoined Cancellation**: If no counterparty joins before the deadline, the creator can safely cancel and recover their initial deposit.

---

### 2. Cryptographic OTC Deal Tickets (`FazaOTC.sol`)

A bilateral trade ticket that cryptographically anchors contractual terms onchain and coordinates settlement:

- **Terms Hashing**: The seller writes out the agreement terms. The contract stores the cryptographic commitment `keccak256(terms)` alongside trade size, USDC price, collateral stake, and expiration deadline.
- **Strict Verification**: The buyer can only join by passing the matching hash. If a single character in the terms differs, the transaction reverts with `HashMismatch()`.
- **Dual Settlement Modes**:
  1. **Onchain PvP Token Swap (`asset != address(0)`)**:
     - Used for native Arc ERC-20 tokens.
     - Buyer deposits the agreed purchase price in USDC plus their collateral stake.
     - Seller deposits their collateral stake and approves token delivery.
     - Both parties attest to the terms.
     - Upon settlement, the contract executes an atomic delivery: tokens go to the buyer, USDC purchase price goes to the seller, and both collateral stakes are refunded.
     - **Default Protection**: If the seller fails to deliver the tokens (insufficient allowance or balance), the seller forfeits their collateral stake, and the buyer receives a full refund of their purchase price plus both stakes.
  2. **Offchain Asset Agreement with Collateral Bond (`asset == address(0)`)**:
     - Used for physical goods, private equity, advisory milestones, or real-world agreements.
     - The contract stores the immutable terms hash and holds a mutual USDC collateral stake.
     - Counterparties execute the transfer offchain, then call `confirmDone()`.
     - Non-defaulting counterparties are protected by onchain forfeit penalties.

---

## Live Contracts & Verification

Both contracts are deployed and verified on Arc Mainnet and Arc Testnet using Arc's native USDC predeploy contract.

### Arc Mainnet (`5042`) — Primary Production

| Contract | Address | Explorer Link |
|---|---|---|
| **FazaBond** | `0x3e925db0bdcb64991f21a8c32b778c3265b349df` | [View on Arc Explorer](https://explorer.arc.io/address/0x3e925db0bdcb64991f21a8c32b778c3265b349df) |
| **FazaOTC** | `0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2` | [View on Arc Explorer](https://explorer.arc.io/address/0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2) |
| **USDC Predeploy** | `0x3600000000000000000000000000000000000000` | Native gas & ERC-20 settlement |

### Arc Testnet (`5042002`) — Sandbox Environment

| Contract | Address | Explorer Link |
|---|---|---|
| **FazaBond** | `0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221` | [View on Testnet Explorer](https://explorer.testnet.arc.io/address/0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221) |
| **FazaOTC** | `0xe49a617643c87017daa0ed62ea28317710e6c912` | [View on Testnet Explorer](https://explorer.testnet.arc.io/address/0xe49a617643c87017daa0ed62ea28317710e6c912) |
| **USDC Predeploy** | `0x3600000000000000000000000000000000000000` | Native gas & ERC-20 settlement |

---

## Technical Architecture & Security Patterns

- **Pull-over-Push Settlement**: The protocol avoids pushing funds directly in state transition transactions. Settle operations allocate balances into a `claimable[address]` ledger, and users call `claim()` to withdraw. This eliminates reentrancy vulnerabilities and prevents denial-of-service (DoS) from malicious fallback hooks.
- **SafeERC20 & Reentrancy Guards**: All external token interactions utilize OpenZeppelin's `SafeERC20` wrapper and non-reentrant execution guards.
- **Single-Token Native Gas Advantage**: Because Arc uses USDC natively for gas, transactions never fail due to lack of an auxiliary L1 token. Both gas fees and principal settlements draw from the same balance pool.

```
contracts/
├── FazaBond.sol       # Bilateral micro-bonds: create, join, checkIn, settle, cancel, claim
└── FazaOTC.sol        # Bilateral OTC tickets: create, join, attest, confirmDone, settle, claim

src/
├── app/
│   ├── layout.tsx     # Root layout with Web3 providers, metadata, and SVG favicons
│   ├── page.tsx       # Live feed, tabs (Bonds / OTC), creation modals, and state filters
│   ├── about/         # In-depth architectural explanation and contract references
│   ├── faza/[id]/     # Individual bond dashboard, timer, action triggers
│   └── otc/[id]/      # Individual OTC deal dashboard, hash verifier, trade states
├── components/
│   ├── FazaLogo.tsx   # Scalable vector emblem and brand typography
│   ├── Navbar.tsx     # Network switcher (Mainnet/Testnet), USDC balance tracker, wallet button
│   ├── ProtocolGuide.tsx # Live protocol architecture and quick execution guide
│   ├── BondCard.tsx   # Real-time state cards for active bonds
│   └── DealCard.tsx   # Real-time state cards for OTC deal tickets
└── lib/
    ├── arc.ts         # Chain configurations, RPC URLs, USDC contract addresses
    ├── contract.ts    # FazaBond ABI and contract resolver
    └── otc-contract.ts# FazaOTC ABI and contract resolver
```

---

## Execution & Testing Walkthrough

You can test either on **Arc Mainnet** (bridging USDC via [bridge.arc.io](https://bridge.arc.io)) or **Arc Testnet** (using test tokens from [faucet.circle.com](https://faucet.circle.com)).

### Flow 1: Show-Up Bond (Bilateral Commitment)

1. **Create**: Connect Wallet A. On the **Bonds** tab, click **New bond**. Input a title, a stake (e.g. `$0.10`), and set a deadline. Approve USDC allowance and confirm transaction.
2. **Join**: Open the bond link with Wallet B. Click **Join**, approve the matching stake, and submit the join transaction.
3. **Check-In**: Both wallets click **Check in** before the deadline expires.
4. **Settle & Claim**: Once the deadline passes, either wallet clicks **Settle**. Both parties now call **Claim** to withdraw their refunded stakes.
5. **Ghosting Forfeiture Path**: If Wallet B fails to check in before the deadline, Wallet A settles and claims `$0.20` (both stakes combined).

### Flow 2: OTC Deal Ticket (Cryptographic Term Sheet)

1. **Create Deal**: On the **OTC** tab, click **New deal**.
   - For Arc ERC-20 tokens, provide the token contract address.
   - For offchain agreements, leave the asset address blank.
   - Enter size, price in USDC, collateral stake, and paste the term sheet text.
2. **Join Deal**: Counterparty inspects terms and confirms the calculated `keccak256` hash matches before submitting the join transaction.
3. **Attestation & Confirmation**: Counterparties confirm status via `attest()` and `confirmDone()`.
4. **Settlement**: Upon deadline arrival, `settle()` executes the atomic token/USDC transfer or settles the forfeit bonds based on performance.

---

## Local Development

### Requirements
- [Node.js](https://nodejs.org) (v20+ or v22+)
- [Bun](https://bun.sh) or `npm`

### Setup

```bash
# Clone repository
git clone https://github.com/kellycryptos/faza.git
cd faza

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

Populate `.env.local`:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_MAINNET_FAZABOND_ADDRESS=0x3e925db0bdcb64991f21a8c32b778c3265b349df
NEXT_PUBLIC_MAINNET_FAZAOTC_ADDRESS=0x84a4d4c0b1ccb2bef624d46d4c4e70470f9ebdb2
NEXT_PUBLIC_FAZABOND_ADDRESS=0xf620ae5e8d024e04ece4fc6ecf69f70c54c50221
NEXT_PUBLIC_FAZAOTC_ADDRESS=0xe49a617643c87017daa0ed62ea28317710e6c912
```

### Run Local Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Disclaimer

Faza is smart contract software providing trustless bilateral escrow and cryptographic term commitments. Offchain agreement tickets do not legally tokenize or transfer regulated equity certificates onchain. Users are responsible for evaluating compliance with applicable local jurisdictions regarding real-world asset agreements.

---

## License

MIT
