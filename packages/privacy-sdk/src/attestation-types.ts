/**
 * ZeroProof — Core Type Definitions
 *
 * All types that flow through the SDK.
 * CRITICAL: Types marked @private must NEVER be serialized
 * to JSON or transmitted over any network interface.
 */

// ── Proof Bundle Types ────────────────────────────────────────

/** Raw snarkjs Groth16 proof structure */
export interface SnarkjsProof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
  protocol: 'groth16';
  curve: 'bn128';
}

/** Full ZK proof bundle stored on IPFS */
export interface ZKProofBundle {
  /** snarkjs proof object (mathematically sound, reveals nothing) */
  proof: SnarkjsProof;
  /** Public signals array (what the verifier can see) */
  publicSignals: string[];
  /** Type of proof */
  proofType: 'solvency' | 'compliance';
  /** Hex-encoded report/attestation ID */
  reportId: string;
  /** Unix timestamp (ms) */
  timestamp: number;
  /** Generation time in milliseconds */
  generationTimeMs: number;
  /** ZK circuit version for reproducibility */
  circuitVersion: string;
  /** Proof metadata (no private data) */
  metadata: ProofMetadata;
}

export interface ProofMetadata {
  entityAddress?: string;
  proofType: string;
  network: string;
  sdkVersion: string;
}

// ── Solvency Types ────────────────────────────────────────────

/**
 * Private inputs for solvency proof generation
 * @private NEVER serialize, log, or transmit these values
 */
export interface SolvencyPrivateInputs {
  /** Total assets in smallest denomination (e.g., cents) */
  totalAssets: bigint;
  /** Total liabilities in smallest denomination */
  totalLiabilities: bigint;
  /** Random 253-bit nonce for commitment binding */
  salt: bigint;
  /** Minimum solvency threshold (assets must exceed liabilities by this %) */
  solvencyThresholdBps?: number;
}

/** Public result of a solvency proof (safe to share with auditors) */
export interface SolvencyAttestation {
  /** ✅ The one fact auditors need: is the entity solvent? */
  isSolvent: boolean;
  /** Unique report ID (hex) */
  reportId: string;
  /** Poseidon commitment hash — auditor can verify consistency later */
  commitmentHash: string;
  /** When the proof was generated */
  timestamp: number;
  /** IPFS CID of the full proof bundle */
  ipfsCid: string;
  /** Proof generation time (transparency metric) */
  generationTimeMs: number;
}

// ── Compliance / KYC / AML Types ──────────────────────────────

/**
 * Private inputs for compliance proof
 * @private NEVER serialize, log, or transmit these values
 */
export interface CompliancePrivateInputs {
  /** Poseidon hash of the entity's real identifier */
  entityIdHash: bigint;
  /** 0 or 1: did the KYC provider verify this entity? */
  kycVerified: 0 | 1;
  /** AML risk score 0-100 */
  amlScore: number;
  /** Maximum acceptable AML score (regulatory threshold) */
  amlThreshold: number;
  /** KYC provider's EdDSA public key */
  kycProviderPubKey: { x: bigint; y: bigint };
  /** KYC provider's signature over entityIdHash */
  kycSignature: { R8: [bigint, bigint]; S: bigint };
  /** Root of the sanctions Merkle tree */
  sanctionsMerkleRoot: bigint;
  /** Merkle proof path elements for non-inclusion */
  sanctionsPathElements: bigint[];
  /** Merkle proof path indices */
  sanctionsPathIndices: number[];
}

/** Public result of a compliance proof (safe to share with regulators) */
export interface ComplianceAttestation {
  /** Did the entity pass KYC? */
  kycPassed: boolean;
  /** Did the entity pass AML screening? */
  amlPassed: boolean;
  /** Are both KYC and AML cleared? */
  fullyCompliant: boolean;
  /** Unique attestation ID */
  attestationId: string;
  /** When the attestation was generated */
  timestamp: number;
  /** When this attestation expires */
  validUntil: number;
  /** IPFS CID of the full proof bundle */
  ipfsCid: string;
  /** Proof generation time */
  generationTimeMs: number;
}

// ── Audit Report Types ────────────────────────────────────────

/** Complete audit report — everything an auditor receives */
export interface AuditReport {
  reportId: string;
  generatedAt: number;
  entityAddress: string;
  /** Solvency attestation (no amounts) */
  solvency?: SolvencyAttestation;
  /** Compliance attestation (no identities) */
  compliance?: ComplianceAttestation;
  /** IPFS CID where proof bundle is permanently stored */
  ipfsCid: string;
  /** Human-readable summary for the auditor */
  summary: AuditSummary;
}

export interface AuditSummary {
  overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL';
  checks: {
    name: string;
    status: 'PASSED' | 'FAILED' | 'NOT_RUN';
    verifiedAt?: number;
    expiresAt?: number;
  }[];
  privateDataDisclosed: string[]; // Always empty — for audit trail
  proofSystem: 'Groth16';
  network: string;
}

// ── IPFS Types ────────────────────────────────────────────────

export interface IPFSUploadResult {
  cid: string;
  url: string;
  size: number;
  uploadedAt: number;
}

export interface IPFSProofRecord {
  cid: string;
  proofType: 'solvency' | 'compliance';
  timestamp: number;
  publicSignals: string[];
  isVerified: boolean;
}
