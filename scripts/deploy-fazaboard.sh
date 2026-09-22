#!/bin/bash
# Deploy FazaBoard.sol to Arc Mainnet
#
# Prerequisites:
#   forge installed (https://getfoundry.sh)
#   PRIVATE_KEY exported in your shell (NOT stored in .env)
#   ARC_MAINNET_RPC_URL exported or defaults to https://rpc.mainnet.arc.io
#
# Usage:
#   export PRIVATE_KEY=0x...
#   bash scripts/deploy-fazaboard.sh
#
# After deploy, copy the printed address and set in .env:
#   NEXT_PUBLIC_FAZABOARD_ADDRESS=0x...

set -e

RPC="${ARC_MAINNET_RPC_URL:-https://rpc.mainnet.arc.io}"
echo "Deploying to Arc Mainnet via $RPC"

# Build first
forge build

# Deploy — do NOT pass --private-key on CI; use a keystore or interactive import.
# For local testing, supply PRIVATE_KEY interactively.
forge create \
  contracts/FazaBoard.sol:FazaBoard \
  --rpc-url "$RPC" \
  --private-key "$PRIVATE_KEY" \
  --verify \
  --verifier blockscout \
  --verifier-url "https://explorer.arc.io/api?" \
  --broadcast

echo ""
echo "Copy the 'Deployed to' address above and add to .env:"
echo "  NEXT_PUBLIC_FAZABOARD_ADDRESS=0x..."
