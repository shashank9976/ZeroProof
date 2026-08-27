/**
 * ZeroProof — Disclosure Rules
 *
 * Defines what finance companies MAY disclose, MUST prove,
 * and MUST NEVER expose. These rules are enforced at:
 *   1. The SDK boundary (stripPrivateFields)
 *   2. The backend middleware (privacy-guard.ts)
 *   3. The UI layer (AuditorView component)
 */

// ── Core Disclosure Rules ─────────────────────────────────────

export const DisclosureRules = {
  FINANCE: {
    /**
     * What auditors and regulators ARE allowed to see.
     * These are derived proof outputs — no raw data.
     */
    can_disclose: [
      'compliance_status',    // COMPLIANT / NON_COMPLIANT / PARTIAL
      'attestation_valid',    // true/false
      'kyc_passed',           // boolean
      'aml_passed',           // boolean
      'is_solvent',           // boolean
      'report_id',            // hex string
      'attestation_id',       // hex string
      'ipfs_cid',             // IPFS content address
      'timestamp',            // when the proof was generated
      'valid_until',          // attestation expiry
      'generation_time_ms',   // transparency metric
      'proof_system',         // 'Groth16'
      'commitment_hash',      // cryptographic commitment (not raw data)
    ],

    /**
     * What MUST be proven via ZK circuits before any disclosure.
     * These are not disclosed — they are proven mathematically.
     */
    must_prove: [
      'solvency_verified',    // assets > liabilities (Groth16 proof)
      'kyc_completed',        // identity verified by trusted provider
      'aml_cleared',          // risk score below regulatory threshold
      'sanctions_clear',      // entity not on any sanctions list
    ],

    /**
     * Fields that MUST NEVER be disclosed to auditors or on-chain.
     * These stay inside the ZK circuit as private witnesses.
     */
    must_hide: [
      'account_balances',         // Raw monetary amounts
      'total_assets',             // Exact asset values
      'total_liabilities',        // Exact liability values
      'net_position',             // Assets minus liabilities
      'transaction_details',      // Individual transaction data
      'transaction_hashes',       // Even hashed transaction IDs
      'counterparty_identities',  // Who the entity transacted with
      'counterparty_addresses',   // Blockchain addresses of counterparties
      'customer_names',           // KYC subject names
      'customer_ids',             // National ID numbers
      'customer_dob',             // Dates of birth
      'aml_score',                // Raw risk score (0-100)
      'kyc_verification_hash',    // Raw KYC provider signature
      'entity_id_hash',           // Poseidon hash of real entity ID
      'sanctions_path',           // Merkle proof path (could reveal structure)
      'salt',                     // Commitment nonce
    ],
  },
} as const;

// ── Field Name Mappings ───────────────────────────────────────
// Maps camelCase object keys to disclosure rule field names

const PRIVATE_FIELD_PATTERNS = [
  // Exact matches
  /^totalAssets$/,
  /^totalLiabilities$/,
  /^netPosition$/,
  /^amlScore$/,
  /^amlRiskScore$/,
  /^kycVerified$/,
  /^kycVerificationHash$/,
  /^entityIdHash$/,
  /^entityId$/,
  /^customerId$/,
  /^customerName$/,
  /^counterpartyAddress$/,
  /^counterpartyIdentity$/,
  /^transactionDetails$/,
  /^transactionHash$/,
  /^salt$/,
  /^nonce$/,
  /^witnesses$/,
  // Pattern matches
  /balance/i,
  /^raw/i,
  /private/i,
  /secret/i,
  /password/i,
  /^dob$/,
  /birthDate/i,
  /ssn/i,
  /passport/i,
];

/**
 * Strips all private fields from an object before it leaves the SDK.
 *
 * This is the SDK's primary privacy enforcement mechanism.
 * ANY object that will be returned to a caller must pass through
 * this function first.
 *
 * @param obj - The object to sanitize
 * @param rules - The disclosure ruleset to apply (default: FINANCE)
 * @returns A new object with all private fields removed
 */
export function stripPrivateFields<T extends Record<string, unknown>>(
  obj: T,
  rules = DisclosureRules.FINANCE,
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Check if this field matches any private pattern
    const isPrivate = PRIVATE_FIELD_PATTERNS.some((pattern) =>
      pattern.test(key),
    );

    // Also check against must_hide list (kebab-case converted)
    const camelToKebab = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    const isInHideList = rules.must_hide.some(
      (hiddenField) =>
        hiddenField === camelToKebab || hiddenField === key.toLowerCase(),
    );

    if (!isPrivate && !isInHideList) {
      // If nested object, recurse
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key as keyof T] = stripPrivateFields(
          value as Record<string, unknown>,
          rules,
        ) as T[keyof T];
      } else {
        result[key as keyof T] = value as T[keyof T];
      }
    }
    // Silently drop private fields (no error, no indication of what was dropped)
  }

  return result;
}

/**
 * Validates that an object contains only disclosed fields.
 * Throws if any private field is found (use in tests / CI enforcement).
 *
 * @param obj - Object to validate
 * @param context - Context string for error messages
 */
export function assertNoPrivateFields(
  obj: Record<string, unknown>,
  context = 'unknown',
): void {
  for (const key of Object.keys(obj)) {
    const isPrivate = PRIVATE_FIELD_PATTERNS.some((p) => p.test(key));
    if (isPrivate) {
      throw new Error(
        `[ZeroProof PrivacyViolation] Private field "${key}" found in output at context: ${context}. ` +
          `This field must never leave the SDK boundary.`,
      );
    }
  }
}

/**
 * Checks whether a given field name is safe to disclose.
 *
 * @param fieldName - Field name to check
 * @returns true if the field can be disclosed, false if it must be hidden
 */
export function canDisclose(fieldName: string): boolean {
  const isPrivate = PRIVATE_FIELD_PATTERNS.some((p) => p.test(fieldName));
  return !isPrivate;
}

/**
 * Returns the human-readable compliance status for a set of checks.
 */
export function deriveComplianceStatus(checks: {
  kycPassed?: boolean;
  amlPassed?: boolean;
  isSolvent?: boolean;
}): 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL' {
  const results = Object.values(checks).filter((v) => v !== undefined);
  if (results.length === 0) return 'NON_COMPLIANT';
  if (results.every(Boolean)) return 'COMPLIANT';
  if (results.some(Boolean)) return 'PARTIAL';
  return 'NON_COMPLIANT';
}
