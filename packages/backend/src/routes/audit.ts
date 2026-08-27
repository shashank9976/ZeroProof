/**
 * ZeroProof — Audit Routes
 *
 * Read-only audit trail endpoints for regulators and auditors.
 * Returns ONLY public compliance verdicts and IPFS CIDs.
 * Never returns raw financial data or identity information.
 *
 * GET /api/audit/report/:entityAddress  — Get full audit report
 * GET /api/audit/history                — List recent proofs
 * GET /api/audit/status                 — Current compliance status summary
 */

import { Router, type Request, type Response } from 'express';
import { ipfsStorage } from '@zeroproof/privacy-sdk';
import { deriveComplianceStatus } from '@zeroproof/privacy-sdk';

export const auditRouter = Router();

// ── In-memory proof registry (use a database in production) ───
// Maps entityAddress → array of proof CIDs
const proofRegistry = new Map<string, Array<{ cid: string; type: string; timestamp: number }>>();

/**
 * Registers a new proof CID for an entity.
 * Called internally after successful proof generation.
 */
export function registerProof(entityAddress: string, cid: string, type: string): void {
  const existing = proofRegistry.get(entityAddress) ?? [];
  existing.push({ cid, type, timestamp: Date.now() });
  proofRegistry.set(entityAddress, existing);
}

// ── GET /api/audit/status ─────────────────────────────────────

auditRouter.get('/status', async (_req: Request, res: Response) => {
  // Return aggregate stats — no individual entity data
  const totalProofs = Array.from(proofRegistry.values()).reduce(
    (sum, proofs) => sum + proofs.length,
    0,
  );

  res.json({
    platform: 'ZeroProof',
    version: '1.0.0',
    totalProofsGenerated: totalProofs,
    proofSystem: 'Groth16',
    network: process.env['MIDNIGHT_NETWORK'] ?? 'testnet',
    timestamp: Date.now(),
    privacyModel: {
      disclosed: ['compliance_status', 'attestation_valid', 'ipfs_cid'],
      proven: ['solvency_verified', 'kyc_completed', 'aml_cleared'],
      hidden: ['account_balances', 'transaction_details', 'counterparty_identities'],
    },
  });
});

// ── GET /api/audit/report/:entityAddress ──────────────────────

auditRouter.get('/report/:entityAddress', async (req: Request, res: Response) => {
  const { entityAddress } = req.params;

  const proofs = proofRegistry.get(entityAddress as string);

  if (!proofs || proofs.length === 0) {
    res.status(404).json({
      error: 'No proofs found for entity',
      entityAddress,
      note: 'Entity may not have generated any proofs yet',
    });
    return;
  }

  // Fetch the latest proof of each type
  const latestByType = new Map<string, (typeof proofs)[0]>();
  for (const proof of proofs) {
    const existing = latestByType.get(proof.type);
    if (!existing || proof.timestamp > existing.timestamp) {
      latestByType.set(proof.type, proof);
    }
  }

  // Fetch public signals from IPFS for each proof
  const checks: Array<{
    name: string;
    status: 'PASSED' | 'FAILED' | 'NOT_RUN';
    cid?: string;
    verifiedAt?: number;
  }> = [];

  let isSolvent: boolean | undefined;
  let kycPassed: boolean | undefined;
  let amlPassed: boolean | undefined;

  for (const [type, proofRef] of latestByType.entries()) {
    const record = await ipfsStorage.verifyProofCid(proofRef.cid);

    if (type === 'solvency') {
      isSolvent = record.publicSignals[0] === '1';
      checks.push({
        name: 'Solvency Verification',
        status: isSolvent ? 'PASSED' : 'FAILED',
        cid: proofRef.cid,
        verifiedAt: proofRef.timestamp,
      });
    } else if (type === 'compliance') {
      kycPassed = record.publicSignals[0] === '1';
      amlPassed = record.publicSignals[1] === '1';
      checks.push({
        name: 'KYC Identity Verification',
        status: kycPassed ? 'PASSED' : 'FAILED',
        cid: proofRef.cid,
        verifiedAt: proofRef.timestamp,
      });
      checks.push({
        name: 'AML Risk Screening',
        status: amlPassed ? 'PASSED' : 'FAILED',
        cid: proofRef.cid,
        verifiedAt: proofRef.timestamp,
      });
    }
  }

  const overallStatus = deriveComplianceStatus({ isSolvent, kycPassed, amlPassed });

  res.json({
    entityAddress,
    overallStatus,
    generatedAt: Date.now(),
    checks,
    proofCount: proofs.length,
    proofSystem: 'Groth16',
    network: process.env['MIDNIGHT_NETWORK'] ?? 'testnet',
    // Auditor note: no raw financial data in this report
    privateDataDisclosed: [],
    note: 'All compliance checks verified via Zero-Knowledge Proofs. No raw financial data is included.',
  });
});

// ── GET /api/audit/history ────────────────────────────────────

auditRouter.get('/history', async (_req: Request, res: Response) => {
  // Return recent proof events — anonymized at entity level
  const allProofs: Array<{ cid: string; type: string; timestamp: number }> = [];

  for (const proofs of proofRegistry.values()) {
    allProofs.push(...proofs);
  }

  // Sort by timestamp descending, return last 50
  const recent = allProofs
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50)
    .map((p) => ({
      cid: p.cid,
      proofType: p.type,
      timestamp: p.timestamp,
      // Entity address intentionally omitted for privacy
    }));

  res.json({
    proofs: recent,
    total: allProofs.length,
  });
});
