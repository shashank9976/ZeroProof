/**
 * @zeroproof/contracts — Public API
 *
 * Exports all contract interfaces, proof result types, and
 * TypeScript helpers for interacting with deployed Compact contracts
 * on the Midnight Network via Midnight.js SDK.
 */

// ── Proof Result Types ────────────────────────────────────────

export interface SolvencyProofResult {
  /** True if assets > liabilities (the only fact revealed on-chain) */
  isSolvent: boolean;
  /** Unique identifier for this solvency report */
  reportId: string;
  /** Poseidon(assets, liabilities, salt) — for auditor verification */
  commitmentHash: string;
  /** Unix timestamp of proof generation */
  timestamp: number;
}

export interface SolvencyStatus {
  isSolvent: boolean;
  reportId: string;
  timestamp: number;
  ipfsCid: string;
}

export interface ComplianceProofResult {
  /** Did the entity pass KYC identity verification? */
  kycPassed: boolean;
  /** Did the entity pass AML risk score check? */
  amlPassed: boolean;
  /** Both KYC and AML passed */
  fullyCompliant: boolean;
  /** Unique identifier for this compliance attestation */
  attestationId: string;
  /** Unix timestamp of attestation */
  timestamp: number;
  /** Unix timestamp when this attestation expires */
  validUntil: number;
}

export interface ComplianceStatus {
  kycPassed: boolean;
  amlPassed: boolean;
  fullyCompliant: boolean;
  attestationId: string;
  timestamp: number;
  validUntil: number;
  ipfsCid: string;
}

// ── Ledger State Types ────────────────────────────────────────

export interface SolvencyLedgerState {
  reportId: Uint8Array;
  isSolvent: boolean;
  commitmentHash: Uint8Array;
  timestamp: bigint;
  entityAddress: Uint8Array;
  ipfsCid: Uint8Array;
}

export interface ComplianceLedgerState {
  attestationId: Uint8Array;
  kycPassed: boolean;
  amlPassed: boolean;
  fullyCompliant: boolean;
  sanctionsListRoot: Uint8Array;
  timestamp: bigint;
  ipfsCid: Uint8Array;
  validUntil: bigint;
}

// ── Contract Addresses ────────────────────────────────────────

export interface ContractAddresses {
  solvency: string;
  compliance: string;
  network: 'testnet' | 'mainnet';
  deployedAt: number;
}

// ── Midnight.js Contract Interaction Helpers ──────────────────
// These wrap the raw Midnight.js SDK calls with typed interfaces

/**
 * Configuration for connecting to deployed contracts
 */
export interface MidnightContractConfig {
  rpcUrl: string;
  proofServerUrl: string;
  walletSeed: string;
  addresses: ContractAddresses;
}

/**
 * Proof submission parameters for the solvency circuit
 */
export interface SolvencyProofParams {
  reportId: string;
  entityAddress: string;
  ipfsCid: string;
  timestamp: number;
  // Private witnesses (never serialized to JSON, only passed to proof server)
  witnesses: {
    totalAssets: bigint;
    totalLiabilities: bigint;
    salt: Uint8Array;
    solvencyThreshold: bigint;
  };
}

/**
 * Proof submission parameters for the compliance circuit
 */
export interface ComplianceProofParams {
  attestationId: string;
  ipfsCid: string;
  timestamp: number;
  // Private witnesses (never serialized to JSON)
  witnesses: {
    entityIdHash: Uint8Array;
    kycVerificationHash: Uint8Array;
    kycVerified: 0 | 1;
    amlRiskScore: number;
    amlScoreThreshold: number;
    sanctionsMerkleRoot: Uint8Array;
    validityPeriodDays: number;
  };
}

// ── Contract ABI Export ───────────────────────────────────────

export const CONTRACT_ABIS = {
  SOLVENCY_CIRCUITS: ['proveSolvency', 'querySolvency'] as const,
  COMPLIANCE_CIRCUITS: ['proveCompliance', 'queryCompliance'] as const,
} as const;

export const PROOF_TYPES = {
  SOLVENCY: 'solvency',
  COMPLIANCE: 'compliance',
  KYC: 'kyc',
  AML: 'aml',
} as const;

export type ProofType = (typeof PROOF_TYPES)[keyof typeof PROOF_TYPES];
