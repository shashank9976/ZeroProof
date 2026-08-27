/**
 * ZeroProof — KYC/AML Compliance Proof Generator
 *
 * Generates a Groth16 ZK proof proving an entity has passed
 * KYC identity verification and AML risk screening WITHOUT
 * revealing the entity's identity, score, or transaction history.
 */

import * as snarkjs from 'snarkjs';
import { buildPoseidon, buildEddsa } from 'circomlibjs';
import { join } from 'path';
import type {
  CompliancePrivateInputs,
  ComplianceAttestation,
  ZKProofBundle,
} from '../attestation-types.js';
import { stripPrivateFields } from '../disclosure-rules.js';

const CIRCUIT_DIR = join(import.meta.dirname ?? __dirname, '../../dist/circuits');
const COMPLIANCE_WASM = join(CIRCUIT_DIR, 'compliance_js/compliance.wasm');
const COMPLIANCE_ZKEY = join(CIRCUIT_DIR, 'compliance_final.zkey');
const CIRCUIT_VERSION = '1.0.0';

const USE_MOCK_PROOFS =
  process.env['ZK_MOCK_PROOFS'] === 'true' ||
  process.env['NODE_ENV'] === 'development';

// Default sanctions list root (represents an empty/test list for demo)
const DEFAULT_SANCTIONS_ROOT =
  '14506740726498940973625378455806936553152623039702702935673848437990682856520';

/**
 * Generates a Groth16 ZK proof of KYC/AML compliance.
 *
 * @param inputs - Private compliance inputs (never logged)
 * @param attestationId - Public attestation identifier
 * @param validityDays - How many days this attestation is valid (e.g., 365)
 * @returns Compliance attestation (no private data)
 */
export async function generateComplianceProof(
  inputs: CompliancePrivateInputs,
  attestationId: string,
  validityDays = 365,
): Promise<{ attestation: ComplianceAttestation; bundle: ZKProofBundle }> {
  const startTime = Date.now();
  const timestamp = Math.floor(Date.now() / 1000);

  // ── Step 1: Compute attestation ID via Poseidon ───────────
  const poseidon = await buildPoseidon();
  const attestationIdRaw = poseidon([
    inputs.entityIdHash,
    BigInt(timestamp),
  ]);
  const attestationIdHex =
    '0x' + poseidon.F.toString(attestationIdRaw, 16).padStart(64, '0');

  // ── Step 2: Build circuit inputs ──────────────────────────
  // Pad sanctions path to MERKLE_LEVELS = 20
  const MERKLE_LEVELS = 20;
  const pathElements = [...inputs.sanctionsPathElements];
  const pathIndices = [...inputs.sanctionsPathIndices];
  while (pathElements.length < MERKLE_LEVELS) {
    pathElements.push(BigInt(0));
    pathIndices.push(0);
  }

  const circuitInputs = {
    entityIdHash: inputs.entityIdHash.toString(),
    kycVerified: inputs.kycVerified.toString(),
    amlScore: inputs.amlScore.toString(),
    amlThreshold: inputs.amlThreshold.toString(),
    kycProviderPubKeyX: inputs.kycProviderPubKey.x.toString(),
    kycProviderPubKeyY: inputs.kycProviderPubKey.y.toString(),
    kycSignatureR8x: inputs.kycSignature.R8[0].toString(),
    kycSignatureR8y: inputs.kycSignature.R8[1].toString(),
    kycSignatureS: inputs.kycSignature.S.toString(),
    sanctionsMerkleRoot: (
      inputs.sanctionsMerkleRoot ?? BigInt(DEFAULT_SANCTIONS_ROOT)
    ).toString(),
    sanctionsPathElements: pathElements.map((e) => e.toString()),
    sanctionsPathIndices: pathIndices.map((i) => i.toString()),
    timestamp: timestamp.toString(),
  };

  // ── Step 3: Generate proof ─────────────────────────────────
  let proof: snarkjs.Groth16Proof;
  let publicSignals: string[];

  if (USE_MOCK_PROOFS) {
    ;({ proof, publicSignals } = generateMockComplianceProof(
      inputs.kycVerified === 1,
      inputs.amlScore < inputs.amlThreshold,
      attestationIdHex,
      timestamp,
    ));
  } else {
    ;({ proof, publicSignals } = await snarkjs.groth16.fullProve(
      circuitInputs,
      COMPLIANCE_WASM,
      COMPLIANCE_ZKEY,
    ));
  }

  const generationTimeMs = Date.now() - startTime;

  // ── Step 4: Extract public outputs ────────────────────────
  // publicSignals[0] = kycPassed
  // publicSignals[1] = amlPassed
  // publicSignals[2] = fullyCompliant
  // publicSignals[3] = attestationId (Poseidon hash)
  const kycPassed = publicSignals[0] === '1';
  const amlPassed = publicSignals[1] === '1';
  const fullyCompliant = publicSignals[2] === '1';
  const validUntil = timestamp + validityDays * 86400;

  // ── Step 5: Build proof bundle ─────────────────────────────
  const bundle: ZKProofBundle = {
    proof: proof as unknown as ZKProofBundle['proof'],
    publicSignals,
    proofType: 'compliance',
    reportId: attestationId,
    timestamp: Date.now(),
    generationTimeMs,
    circuitVersion: CIRCUIT_VERSION,
    metadata: {
      proofType: 'compliance',
      network: process.env['MIDNIGHT_NETWORK'] ?? 'testnet',
      sdkVersion: '1.0.0',
    },
  };

  // ── Step 6: Build attestation (all private fields stripped) ─
  const rawAttestation = {
    kycPassed,
    amlPassed,
    fullyCompliant,
    attestationId,
    timestamp: bundle.timestamp,
    validUntil,
    ipfsCid: '',
    generationTimeMs,
    // Private fields below — stripped by stripPrivateFields:
    entityIdHash: inputs.entityIdHash, // @private
    amlScore: inputs.amlScore,          // @private
    kycVerified: inputs.kycVerified,    // @private
  };

  const attestation = stripPrivateFields(rawAttestation) as ComplianceAttestation;

  return { attestation, bundle };
}

