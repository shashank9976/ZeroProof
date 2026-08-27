# ZeroProof Privacy Model

## Overview

ZeroProof uses **Zero-Knowledge Proofs** (specifically Groth16 zk-SNARKs) to provide cryptographic privacy guarantees — not policy-based ones.

The privacy guarantee is: **A verifier learns nothing about the private inputs beyond what is explicitly encoded in the public signals.**

This is not a claim about access controls or policy. It is a mathematical theorem.

---

## What is Proven vs. What is Hidden

### Solvency Proof

| Fact | Status | Technical Method |
|---|---|---|
| `assets > liabilities` | ✅ Proven | `GreaterThan(64)` circuit constraint |
| Exact asset amount | 🔒 Hidden | Private witness — never enters public state |
| Exact liability amount | 🔒 Hidden | Private witness — never enters public state |
| Net position | 🔒 Hidden | Only the boolean comparison result is disclosed |
| Commitment binding | ✅ Public | `Poseidon(assets, liabilities, salt)` — proves consistency |

### Compliance Proof (KYC/AML)

| Fact | Status | Technical Method |
|---|---|---|
| `kycVerified = 1` | ✅ Proven | EdDSA signature verification in circuit |
| Customer identity | 🔒 Hidden | `entityIdHash = Poseidon(realId)` — preimage hidden |
| `amlScore < threshold` | ✅ Proven | `LessThan(7)` circuit constraint |
| Actual AML score | 🔒 Hidden | Private witness — only comparison result disclosed |
| Entity not on sanctions list | ✅ Proven | Merkle non-inclusion proof |
| Which entity was checked | 🔒 Hidden | Merkle leaf is `entityIdHash`, not real ID |

---

## The Three Privacy Layers

### Layer 1: Circuit-Level Privacy (Cryptographic)

Private witnesses in Circom circuits are processed by the WASM prover locally. They are mathematically erased during the ZK proof generation process.

```circom
// totalAssets is a private witness — the verifier NEVER sees it
signal input totalAssets;

// isSolvent is the ONLY public output — this is what auditors see
signal output isSolvent;
```

The Groth16 proof system guarantees: given only the proof `(π_A, π_B, π_C)` and the public signals, it is computationally infeasible to recover any information about the private witnesses.

**Security assumption:** Discrete logarithm hardness on the BN128 elliptic curve.

### Layer 2: SDK Boundary Enforcement

The `stripPrivateFields()` function in `disclosure-rules.ts` scans every object leaving the SDK and removes any field matching the `must_hide` list or known private field patterns.

```typescript
// This CANNOT appear in any SDK output:
const output = stripPrivateFields({
  isSolvent: true,
  totalAssets: BigInt(1_000_000),  // stripped
  reportId: 'abc',
});
// Result: { isSolvent: true, reportId: 'abc' }
```

### Layer 3: API Response Middleware

The backend Express middleware wraps `res.json()` to apply `stripPrivateFields()` on every HTTP response — even if a route handler accidentally includes private data.

```typescript
// packages/backend/src/middleware/privacy-guard.ts
res.json = function(data) {
  const cleaned = deepStrip(data);   // strips all private fields
  return originalJson(cleaned);
};
```

---

## Threat Model

### What ZeroProof Protects Against

| Threat | Protection |
|---|---|
| Auditor extracting raw balances from proof | Circuit privacy (Groth16) |
| Regulator recovering customer identity from attestation | Poseidon hash preimage hiding |
| Man-in-the-middle extracting private inputs | Private witnesses never transmitted |
| API response leaking private data | Express privacy guard middleware |
| IPFS bundle containing raw figures | SDK strips private fields before upload |
| On-chain analysis revealing amounts | Only boolean + hash published on Midnight |

### What ZeroProof Does NOT Protect Against

| Threat | Notes |
|---|---|
| Compromised proof server (private key theft) | Standard key management applies |
| Insider with direct database access | Separate data security concern |
| Regulatory subpoena for raw records | Legal process applies to the firm |
| Malicious KYC provider (forged signatures) | Depends on provider trust model |
| Quantum computing attacks on BN128 | Long-term concern for all ZK systems |

---

## Poseidon Hash Commitment

The solvency proof includes a **commitment hash**: `Poseidon(totalAssets, totalLiabilities, salt)`.

This serves two purposes:
1. **Binding:** Links the proof to specific values — the prover cannot generate the same commitment with different values.
2. **Optional disclosure:** If an auditor later requests to verify the exact figures (under a legal subpoena), the firm can reveal `(totalAssets, totalLiabilities, salt)` and the auditor can recompute the commitment to verify consistency.

This is an **opt-in** disclosure — the hash alone reveals nothing.

---

## EdDSA Signature in Compliance Proof

The compliance proof includes a KYC provider signature verification circuit. This proves that:
- A trusted KYC provider (identified by their public key) has vouched for the entity
- The vouching was done for `entityIdHash` specifically (not a different entity)

The actual identity (real ID number, name, passport) is the preimage of `entityIdHash` — it never enters the circuit's public state.

---

## Proof System Selection

ZeroProof uses **Groth16** for the following reasons:

| Property | Groth16 | Alternative (PLONK) |
|---|---|---|
| Proof size | 128 bytes (constant) | ~1KB |
| Verification time | ~1ms | ~3ms |
| Trusted setup | Required | Universal SRS |
| Privacy guarantee | Information-theoretic | Computational |

For a compliance application where proof size and verification speed matter, Groth16's constant-size proofs are ideal.
