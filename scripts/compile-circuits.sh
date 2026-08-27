#!/usr/bin/env bash
# ============================================================
#  ZeroProof — Circom Circuit Compilation & Trusted Setup
#
#  Compiles circuits to WASM and runs the Groth16 Powers of Tau
#  ceremony locally for testing.
#
#  Prerequisites:
#    - circom (Rust binary installed globally)
#    - snarkjs (npm install -g snarkjs)
# ============================================================

set -euo pipefail

cd "$(dirname "$0")/../packages/privacy-sdk"

echo "============================================================"
echo "🔒 ZeroProof — ZK Circuit Compiler & Setup"
echo "============================================================"

# Ensure directories exist
mkdir -p build/solvency
mkdir -p build/compliance

# ── 1. Phase 1: Powers of Tau ──────────────────────────────────
# This only needs to be done once per curve, but we do it locally for tests
echo -e "\n[1/4] Starting Powers of Tau ceremony (bn128, power=12)..."
if [ ! -f "build/ptau/pot12_final.ptau" ]; then
  mkdir -p build/ptau
  # Start a new ceremony
  npx snarkjs powersoftau new bn128 12 build/ptau/pot12_0000.ptau -v
  # Contribute randomness
  echo "random text for entropy" | npx snarkjs powersoftau contribute build/ptau/pot12_0000.ptau build/ptau/pot12_0001.ptau --name="First contribution" -v
  # Phase 2 preparation
  npx snarkjs powersoftau prepare phase2 build/ptau/pot12_0001.ptau build/ptau/pot12_final.ptau -v
  echo "✅ Powers of Tau complete"
else
  echo "⏭️  Powers of Tau already exists, skipping."
fi

# ── 2. Compile Solvency Circuit ───────────────────────────────
echo -e "\n[2/4] Compiling Solvency circuit..."
circom src/circuits/solvency.circom --r1cs --wasm --sym --output build/solvency

# Generate zkey (Phase 2 setup)
echo "   Generating proving key (zkey) for Solvency..."
npx snarkjs groth16 setup build/solvency/solvency.r1cs build/ptau/pot12_final.ptau build/solvency/solvency_0000.zkey
echo "random text for entropy 2" | npx snarkjs zkey contribute build/solvency/solvency_0000.zkey build/solvency/solvency_final.zkey --name="Second contribution" -v
npx snarkjs zkey export verificationkey build/solvency/solvency_final.zkey build/solvency/verification_key.json
echo "✅ Solvency circuit compiled and setup complete"

# ── 3. Compile Compliance Circuit ─────────────────────────────
echo -e "\n[3/4] Compiling Compliance circuit..."
circom src/circuits/compliance.circom --r1cs --wasm --sym --output build/compliance

# Generate zkey (Phase 2 setup)
echo "   Generating proving key (zkey) for Compliance..."
npx snarkjs groth16 setup build/compliance/compliance.r1cs build/ptau/pot12_final.ptau build/compliance/compliance_0000.zkey
echo "random text for entropy 3" | npx snarkjs zkey contribute build/compliance/compliance_0000.zkey build/compliance/compliance_final.zkey --name="Third contribution" -v
npx snarkjs zkey export verificationkey build/compliance/compliance_final.zkey build/compliance/verification_key.json
echo "✅ Compliance circuit compiled and setup complete"

echo -e "\n🎉 Compilation finished successfully!"
echo "Artifacts are in packages/privacy-sdk/build/"
