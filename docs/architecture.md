# ZeroProof Architecture

## System Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FINANCE FIRM (Trust Boundary)                    │
│                                                                       │
│  Raw Data Layer:                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────┐   │
│  │ Account Ledger │  │  KYC Records   │  │  Transaction History │   │
│  │  $842M assets  │  │ 4,293 entities │  │  Daily settlements   │   │
│  └───────┬────────┘  └───────┬────────┘  └──────────┬───────────┘   │
│          │ Private inputs     │ Private inputs        │ Private inputs │
│          └───────────────┬───┘                       │               │
│                          ▼                           │               │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    ZK Circuit Layer                             │  │
│  │                                                                │  │
│  │  solvency.circom              compliance.circom                │  │
│  │  ┌──────────────────┐         ┌──────────────────────────┐    │  │
│  │  │ SolvencyCheck    │         │ ComplianceCheck           │    │  │
│  │  │ assets > liab?   │         │ KYC provider sig verify   │    │  │
│  │  │ Poseidon commit  │         │ AML score < threshold?    │    │  │
│  │  │ RangeCheck(64)   │         │ Sanctions non-inclusion   │    │  │
│  │  └────────┬─────────┘         └────────────┬─────────────┘    │  │
│  │           │ publicSignals                   │ publicSignals    │  │
│  │           │ [isSolvent, hash]               │ [kyc,aml,id]    │  │
│  └───────────┼─────────────────────────────────┼─────────────────┘  │
│              │                                 │                     │
│  ┌───────────┼─────────────────────────────────┼─────────────────┐  │
│  │           │    snarkjs Groth16 Prover        │                 │  │
│  │           ▼                                 ▼                  │  │
│  │   proof.json (128 bytes)          proof.json (128 bytes)      │  │
│  └───────────┬─────────────────────────────────┬─────────────────┘  │
└──────────────┼─────────────────────────────────┼─────────────────────┘
               │                                 │
               ▼                                 ▼
     ┌──────────────────────────────────────────────────┐
     │                IPFS / Pinata                      │
     │  Proof Bundle CID: QmYwAPJzv5CZsn...             │
     │  ┌──────────────────────────────────────────┐    │
     │  │ proof.json     (Groth16 proof data)       │    │
     │  │ publicSignals  (isSolvent=1, hash=0x...)  │    │
     │  │ metadata       (proofType, timestamp)     │    │
     │  └──────────────────────────────────────────┘    │
     │  Content-addressed → CID proves tamper-evidence  │
     └────────────────────────┬─────────────────────────┘
                              │ CID reference
                              ▼
     ┌──────────────────────────────────────────────────┐
     │           Midnight Network (On-chain)             │
     │                                                   │
     │  SolvencyLedger:           ComplianceLedger:      │
     │    isSolvent: true           kycPassed: true      │
     │    reportId: 0xabc...        amlPassed: true      │
     │    commitmentHash: 0x...     attestationId: 0x... │
     │    ipfsCid: QmYwAP...        ipfsCid: QmT4Ae...   │
     │                                                   │
     │  Compact contracts verify Groth16 proofs on-chain │
     └────────────────────────┬─────────────────────────┘
                              │ Read-only
                              ▼
     ┌──────────────────────────────────────────────────┐
     │                   Auditor/Regulator               │
     │                                                   │
     │  Dashboard shows:              Does NOT show:     │
     │  ✅ SOLVENCY VERIFIED          $842M assets       │
     │  ✅ KYC CLEARED                Customer names     │
     │  ✅ AML CLEARED                AML scores         │
     │  🔗 IPFS CID (receipt)         Tx history         │
     └──────────────────────────────────────────────────┘
```

## Package Architecture

```
midnight1/
├── packages/
│   ├── contracts/          # Compact smart contracts
│   │   └── src/proofs/
│   │       ├── solvency.compact     # On-chain solvency ledger
│   │       └── compliance.compact   # On-chain compliance ledger
│   │
│   ├── privacy-sdk/        # ZK proof generation + IPFS storage
│   │   └── src/
│   │       ├── circuits/
│   │       │   ├── solvency.circom      # Groth16 solvency circuit
│   │       │   └── compliance.circom    # Groth16 KYC/AML circuit
│   │       ├── zk-proof-generators/
│   │       │   ├── solvency-prover.ts   # snarkjs proof generation
│   │       │   ├── compliance-prover.ts
│   │       │   └── ipfs-storage.ts      # Helia + Pinata storage
│   │       ├── attestation-types.ts     # Type definitions
│   │       └── disclosure-rules.ts      # Privacy enforcement
│   │
│   ├── backend/            # Express API
│   │   └── src/
│   │       ├── routes/proof.ts          # POST /api/proof/*
│   │       ├── routes/audit.ts          # GET /api/audit/*
│   │       └── middleware/privacy-guard # Strip private fields
│   │
│   └── frontend/           # Next.js 14 App Router
│       └── src/
│           ├── app/                     # Pages
│           ├── components/
│           │   ├── Dashboard/           # Score + Timeline + Stats
│           │   ├── ProofViewer/         # ProofCard + ProofList
│           │   └── DisclosureControl/   # PrivacyToggle + AuditorView
│           ├── context/PrivacyContext   # State management
│           └── hooks/                   # useProofGeneration, useIPFSProof
```

## Data Flow: Solvency Proof

```
1. Firm inputs: totalAssets=1000000, totalLiabilities=800000
                           │
2. SDK generates salt:     │ + random salt (253-bit)
                           ▼
3. Circuit inputs (PRIVATE, in-memory only):
   { totalAssets: "1000000", totalLiabilities: "800000", salt: "..." }
                           │
4. snarkjs fullProve():    │
                           ▼
5. Proof output (PUBLIC, safe to store):
   { pi_a: [...], pi_b: [...], pi_c: [...] }  // 128-byte Groth16 proof
   publicSignals: ["1", "0x7f3a..."]           // isSolvent=1, commitmentHash
                           │
6. Upload to IPFS:         │
                           ▼
7. CID: QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
                           │
8. Submit to Midnight:     │
                           ▼
9. SolvencyLedger.isSolvent = true (on-chain, forever)
```

## Technology Decisions

| Decision | Choice | Rationale |
|---|---|---|
| ZK proving system | Groth16 | Constant-size proofs, fastest verification |
| Hash function | Poseidon | ZK-friendly, 100x cheaper than SHA256 in circuits |
| Blockchain | Midnight Network | Privacy-by-design dual-state ledger |
| Smart contracts | Compact | TypeScript-like DSL, compiles to ZK circuits |
| IPFS client | Helia + Pinata | In-process + persistent fallback |
| Frontend framework | Next.js 14 App Router | SSR + modern React |
| State management | React Context | Simple, no extra deps for this scale |
