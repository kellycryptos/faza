#!/usr/bin/env bash
# Faza — Arc Mainnet deploy script
# Deploys FazaBond and FazaOTC to Arc Mainnet (chain ID 5042).
#
# Prerequisites:
#   - Foundry installed (forge in PATH)
#   - PRIVATE_KEY env var set to your funded mainnet wallet key (never commit this)
#   - Wallet must hold mainnet USDC for gas (USDC is native gas on Arc)
#
# Usage:
#   export PRIVATE_KEY=0x...
#   bash scripts/deploy-mainnet.sh

set -euo pipefail

RPC="https://rpc.mainnet.arc.io"
EXPLORER="https://explorer.arc.io"

if [ -z "${PRIVATE_KEY:-}" ]; then
  echo "ERROR: PRIVATE_KEY is not set. Export it first:"
  echo "  export PRIVATE_KEY=0x..."
  exit 1
fi

echo "Building contracts..."
forge build

echo ""
echo "Deploying FazaBond to Arc Mainnet..."
BOND_OUT=$(forge create contracts/FazaBond.sol:FazaBond \
  --rpc-url "$RPC" \
  --private-key "$PRIVATE_KEY" \
  --broadcast 2>&1)

echo "$BOND_OUT"
BOND_ADDR=$(echo "$BOND_OUT" | grep "Deployed to:" | awk '{print $3}')

if [ -z "$BOND_ADDR" ]; then
  echo "ERROR: Could not parse FazaBond address from forge output."
  exit 1
fi

echo ""
echo "Deploying FazaOTC to Arc Mainnet..."
OTC_OUT=$(forge create contracts/FazaOTC.sol:FazaOTC \
  --rpc-url "$RPC" \
  --private-key "$PRIVATE_KEY" \
  --broadcast 2>&1)

echo "$OTC_OUT"
OTC_ADDR=$(echo "$OTC_OUT" | grep "Deployed to:" | awk '{print $3}')

if [ -z "$OTC_ADDR" ]; then
  echo "ERROR: Could not parse FazaOTC address from forge output."
  exit 1
fi

echo ""
echo "============================================================"
echo "Deploy complete."
echo ""
echo "  FazaBond : $BOND_ADDR"
echo "  FazaOTC  : $OTC_ADDR"
echo ""
echo "  Explorer (Bond) : $EXPLORER/address/$BOND_ADDR"
echo "  Explorer (OTC)  : $EXPLORER/address/$OTC_ADDR"
echo ""
echo "Set these in Vercel (or .env.local for local mainnet run):"
echo "  NEXT_PUBLIC_FAZABOND_ADDRESS=$BOND_ADDR"
echo "  NEXT_PUBLIC_FAZAOTC_ADDRESS=$OTC_ADDR"
echo ""
echo "Then change activeChain in src/lib/arc.ts:"
echo "  export const activeChain = arcMainnet;"
echo ""
echo "Push the change and redeploy on Vercel."
echo "============================================================"