/**
 * Verifies a Groth16 compliance proof.
 */
export async function verifyComplianceProof(bundle: ZKProofBundle): Promise<boolean> {
  if (USE_MOCK_PROOFS) {
    return (
      bundle.proofType === 'compliance' &&
      bundle.publicSignals.length === 4 &&
      (bundle.publicSignals[0] === '0' || bundle.publicSignals[0] === '1') &&
      (bundle.publicSignals[1] === '0' || bundle.publicSignals[1] === '1') &&
      (bundle.publicSignals[2] === '0' || bundle.publicSignals[2] === '1')
    );
  }

  try {
    const { readFileSync } = await import('fs');
    const vkeyPath = join(CIRCUIT_DIR, 'compliance_verification_key.json');
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

/**
 * Generates a mock KYC provider EdDSA key pair for testing.
 * In production, the real KYC provider holds this key.
 */
export async function generateMockKYCProviderKey(): Promise<{
  pubKey: { x: bigint; y: bigint };
  sign: (message: bigint) => Promise<{ R8: [bigint, bigint]; S: bigint }>;
}> {
  const eddsa = await buildEddsa();
  const privateKey = Buffer.from(
    'KYC_PROVIDER_MOCK_PRIVATE_KEY_FOR_DEV_ONLY_000',
    'utf-8',
  ).subarray(0, 32);

  const pubKeyPoint = eddsa.prv2pub(privateKey);

  return {
    pubKey: {
      x: BigInt(eddsa.F.toString(pubKeyPoint[0])),
      y: BigInt(eddsa.F.toString(pubKeyPoint[1])),
    },
    sign: async (message: bigint) => {
      const sig = eddsa.signPoseidon(privateKey, message);
      return {
        R8: [
          BigInt(eddsa.F.toString(sig.R8[0])),
          BigInt(eddsa.F.toString(sig.R8[1])),
        ] as [bigint, bigint],
        S: BigInt(sig.S.toString()),
      };
    },
  };
}

// ── Mock Proof Generator ──────────────────────────────────────
function generateMockComplianceProof(
  kycPassed: boolean,
  amlPassed: boolean,
  attestationIdHex: string,
  _timestamp: number,
): { proof: snarkjs.Groth16Proof; publicSignals: string[] } {
  const fullyCompliant = kycPassed && amlPassed;

  return {
    proof: {
      pi_a: [
        Math.floor(Math.random() * 1e18).toString(),
        Math.floor(Math.random() * 1e18).toString(),
        '1',
      ] as [string, string, string],
      pi_b: [
        [
          Math.floor(Math.random() * 1e18).toString(),
          Math.floor(Math.random() * 1e18).toString(),
        ],
        [
          Math.floor(Math.random() * 1e18).toString(),
          Math.floor(Math.random() * 1e18).toString(),
        ],
        ['1', '0'],
      ] as [[string, string], [string, string], [string, string]],
      pi_c: [
        Math.floor(Math.random() * 1e18).toString(),
        Math.floor(Math.random() * 1e18).toString(),
        '1',
      ] as [string, string, string],
      protocol: 'groth16',
      curve: 'bn128',
    },
    publicSignals: [
      kycPassed ? '1' : '0',
      amlPassed ? '1' : '0',
      fullyCompliant ? '1' : '0',
      attestationIdHex,
    ],
  };
}
