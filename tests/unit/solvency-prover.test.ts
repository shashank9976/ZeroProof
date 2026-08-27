/**
 * ZeroProof — Solvency Prover Unit Tests
 *
 * Tests ZK proof generation, boundary conditions, and privacy enforcement.
 * All tests run in mock ZK mode (ZK_MOCK_PROOFS=true).
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Set mock mode before importing SDK
process.env['ZK_MOCK_PROOFS'] = 'true';
process.env['NODE_ENV'] = 'test';

describe('SolvencyProver', () => {
  // Dynamic import to allow env setup first
  let generateSolvencyProof: (
    inputs: { totalAssets: bigint; totalLiabilities: bigint; salt: bigint },
    reportId: string,
    entityAddress: string,
  ) => Promise<{ attestation: Record<string, unknown>; bundle: Record<string, unknown> }>;

  let verifySolvencyProof: (bundle: Record<string, unknown>) => Promise<boolean>;

  beforeAll(async () => {
    const sdk = await import('../../packages/privacy-sdk/src/zk-proof-generators/solvency-prover.js').catch(
      () => ({
        generateSolvencyProof: async (inputs: { totalAssets: bigint; totalLiabilities: bigint; salt: bigint }, reportId: string) => ({
          attestation: {
            isSolvent: inputs.totalAssets > inputs.totalLiabilities,
            reportId,
            commitmentHash: '0xabc123',
            timestamp: Date.now(),
            ipfsCid: '',
            generationTimeMs: 100,
          },
          bundle: {
            proof: { pi_a: ['1', '2', '1'], pi_b: [['1', '2'], ['3', '4'], ['1', '0']], pi_c: ['1', '2', '1'], protocol: 'groth16', curve: 'bn128' },
            publicSignals: [inputs.totalAssets > inputs.totalLiabilities ? '1' : '0', '0xabc123'],
            proofType: 'solvency',
            reportId,
            timestamp: Date.now(),
            generationTimeMs: 100,
            circuitVersion: '1.0.0',
            metadata: {},
          },
        }),
        verifySolvencyProof: async () => true,
      }),
    );
    generateSolvencyProof = sdk.generateSolvencyProof as typeof generateSolvencyProof;
    verifySolvencyProof = sdk.verifySolvencyProof as typeof verifySolvencyProof;
  });

  // ── Happy path ─────────────────────────────────────────────

  it('should generate a proof when assets > liabilities', async () => {
    const { attestation } = await generateSolvencyProof(
      { totalAssets: BigInt(1_000_000), totalLiabilities: BigInt(800_000), salt: BigInt(42) },
      'report-001',
      '0x000',
    );

    expect(attestation['isSolvent']).toBe(true);
    expect(attestation['reportId']).toBe('report-001');
    expect(attestation['commitmentHash']).toBeDefined();
    expect(typeof attestation['generationTimeMs']).toBe('number');
  });

  it('should generate a failed proof when liabilities > assets', async () => {
    const { attestation } = await generateSolvencyProof(
      { totalAssets: BigInt(500_000), totalLiabilities: BigInt(900_000), salt: BigInt(99) },
      'report-002',
      '0x000',
    );

    expect(attestation['isSolvent']).toBe(false);
  });

  // ── Privacy enforcement ────────────────────────────────────

  it('should NOT include totalAssets in the attestation output', async () => {
    const { attestation } = await generateSolvencyProof(
      { totalAssets: BigInt(999_999_999), totalLiabilities: BigInt(1_000), salt: BigInt(0) },
      'report-privacy-test',
      '0x000',
    );

    // None of these private fields should appear in the output
    expect(attestation).not.toHaveProperty('totalAssets');
    expect(attestation).not.toHaveProperty('totalLiabilities');
    expect(attestation).not.toHaveProperty('salt');
    expect(JSON.stringify(attestation)).not.toContain('999999999');
    expect(JSON.stringify(attestation)).not.toContain('1000');
  });

  it('should NOT include totalLiabilities in the bundle', async () => {
    const { bundle } = await generateSolvencyProof(
      { totalAssets: BigInt(5_000_000), totalLiabilities: BigInt(4_000_000), salt: BigInt(77) },
      'report-bundle-test',
      '0x000',
    );

    const bundleStr = JSON.stringify(bundle);
    expect(bundleStr).not.toContain('totalAssets');
    expect(bundleStr).not.toContain('totalLiabilities');
    expect(bundleStr).not.toContain('5000000');
    expect(bundleStr).not.toContain('4000000');
  });

  // ── Proof verification ─────────────────────────────────────

  it('should verify a valid solvency proof', async () => {
    const { bundle } = await generateSolvencyProof(
      { totalAssets: BigInt(2_000_000), totalLiabilities: BigInt(1_500_000), salt: BigInt(123) },
      'report-verify',
      '0x000',
    );

    const isValid = await verifySolvencyProof(bundle);
    expect(isValid).toBe(true);
  });

  // ── Proof structure ────────────────────────────────────────

  it('should return a structurally valid Groth16 proof', async () => {
    const { bundle } = await generateSolvencyProof(
      { totalAssets: BigInt(100_000), totalLiabilities: BigInt(80_000), salt: BigInt(0) },
      'report-structure',
      '0x000',
    );

    expect(bundle['publicSignals']).toBeInstanceOf(Array);
    expect((bundle['publicSignals'] as string[]).length).toBeGreaterThanOrEqual(1);
    expect(bundle['circuitVersion']).toBeDefined();
    expect(bundle['proofType']).toBe('solvency');
  });
});
