# ZeroProof

> **Privacy-first regulatory compliance SaaS** — Prove KYC/AML and solvency to auditors without revealing account balances, transaction details, or counterparty identities.

---

## The Privacy Problem in Finance Compliance

Financial institutions face a paradox: regulators demand full transparency into compliance, but exposing raw transaction data creates serious competitive and legal risks.

**ZeroProof solves this** using Zero-Knowledge Proofs — mathematical guarantees that let you prove *"we are solvent"* or *"all customers passed KYC"* **without revealing the underlying numbers or identities**.

```
Auditor sees:  ✅ SOLVENCY VERIFIED  |  IPFS CID: Qm3xR7...
Auditor never sees:  $842,000,000 assets  |  $671,000,000 liabilities
```

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                FINANCE FIRM (Private Zone)                   │
│  Raw Balances ──► [Circom ZK Circuit] ──► Proof Only        │
│  KYC Records  ──► [Circom ZK Circuit] ──► Attestation       │
└───────────────────────┬────────────────────────────────────┘
                        │ ZK Proof (128 bytes)
              ┌─────────▼──────────┐
              │   IPFS / Pinata    │
              │  Immutable Proofs  │◄── CID = Tamper-proof receipt
              └─────────┬──────────┘
                        │ Verify CID
              ┌─────────▼──────────┐
              │  Midnight Network  │
              │  Compact Contract  │◄── On-chain verification only
              └────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Compact (Midnight Network DSL) |
| ZK Circuits | Circom 2.0 + snarkjs Groth16 |
| Privacy SDK | TypeScript + snarkjs |
| Backend API | Node.js + Express |
| Frontend | Next.js 14 App Router + React 18 |
| Storage | IPFS via Helia + Pinata pinning |

---

## What Auditors See vs What Stays Private

| Field | Auditor Sees | Stays Private |
|---|---|---|
| Solvency status | ✅ `SOLVENCY_VERIFIED` | ❌ Exact asset/liability amounts |
| KYC status | ✅ `KYC_PASSED` | ❌ Customer identities |
| AML status | ✅ `AML_CLEARED` | ❌ Transaction details |
| Proof receipt | ✅ IPFS CID | ❌ Source data |
| Timestamp | ✅ When proven | ❌ Reporting period details |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Fill in your Pinata API key + Midnight testnet credentials

# 3. Start development
npm run dev

# 4. Generate a proof via CLI
npm run generate-proof -- --type solvency --assets 1000000 --liabilities 800000

# 5. Open the dashboard
open http://localhost:3000
```

---

## Package Structure

```
midnight1/
├── packages/
│   ├── contracts/      # Compact smart contracts (.compact)
│   ├── privacy-sdk/    # ZK proof generators + IPFS storage
│   ├── backend/        # Express API server
│   └── frontend/       # Next.js 14 dashboard
├── scripts/            # CLI tools
├── tests/              # Unit + integration tests
└── docs/               # Architecture + API docs
```

---

## Privacy Guarantee

ZeroProof uses **Groth16** zero-knowledge SNARKs — the same proof system used by Zcash, Tornado Cash, and major identity protocols. The mathematical guarantee is:

> A verifier learns **nothing** about the private inputs beyond what is explicitly encoded in the public signals.

No amount of computational power can extract raw balances or identities from a ZK proof. The privacy is cryptographic, not policy-based.

---

## License

MIT © 2025 ZeroProof Contributors
