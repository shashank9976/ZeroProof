/**
 * ZeroProof — Proof Routes
 *
 * API endpoints for ZK proof generation and verification.
 *
 * POST /api/proof/solvency    — Generate solvency proof
 * POST /api/proof/compliance  — Generate KYC/AML compliance proof
 * GET  /api/proof/:cid        — Fetch proof metadata from IPFS
 * GET  /api/proof/verify/:cid — Verify proof integrity
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  generateSolvencyProof,
  verifySolvencyProof,
  generateComplianceProof,
  verifyComplianceProof,
  generateMockKYCProviderKey,
  ipfsStorage,
} from '@zeroproof/privacy-sdk';

export const proofRouter = Router();

// ── Request Validation Schemas ────────────────────────────────

const SolvencyRequestSchema = z.object({
  /** Total assets in smallest denomination (e.g., cents) */
  totalAssets: z.string().regex(/^\d+$/).transform(BigInt),
  /** Total liabilities in smallest denomination */
  totalLiabilities: z.string().regex(/^\d+$/).transform(BigInt),
  /** On-chain entity address */
  entityAddress: z.string().optional().default('0x0000000000000000000000000000000000000000'),
  /** Optional: custom solvency threshold in basis points */
  thresholdBps: z.number().int().min(0).max(10000).optional(),
});

const ComplianceRequestSchema = z.object({
  /** Poseidon hash of entity's real ID (computed client-side) */
  entityIdHash: z.string().regex(/^[0-9]+$/).transform(BigInt),
  /** KYC verification status from trusted provider */
  kycVerified: z.union([z.literal(0), z.literal(1)]),
  /** AML risk score 0-100 */
  amlScore: z.number().int().min(0).max(100),
  /** Maximum acceptable AML score */
  amlThreshold: z.number().int().min(0).max(100).default(30),
  /** How many days the attestation should be valid */
  validityDays: z.number().int().min(1).max(365).default(365),
});

// ── POST /api/proof/solvency ──────────────────────────────────

proofRouter.post('/solvency', async (req: Request, res: Response) => {
  const parseResult = SolvencyRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: 'Invalid request',
      details: parseResult.error.flatten(),
    });
    return;
  }

  const { totalAssets, totalLiabilities, entityAddress } = parseResult.data;
  const reportId = uuidv4().replace(/-/g, '');

  try {
    // Generate ZK proof (private inputs never logged or stored)
    const { attestation, bundle } = await generateSolvencyProof(
      { totalAssets, totalLiabilities, salt: BigInt(0) },
      reportId,
      entityAddress,
    );

    // Upload proof bundle to IPFS
    const ipfsResult = await ipfsStorage.uploadProofBundle(bundle);
    attestation.ipfsCid = ipfsResult.cid;

    // Return ONLY the public attestation — no private data
    res.status(201).json({
      success: true,
      attestation,
      ipfs: {
        cid: ipfsResult.cid,
        url: ipfsResult.url,
      },
    });
  } catch (error) {
    console.error('[ZeroProof] Solvency proof generation failed:', (error as Error).message);
    res.status(500).json({ error: 'Proof generation failed' });
  }
});

// ── POST /api/proof/compliance ────────────────────────────────

proofRouter.post('/compliance', async (req: Request, res: Response) => {
  const parseResult = ComplianceRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: 'Invalid request',
      details: parseResult.error.flatten(),
    });
    return;
  }

  const {
    entityIdHash,
    kycVerified,
    amlScore,
    amlThreshold,
    validityDays,
  } = parseResult.data;

  const attestationId = uuidv4().replace(/-/g, '');

  try {
    // Generate mock KYC provider credentials for development
    const kycProvider = await generateMockKYCProviderKey();
    const kycSignature = await kycProvider.sign(entityIdHash);

    const { attestation, bundle } = await generateComplianceProof(
      {
        entityIdHash,
        kycVerified,
        amlScore,
        amlThreshold,
        kycProviderPubKey: kycProvider.pubKey,
        kycSignature,
        sanctionsMerkleRoot: BigInt(
          '14506740726498940973625378455806936553152623039702702935673848437990682856520',
        ),
        sanctionsPathElements: Array.from({ length: 20 }, () => BigInt(0)),
        sanctionsPathIndices: Array.from({ length: 20 }, () => 0),
      },
      attestationId,
      validityDays,
    );

    const ipfsResult = await ipfsStorage.uploadProofBundle(bundle);
    attestation.ipfsCid = ipfsResult.cid;

    res.status(201).json({
      success: true,
      attestation,
      ipfs: { cid: ipfsResult.cid, url: ipfsResult.url },
    });
  } catch (error) {
    console.error('[ZeroProof] Compliance proof generation failed:', (error as Error).message);
    res.status(500).json({ error: 'Compliance proof generation failed' });
  }
});

// ── GET /api/proof/verify/:cid ────────────────────────────────

proofRouter.get('/verify/:cid', async (req: Request, res: Response) => {
  const { cid } = req.params;

  if (!cid || cid.length < 10) {
    res.status(400).json({ error: 'Invalid CID' });
    return;
  }

  try {
    const record = await ipfsStorage.verifyProofCid(cid);

    if (!record.isVerified) {
      res.status(404).json({ error: 'Proof not found or invalid', cid });
      return;
    }

    // Verify the cryptographic proof itself
    const bundle = await ipfsStorage.getProofBundle(cid);
    let cryptoValid = false;

    if (bundle) {
      if (bundle.proofType === 'solvency') {
        cryptoValid = await verifySolvencyProof(bundle);
      } else if (bundle.proofType === 'compliance') {
        cryptoValid = await verifyComplianceProof(bundle);
      }
    }

    res.json({
      cid,
      isValid: cryptoValid,
      proofType: record.proofType,
      timestamp: record.timestamp,
      publicSignals: record.publicSignals,
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ── GET /api/proof/:cid ───────────────────────────────────────

proofRouter.get('/:cid', async (req: Request, res: Response) => {
  const { cid } = req.params;

  try {
    const bundle = await ipfsStorage.getProofBundle(cid);

    if (!bundle) {
      res.status(404).json({ error: 'Proof bundle not found', cid });
      return;
    }

    // Return bundle but ensure no private data leaked
    res.json({
      cid,
      proofType: bundle.proofType,
      reportId: bundle.reportId,
      timestamp: bundle.timestamp,
      generationTimeMs: bundle.generationTimeMs,
      publicSignals: bundle.publicSignals,
      circuitVersion: bundle.circuitVersion,
      proofSystem: 'Groth16',
      // Note: proof.pi_a/pi_b/pi_c are mathematical outputs — not private data
      proof: bundle.proof,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve proof' });
  }
});
