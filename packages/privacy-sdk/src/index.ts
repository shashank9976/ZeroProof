/**
 * @zeroproof/privacy-sdk — Public API
 *
 * Re-exports all proof generators, types, and disclosure utilities.
 * This is the only surface area that downstream packages should import from.
 */

// ── Proof Generators ──────────────────────────────────────────
export { generateSolvencyProof, verifySolvencyProof } from './zk-proof-generators/solvency-prover.js';
export {
  generateComplianceProof,
  verifyComplianceProof,
  generateMockKYCProviderKey,
} from './zk-proof-generators/compliance-prover.js';
export { IPFSProofStorage, ipfsStorage } from './zk-proof-generators/ipfs-storage.js';

// ── Types ─────────────────────────────────────────────────────
export type {
  SolvencyPrivateInputs,
  SolvencyAttestation,
  CompliancePrivateInputs,
  ComplianceAttestation,
  ZKProofBundle,
  SnarkjsProof,
  AuditReport,
  AuditSummary,
  IPFSUploadResult,
  IPFSProofRecord,
} from './attestation-types.js';

// ── Disclosure Rules ──────────────────────────────────────────
export {
  DisclosureRules,
  stripPrivateFields,
  assertNoPrivateFields,
  canDisclose,
  deriveComplianceStatus,
} from './disclosure-rules.js';
