# Wave 1 — Initial Platform Build

## Improvements Over Wave 0 (Initial Concept)

Wave 0 was the specification document. Wave 1 is the full initial implementation.

### What Wave 1 Delivers

**Layer 1: Smart Contracts**
- ✅ Complete `solvency.compact` — dual-state ledger with Poseidon commitment
- ✅ Complete `compliance.compact` — KYC/AML with Merkle non-inclusion + EdDSA
- ✅ TypeScript type exports for all contract interfaces

**Layer 2: Privacy SDK**
- ✅ `solvency.circom` — Groth16 solvency circuit with range checks
- ✅ `compliance.circom` — Groth16 KYC/AML circuit with EdDSA + Merkle proofs
- ✅ `solvency-prover.ts` — snarkjs proof generation with mock mode
- ✅ `compliance-prover.ts` — with mock KYC provider key generation
- ✅ `ipfs-storage.ts` — Helia + Pinata fallback
- ✅ `disclosure-rules.ts` — runtime private field stripping at SDK boundary
- ✅ Comprehensive TypeScript types

**Layer 3: Backend API**
- ✅ Express server with privacy guard middleware on ALL responses
- ✅ `POST /api/proof/solvency` and `POST /api/proof/compliance`
- ✅ `GET /api/proof/:cid` and `GET /api/proof/verify/:cid`
- ✅ Audit trail endpoints
- ✅ Zod request validation

**Layer 4: Frontend**
- ✅ Dark glassmorphism design system (globals.css — 450+ lines)
- ✅ Sidebar navigation with network status
- ✅ Landing page with animated hero and privacy demo
- ✅ Dashboard with compliance score ring chart + proof timeline
- ✅ ProofCard implementing the spec exactly (AUDIT PASSED badge, 🔒 indicator, ⚙️ timing)
- ✅ ProofList with search + type + status filters
- ✅ PrivacyToggle with full DisclosureRules.FINANCE visualization
- ✅ AuditorView — CID input → proof verification → shows only public data
- ✅ Privacy context with mock proof seeding

**Layer 5: Scripts & CI**
- ✅ CLI `generate-proof.ts` with `--type solvency|compliance` flags
- ✅ `testnet-deploy.sh` with dry-run support
- ✅ CI workflow: lint → typecheck → test → build → privacy audit
- ✅ Deploy workflow: Midnight testnet → Vercel

**Layer 6: Tests**
- ✅ `solvency-prover.test.ts` — 5 unit tests
- ✅ `disclosure-rules.test.ts` — 12 unit tests enforcing privacy boundary
- ✅ `e2e-proof.test.ts` — full lifecycle integration tests

**Layer 7: Documentation**
- ✅ Architecture diagram with ASCII art
- ✅ Formal privacy model with threat model
- ✅ API documentation
- ✅ Finance compliance use case
- ✅ Auditor proof process walkthrough

### Key Design Decisions Made in Wave 1

1. **Mock ZK mode** — `ZK_MOCK_PROOFS=true` enables full UI demo without compiled Circom artifacts
2. **Three-layer privacy enforcement** — circuit → SDK boundary → API middleware
3. **Disclosure rules are runtime-enforced** — not just documentation
4. **Helia first, Pinata fallback** — avoids centralized IPFS dependency
5. **Turborepo** — parallel builds, proper dependency tracking

### Known Limitations (Wave 2 TODO)

- [ ] Circom circuits not yet compiled (require trusted setup ceremony)
- [ ] Midnight testnet deployment requires real credentials
- [ ] IPFS persistence requires Pinata API key for production
- [ ] Frontend doesn't have authentication/multi-tenant support
- [ ] AML score threshold currently hardcoded to 30

### Files Created

- 53 files across 7 packages
- ~5,400 lines of TypeScript/JSX/CSS
- ~200 lines of Circom circuit code
- ~150 lines of Compact smart contract code
