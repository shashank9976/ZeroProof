pragma circom 2.1.6;

// ============================================================
//  ZeroProof — Solvency Proof Circuit
//  
//  PROVES: totalAssets > totalLiabilities (without revealing amounts)
//
//  PRIVATE INPUTS (witnesses — never leave the prover's machine):
//    totalAssets      : 64-bit unsigned integer
//    totalLiabilities : 64-bit unsigned integer  
//    salt             : 253-bit random nonce (for commitment binding)
//
//  PUBLIC OUTPUTS (on-chain / disclosed to verifier):
//    isSolvent        : 1 if assets > liabilities, else 0
//    commitmentHash   : Poseidon(totalAssets, totalLiabilities, salt)
//
//  SECURITY: Uses Poseidon hash (ZK-friendly, gas-efficient)
//  PROVING SYSTEM: Groth16 (constant size proof, fast verification)
// ============================================================

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/bitify.circom";
include "node_modules/circomlib/circuits/gates.circom";

// ── Range Check Template ──────────────────────────────────────
// Verifies a value fits within n bits (prevents overflow exploits)
template RangeCheck(bits) {
    signal input in;
    component n2b = Num2Bits(bits);
    n2b.in <== in;
}

// ── Main Solvency Circuit ─────────────────────────────────────
template SolvencyCheck() {
    // ── Private Inputs (witnesses) ────────────────────────────
    signal input totalAssets;        // e.g., $1,000,000 (in cents)
    signal input totalLiabilities;   // e.g., $800,000 (in cents)
    signal input salt;               // Random 253-bit nonce

    // ── Public Outputs ────────────────────────────────────────
    signal output isSolvent;         // 1 or 0
    signal output commitmentHash;    // Poseidon(assets, liabilities, salt)

    // ── Step 1: Range Checks ──────────────────────────────────
    // Ensure values fit in 64 bits (prevents negative number tricks)
    component assetCheck = RangeCheck(64);
    assetCheck.in <== totalAssets;

    component liabilityCheck = RangeCheck(64);
    liabilityCheck.in <== totalLiabilities;

    // ── Step 2: Solvency Comparison ───────────────────────────
    // GreaterThan(n): proves in[0] > in[1] for n-bit values
    // This is the core ZK proof statement: assets > liabilities
    component gt = GreaterThan(64);
    gt.in[0] <== totalAssets;
    gt.in[1] <== totalLiabilities;

    // Output 1 if solvent, 0 if not
    isSolvent <== gt.out;

    // ── Step 3: Commitment Hash ───────────────────────────────
    // Poseidon is a ZK-friendly hash function (much cheaper than SHA256)
    // The commitment binds the proof to the specific values used
    // An auditor can verify consistency if given the preimage later
    component poseidon = Poseidon(3);
    poseidon.inputs[0] <== totalAssets;
    poseidon.inputs[1] <== totalLiabilities;
    poseidon.inputs[2] <== salt;

    commitmentHash <== poseidon.out;

    // ── Step 4: Constraint: isSolvent must be boolean ─────────
    // Ensures no malformed output (0 or 1 only)
    isSolvent * (isSolvent - 1) === 0;
}

component main { public [isSolvent, commitmentHash] } = SolvencyCheck();
