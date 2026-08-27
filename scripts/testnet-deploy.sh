#!/usr/bin/env bash
# ============================================================
#  ZeroProof — Midnight Testnet Deployment Script
#
#  Deploys Compact smart contracts to the Midnight testnet.
#  Prerequisites:
#    1. compact CLI installed: npm install -g @midnight-ntwrk/compact-cli
#    2. MIDNIGHT_WALLET_SEED set in .env
#    3. Testnet DUST tokens in your wallet (for gas)
#
#  Usage:
#    bash scripts/testnet-deploy.sh
#    bash scripts/testnet-deploy.sh --dry-run
# ============================================================

set -euo pipefail

# ── Load environment ──────────────────────────────────────────
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

echo ""
echo "🔒 ZeroProof — Midnight Testnet Deployment"
echo "   Network: ${MIDNIGHT_NETWORK:-testnet}"
echo "   RPC URL: ${MIDNIGHT_RPC_URL:-https://rpc.testnet.midnight.network}"
echo "   Dry run: $DRY_RUN"
echo ""

# ── Check prerequisites ───────────────────────────────────────
echo "🔍 Checking prerequisites..."

if ! command -v compact &> /dev/null; then
  echo "❌ compact CLI not found. Install with:"
  echo "   npm install -g @midnight-ntwrk/compact-cli"
  exit 1
fi

if [ -z "${MIDNIGHT_WALLET_SEED:-}" ]; then
  echo "❌ MIDNIGHT_WALLET_SEED not set in .env"
  exit 1
fi

echo "✅ Prerequisites OK"
echo ""

# ── Compile contracts ─────────────────────────────────────────
echo "⚙️  Compiling Compact contracts..."

CONTRACTS_DIR="packages/contracts/src/proofs"
OUTPUT_DIR="packages/contracts/dist"
mkdir -p "$OUTPUT_DIR"

if [ "$DRY_RUN" = "false" ]; then
  compact build "$CONTRACTS_DIR/solvency.compact" \
    --output "$OUTPUT_DIR/solvency" \
    --network "$MIDNIGHT_NETWORK"

  compact build "$CONTRACTS_DIR/compliance.compact" \
    --output "$OUTPUT_DIR/compliance" \
    --network "$MIDNIGHT_NETWORK"

  echo "✅ Contracts compiled successfully"
else
  echo "⏭️  [DRY RUN] Skipping actual compilation"
fi

echo ""

# ── Deploy contracts ──────────────────────────────────────────
echo "🚀 Deploying to Midnight ${MIDNIGHT_NETWORK}..."

DEPLOY_TIMESTAMP=$(date +%s)
ADDRESSES_FILE="packages/contracts/dist/addresses-${MIDNIGHT_NETWORK}.json"

if [ "$DRY_RUN" = "false" ]; then
  # Deploy Solvency contract
  echo "  📄 Deploying SolvencyLedger..."
  SOLVENCY_ADDRESS=$(compact deploy "$OUTPUT_DIR/solvency" \
    --seed "$MIDNIGHT_WALLET_SEED" \
    --rpc "$MIDNIGHT_RPC_URL" \
    --proof-server "$MIDNIGHT_PROOF_SERVER_URL" \
    --format address 2>/dev/null || echo "DEPLOY_FAILED")

  if [[ "$SOLVENCY_ADDRESS" == "DEPLOY_FAILED" ]]; then
    echo "❌ Solvency contract deployment failed"
    exit 1
  fi

  # Deploy Compliance contract
  echo "  📄 Deploying ComplianceLedger..."
  COMPLIANCE_ADDRESS=$(compact deploy "$OUTPUT_DIR/compliance" \
    --seed "$MIDNIGHT_WALLET_SEED" \
    --rpc "$MIDNIGHT_RPC_URL" \
    --proof-server "$MIDNIGHT_PROOF_SERVER_URL" \
    --format address 2>/dev/null || echo "DEPLOY_FAILED")

  if [[ "$COMPLIANCE_ADDRESS" == "DEPLOY_FAILED" ]]; then
    echo "❌ Compliance contract deployment failed"
    exit 1
  fi

  # Save addresses
  cat > "$ADDRESSES_FILE" << EOF
{
  "solvency": "$SOLVENCY_ADDRESS",
  "compliance": "$COMPLIANCE_ADDRESS",
  "network": "$MIDNIGHT_NETWORK",
  "deployedAt": $DEPLOY_TIMESTAMP,
  "rpcUrl": "$MIDNIGHT_RPC_URL"
}
EOF

  echo ""
  echo "✅ Deployment successful!"
  echo ""
  echo "📝 Contract Addresses (saved to $ADDRESSES_FILE):"
  echo "   Solvency:   $SOLVENCY_ADDRESS"
  echo "   Compliance: $COMPLIANCE_ADDRESS"
  echo ""
  echo "🔍 Explorer:"
  echo "   https://explorer.testnet.midnight.network/address/$SOLVENCY_ADDRESS"
else
  echo "⏭️  [DRY RUN] Would deploy SolvencyLedger + ComplianceLedger"
  cat > "$ADDRESSES_FILE" << EOF
{
  "solvency": "DRY_RUN_ADDRESS",
  "compliance": "DRY_RUN_ADDRESS",
  "network": "$MIDNIGHT_NETWORK",
  "deployedAt": $DEPLOY_TIMESTAMP,
  "note": "Dry run — not actually deployed"
}
EOF
  echo "✅ [DRY RUN] Address file created at: $ADDRESSES_FILE"
fi

echo ""
echo "📋 Next steps:"
echo "   1. Update NEXT_PUBLIC_CONTRACT_SOLVENCY in .env"
echo "   2. Update NEXT_PUBLIC_CONTRACT_COMPLIANCE in .env"
echo "   3. Restart the backend API"
echo ""
