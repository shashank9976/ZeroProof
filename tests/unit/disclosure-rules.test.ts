/**
 * ZeroProof — Disclosure Rules Unit Tests
 *
 * Tests that private fields NEVER appear in SDK output.
 * These tests enforce the privacy guarantee at the SDK boundary.
 */

import { describe, it, expect } from 'vitest';
import {
  stripPrivateFields,
  assertNoPrivateFields,
  canDisclose,
  deriveComplianceStatus,
  DisclosureRules,
} from '../../packages/privacy-sdk/src/disclosure-rules.js';

describe('DisclosureRules', () => {
  // ── DisclosureRules structure ──────────────────────────────

  it('should define the FINANCE disclosure profile', () => {
    expect(DisclosureRules.FINANCE).toBeDefined();
    expect(DisclosureRules.FINANCE.can_disclose).toContain('compliance_status');
    expect(DisclosureRules.FINANCE.must_prove).toContain('solvency_verified');
    expect(DisclosureRules.FINANCE.must_hide).toContain('account_balances');
  });

  it('should require all KYC/AML fields to be hidden', () => {
    const rules = DisclosureRules.FINANCE;
    expect(rules.must_hide).toContain('transaction_details');
    expect(rules.must_hide).toContain('counterparty_identities');
    expect(rules.must_hide).toContain('account_balances');
  });
});

describe('stripPrivateFields', () => {
  it('should remove totalAssets from any object', () => {
    const result = stripPrivateFields({ totalAssets: BigInt(1_000_000), isSolvent: true });
    expect(result).not.toHaveProperty('totalAssets');
    expect(result).toHaveProperty('isSolvent', true);
  });

  it('should remove totalLiabilities', () => {
    const result = stripPrivateFields({ totalLiabilities: BigInt(500_000), reportId: 'abc' });
    expect(result).not.toHaveProperty('totalLiabilities');
    expect(result).toHaveProperty('reportId', 'abc');
  });

  it('should remove amlScore', () => {
    const result = stripPrivateFields({ amlScore: 15, kycPassed: true });
    expect(result).not.toHaveProperty('amlScore');
    expect(result).toHaveProperty('kycPassed', true);
  });

  it('should remove salt/nonce', () => {
    const result = stripPrivateFields({ salt: BigInt(999), nonce: 'secret', commitmentHash: '0xabc' });
    expect(result).not.toHaveProperty('salt');
    expect(result).not.toHaveProperty('nonce');
    expect(result).toHaveProperty('commitmentHash', '0xabc');
  });

  it('should recursively strip nested private fields', () => {
    const result = stripPrivateFields({
      proof: { isSolvent: true },
      internal: { totalAssets: BigInt(1_000_000) },
    });
    expect((result['internal'] as Record<string, unknown>)).not.toHaveProperty('totalAssets');
    expect((result['proof'] as Record<string, unknown>)).toHaveProperty('isSolvent');
  });

  it('should preserve all safe public fields', () => {
    const input = {
      isSolvent: true,
      reportId: 'abc123',
      commitmentHash: '0xdeadbeef',
      ipfsCid: 'QmTest',
      timestamp: 1234567890,
      generationTimeMs: 1847,
    };
    const result = stripPrivateFields(input);
    for (const [key, value] of Object.entries(input)) {
      expect(result).toHaveProperty(key, value);
    }
  });

  it('should handle arrays without error', () => {
    const result = stripPrivateFields({
      proofs: ['a', 'b', 'c'],
      attestationId: 'test',
    });
    expect(result).toHaveProperty('proofs');
    expect(result).toHaveProperty('attestationId');
  });
});

describe('assertNoPrivateFields', () => {
  it('should not throw for clean objects', () => {
    expect(() =>
      assertNoPrivateFields({ isSolvent: true, reportId: 'abc', ipfsCid: 'Qm...' }, 'test'),
    ).not.toThrow();
  });

  it('should throw if totalAssets appears in output', () => {
    expect(() =>
      assertNoPrivateFields({ totalAssets: '1000000' }, 'API response'),
    ).toThrow(/PrivacyViolation/);
  });

  it('should throw if balance field appears', () => {
    expect(() =>
      assertNoPrivateFields({ balance: '5000' }, 'wallet endpoint'),
    ).toThrow(/PrivacyViolation/);
  });
});

describe('canDisclose', () => {
  it('should allow compliance_status field', () => {
    expect(canDisclose('compliance_status')).toBe(true);
  });

  it('should allow ipfsCid field', () => {
    expect(canDisclose('ipfsCid')).toBe(true);
  });

  it('should block totalAssets field', () => {
    expect(canDisclose('totalAssets')).toBe(false);
  });

  it('should block amlScore field', () => {
    expect(canDisclose('amlScore')).toBe(false);
  });

  it('should block salt field', () => {
    expect(canDisclose('salt')).toBe(false);
  });
});

describe('deriveComplianceStatus', () => {
  it('returns COMPLIANT when all checks pass', () => {
    expect(deriveComplianceStatus({ kycPassed: true, amlPassed: true, isSolvent: true })).toBe('COMPLIANT');
  });

  it('returns NON_COMPLIANT when all checks fail', () => {
    expect(deriveComplianceStatus({ kycPassed: false, amlPassed: false, isSolvent: false })).toBe('NON_COMPLIANT');
  });

  it('returns PARTIAL when some checks pass', () => {
    expect(deriveComplianceStatus({ kycPassed: true, amlPassed: false })).toBe('PARTIAL');
  });

  it('returns NON_COMPLIANT for empty input', () => {
    expect(deriveComplianceStatus({})).toBe('NON_COMPLIANT');
  });
});
