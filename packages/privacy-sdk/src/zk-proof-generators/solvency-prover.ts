/**
 * ZeroProof — Solvency Proof Generator
 *
 * Generates a Groth16 ZK proof that assets > liabilities
 * without revealing the actual amounts.
 *
 * PRIVACY: Private inputs (totalAssets, totalLiabilities) are
 * passed directly to the snarkjs WASM module and never serialized
 * to disk, logs, or network requests.
 */

import * as snarkjs from 'snarkjs';
import { buildPoseidon } from 'circomlibjs';
import { randomBytes } from 'crypto';
import { join } from 'path';
import type {
  SolvencyPrivateInputs,
  SolvencyAttestation,
  ZKProofBundle,
} from '../attestation-types.js';
import { stripPrivateFields } from '../disclosure-rules.js';

// ── Circuit Artifacts ─────────────────────────────────────────
// Pre-compiled WASM and proving key generated from trusted setup.
// In production, these are generated via a proper MPC ceremony.
const CIRCUIT_DIR = join(import.meta.dirname ?? __dirname, '../../dist/circuits');
const SOLVENCY_WASM = join(CIRCUIT_DIR, 'solvency_js/solvency.wasm');
const SOLVENCY_ZKEY = join(CIRCUIT_DIR, 'solvency_final.zkey');

// Circuit version — bump when circuit logic changes (invalidates old proofs)
const CIRCUIT_VERSION = '1.0.0';

// ── Mock Proof Mode (development / CI) ───────────────────────
// When compiled WASM isn't available, generate a structurally valid
// mock proof for UI development and testing.
const USE_MOCK_PROOFS = process.env['ZK_MOCK_PROOFS'] === 'true' ||
  process.env['NODE_ENV'] === 'development';

/**
 * Generates a Groth16 ZK proof proving assets > liabilities.
 *
 * @param inputs - Private inputs (NEVER logs these)
 * @param reportId - Public report identifier
 * @param entityAddress - On-chain entity address
 * @returns Solvency attestation (no private data)
 */
export async function generateSolvencyProof(
  inputs: SolvencyPrivateInputs,
  reportId: string,
  entityAddress: string,
): Promise<{ attestation: SolvencyAttestation; bundle: ZKProofBundle }> {
  const startTime = Date.now();

  // ── Step 1: Generate random salt if not provided ──────────
  const salt = inputs.salt ?? BigInt('0x' + randomBytes(31).toString('hex'));

  // ── Step 2: Build circuit inputs ──────────────────────────
  // These are passed to the ZK WASM — never logged or serialized
  const circuitInputs = {
    totalAssets: inputs.totalAssets.toString(),
    totalLiabilities: inputs.totalLiabilities.toString(),
    salt: salt.toString(),
  };

  // ── Step 3: Compute Poseidon commitment hash ──────────────
  const poseidon = await buildPoseidon();
  const commitmentRaw = poseidon([
    inputs.totalAssets,
    inputs.totalLiabilities,
    salt,
  ]);
  const commitmentHash = '0x' + poseidon.F.toString(commitmentRaw, 16).padStart(64, '0');

  // ── Step 4: Generate the ZK proof ────────────────────────
  let proof: snarkjs.Groth16Proof;
  let publicSignals: string[];

  if (USE_MOCK_PROOFS) {
    // Mock proof for development — structurally valid but not cryptographically sound
    ;({ proof, publicSignals } = generateMockSolvencyProof(
      inputs.totalAssets > inputs.totalLiabilities,
      commitmentHash,
    ));
  } else {
    // Real Groth16 proof using compiled circuit
    ;({ proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInputs,
      SOLVENCY_WASM,
      SOLVENCY_ZKEY,
    ));
  }

  const generationTimeMs = Date.now() - startTime;

  // ── Step 5: Extract public outputs ───────────────────────
  // publicSignals[0] = isSolvent (1 or 0)
  // publicSignals[1] = commitmentHash
  const isSolvent = publicSignals[0] === '1';

  // ── Step 6: Build proof bundle (safe to store on IPFS) ────
  const bundle: ZKProofBundle = {
    proof: proof as unknown as ZKProofBundle['proof'],
    publicSignals,
    proofType: 'solvency',
    reportId,
    timestamp: Date.now(),
    generationTimeMs,
    circuitVersion: CIRCUIT_VERSION,
    metadata: {
      entityAddress,
      proofType: 'solvency',
      network: process.env['MIDNIGHT_NETWORK'] ?? 'testnet',
      sdkVersion: '1.0.0',
    },
  };

  // ── Step 7: Build attestation (public-only output) ────────
  const rawAttestation = {
    isSolvent,
    reportId,
    commitmentHash,
    timestamp: bundle.timestamp,
    ipfsCid: '', // Filled in after IPFS upload
    generationTimeMs,
    // These are stripped by stripPrivateFields:
    totalAssets: inputs.totalAssets,   // @private
    totalLiabilities: inputs.totalLiabilities, // @private
    salt,                               // @private
  };

  const attestation = stripPrivateFields(rawAttestation) as SolvencyAttestation;

  return { attestation, bundle };
}

/**
 * Verifies a Groth16 solvency proof using the verification key.
 *
 * @param bundle - The proof bundle to verify
 * @returns true if proof is valid
 */
export async function verifySolvencyProof(bundle: ZKProofBundle): Promise<boolean> {
  if (USE_MOCK_PROOFS) {
    // In mock mode, just check structural validity
    return (
      bundle.proofType === 'solvency' &&
      bundle.publicSignals.length === 2 &&
      (bundle.publicSignals[0] === '0' || bundle.publicSignals[0] === '1')
    );
  }

  try {
    const vkeyPath = join(CIRCUIT_DIR, 'solvency_verification_key.json');
    const { readFileSync } = await import('fs');
    const vkey = JSON.parse(readFileSync(vkeyPath, 'utf-8')) as object;
    return await snarkjs.groth16.verify(
      vkey,
      bundle.publicSignals,
      bundle.proof as unknown as snarkjs.Groth16Proof,
    );
  } catch {
    return false;
  }
}

// ── Mock Proof Generator ──────────────────────────────────────
function generateMockSolvencyProof(
  isSolvent: boolean,
  commitmentHash: string,
): { proof: snarkjs.Groth16Proof; publicSignals: string[] } {
  const mockHex = (len: number) =>
    Array.from({ length: len }, () =>
      Math.floor(Math.random() * 1e18).toString(),
    );

  return {
    proof: {
      pi_a: [mockHex(1)[0]!, mockHex(1)[0]!, '1'] as [string, string, string],
      pi_b: [
        [mockHex(1)[0]!, mockHex(1)[0]!],
        [mockHex(1)[0]!, mockHex(1)[0]!],
        ['1', '0'],
      ] as [[string, string], [string, string], [string, string]],
      pi_c: [mockHex(1)[0]!, mockHex(1)[0]!, '1'] as [string, string, string],
      protocol: 'groth16',
      curve: 'bn128',
    },
    publicSignals: [isSolvent ? '1' : '0', commitmentHash],
  };
}
