// ──────────────────────────────────────────────────────────────
// WorkVault — Workplace Credential ZK Attestation Types
// Privacy-first: raw values NEVER appear in these types.
// All results are expressed as boolean attestations or verified flags.
// ──────────────────────────────────────────────────────────────

export type CredentialCategory =
  | 'identity'          // Passport, Driver License
  | 'background-check'  // Criminal, Credit History
  | 'work-auth'         // US Work Visa, Permanent Residence
  | 'education'         // University Degrees, Certifications
  | 'experience'        // Former Employer Attestations
  | 'financial';        // Salary / Income Verification

export type CredentialStatus = 'pending' | 'encrypted' | 'verified' | 'expired';

export type ConsentScope =
  | 'credential_valid'     // Boolean: credential verified and active
  | 'credential_category'  // The category of credential (not full details)
  | 'verification_date'    // When the verification was completed
  | 'field_disclosure';    // Custom field matches (e.g. "No criminal record")

export type DisclosureMode = 'proof-only' | 'full-disclosure';

// ── Credential Record ─────────────────────────────────────────

export interface CredentialRecord {
  id: string;
  category: CredentialCategory;
  name: string;                  // e.g. "Criminal Background Check"
  encryptedAt: number;           // timestamp when file was encrypted
  verifiedDate: number;          // date of verification
  status: CredentialStatus;
  ipfsCid?: string;              // encrypted blob CID
  consentCount: number;          // how many companies can verify
  isValid?: boolean;             // computed client-side, stored locally only
  verifierName: string;          // authority that verified the record (e.g., "Checkr Inc.")
}

// ── Access Consent ─────────────────────────────────────────────

export interface AccessConsent {
  id: string;
  recordId: string;
  companyId: string;
  companyName: string;
  grantedAt: number;
  expiresAt: number;             // auto-revoke after this date
  scope: ConsentScope[];         // what this company can request proofs for
  disclosureMode: DisclosureMode;
  isActive: boolean;
  lastAccessedAt?: number;
  accessCount: number;
}

// ── Proof Requests ─────────────────────────────────────────────

export interface CredentialProofRequest {
  recordId: string;
  consentScope: ConsentScope[];
  companyId: string;
}

// ── Proof Verification Result ──────────────────────────────────

export interface CredentialProofVerification {
  proofId: string;
  category: CredentialCategory;
  name: string;
  resultValid: boolean;
  consentVerified: boolean;
  companyAuthorized: boolean;
  verifiedAt: number;
  ipfsCid: string;
}

// ── Audit Event ───────────────────────────────────────────────

export interface WorkplaceAuditEvent {
  id: string;
  eventType: 'proof_generated' | 'proof_verified' | 'consent_granted' | 'consent_revoked';
  timestamp: number;
  actorId: string;               // anonymized company ID
  scope: ConsentScope[];
}
