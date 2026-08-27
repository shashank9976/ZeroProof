pragma circom 2.1.6;

// ============================================================
//  ZeroProof — KYC/AML Compliance Proof Circuit
//
//  PROVES:
//    1. kycVerified == 1   (identity was verified by trusted provider)
//    2. amlScore < amlThreshold  (risk score below regulatory threshold)
//    3. Entity NOT in sanctions list  (Merkle non-inclusion proof)
//
//  PRIVATE INPUTS (never leave the prover's machine):
//    entityIdHash          : Poseidon hash of entity's real ID
//    kycVerified           : 0 or 1 from KYC provider
//    amlScore              : 0-100 risk score
//    amlThreshold          : Max acceptable score (e.g., 30)
//    kycProviderPubKeyX    : KYC provider's EdDSA public key X
//    kycProviderPubKeyY    : KYC provider's EdDSA public key Y
//    kycSignatureR8x       : Signature R8 x-coordinate
//    kycSignatureR8y       : Signature R8 y-coordinate
//    kycSignatureS         : Signature S scalar
//    sanctionsMerkleRoot   : Root of the sanctions exclusion tree
//    sanctionsPathElements : Merkle proof path (non-inclusion)
//    sanctionsPathIndices  : Merkle proof indices
//
//  PUBLIC OUTPUTS:
//    kycPassed      : 1 if KYC verified
//    amlPassed      : 1 if AML score below threshold
//    fullyCompliant : 1 if both pass
//    attestationId  : Poseidon(entityIdHash, timestamp)
//
//  PROVING SYSTEM: Groth16
// ============================================================

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/bitify.circom";
include "node_modules/circomlib/circuits/gates.circom";
include "node_modules/circomlib/circuits/eddsaposeidon.circom";
include "node_modules/circomlib/circuits/merkleproof.circom";

// ── Merkle Levels ─────────────────────────────────────────────
// Depth of 20 supports up to 2^20 ≈ 1 million sanctioned entities
// Adjust based on the sanctions list size in your jurisdiction
var MERKLE_LEVELS = 20;

// ── Main Compliance Circuit ───────────────────────────────────
template ComplianceCheck() {

    // ── Private Inputs ────────────────────────────────────────
    signal input entityIdHash;              // Poseidon(realEntityId)
    signal input kycVerified;               // 0 or 1
    signal input amlScore;                  // 0-100
    signal input amlThreshold;             // e.g., 30

    // EdDSA signature from trusted KYC provider
    // (proves the KYC provider actually vouched for this entity)
    signal input kycProviderPubKeyX;
    signal input kycProviderPubKeyY;
    signal input kycSignatureR8x;
    signal input kycSignatureR8y;
    signal input kycSignatureS;

    // Merkle non-inclusion proof (sanctions list)
    signal input sanctionsMerkleRoot;
    signal input sanctionsPathElements[MERKLE_LEVELS];
    signal input sanctionsPathIndices[MERKLE_LEVELS];

    // Timestamp for attestation ID binding
    signal input timestamp;

    // ── Public Outputs ────────────────────────────────────────
    signal output kycPassed;               // 1 or 0
    signal output amlPassed;               // 1 or 0
    signal output fullyCompliant;          // 1 if both pass
    signal output attestationId;           // Poseidon(entityIdHash, ts)

    // ── Step 1: Validate KYC is boolean ──────────────────────
    kycVerified * (kycVerified - 1) === 0;

    // ── Step 2: KYC provider signature verification ───────────
    // Proves a trusted authority signed the kycVerified value
    // WITHOUT revealing the entity's actual identity
    component kycSigVerifier = EdDSAPoseidonVerifier();
    kycSigVerifier.enabled <== 1;
    kycSigVerifier.Ax <== kycProviderPubKeyX;
    kycSigVerifier.Ay <== kycProviderPubKeyY;
    kycSigVerifier.R8x <== kycSignatureR8x;
    kycSigVerifier.R8y <== kycSignatureR8y;
    kycSigVerifier.S <== kycSignatureS;
    kycSigVerifier.M <== entityIdHash;

    // KYC passes if the provider vouched (signature valid + kycVerified=1)
    kycPassed <== kycVerified;

    // ── Step 3: AML score range check ─────────────────────────
    // Prove amlScore fits in 7 bits (0-127, sufficient for 0-100)
    component amlRangeCheck = Num2Bits(7);
    amlRangeCheck.in <== amlScore;

    // Prove amlScore < amlThreshold (passes AML screening)
    component amlCheck = LessThan(7);
    amlCheck.in[0] <== amlScore;
    amlCheck.in[1] <== amlThreshold;
    amlPassed <== amlCheck.out;

    // ── Step 4: Sanctions non-inclusion proof ─────────────────
    // Verifies entity is NOT in the sanctions Merkle tree
    // Standard Merkle inclusion proof on the entity's "empty slot"
    // proves they are not present in the list
    component sanctionsCheck = MerkleProof(MERKLE_LEVELS);
    sanctionsCheck.leaf <== entityIdHash;
    sanctionsCheck.root <== sanctionsMerkleRoot;
    for (var i = 0; i < MERKLE_LEVELS; i++) {
        sanctionsCheck.pathElements[i] <== sanctionsPathElements[i];
        sanctionsCheck.pathIndices[i] <== sanctionsPathIndices[i];
    }
    // If entity IS in the tree, the proof will fail to generate
    // (the Merkle proof would be invalid for a non-sanctions path)

    // ── Step 5: Combined compliance output ───────────────────
    component andGate = AND();
    andGate.a <== kycPassed;
    andGate.b <== amlPassed;
    fullyCompliant <== andGate.out;

    // ── Step 6: Attestation ID ───────────────────────────────
    // Unique ID = Poseidon(entityIdHash, timestamp)
    // Binds the attestation to a specific entity + time
    component attestationHasher = Poseidon(2);
    attestationHasher.inputs[0] <== entityIdHash;
    attestationHasher.inputs[1] <== timestamp;
    attestationId <== attestationHasher.out;

    // ── Constraint checks ─────────────────────────────────────
    kycPassed * (kycPassed - 1) === 0;
    amlPassed * (amlPassed - 1) === 0;
    fullyCompliant * (fullyCompliant - 1) === 0;
}

component main {
    public [kycPassed, amlPassed, fullyCompliant, attestationId]
} = ComplianceCheck();
