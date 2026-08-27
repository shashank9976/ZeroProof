'use client';

import { useState, useCallback } from 'react';
import { usePrivacy, type StoredProof } from '@/context/PrivacyContext';
import { useWorkplace } from '@/context/WorkplaceContext';
import type {
  CredentialProofRequest,
  ConsentScope,
} from '@/types/workplace';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export interface WorkplaceProofState {
  status: 'idle' | 'generating' | 'uploading' | 'done' | 'error';
  progress: number;
  error: string | null;
  generationTimeMs: number | null;
}

// ── Simulate staged progress ──────────────────────────────────

async function simulateProgress(
  setState: React.Dispatch<React.SetStateAction<WorkplaceProofState>>,
  steps: { progress: number; delay: number; status: WorkplaceProofState['status'] }[]
) {
  for (const step of steps) {
    await new Promise((r) => setTimeout(r, step.delay));
    setState((prev) => ({ ...prev, progress: step.progress, status: step.status }));
  }
}

// ── Mock generators (fallback when API is unavailable) ────────

function mockCredentialValidityProof(req: CredentialProofRequest, credentialName: string): StoredProof {
  return {
    id: crypto.randomUUID(),
    proofType: 'credential-validity',
    status: 'PASSED',
    attestationId: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    ipfsCid: `QmWorkVault${Math.random().toString(36).substring(2, 46)}`,
    timestamp: Date.now(),
    generationTimeMs: Math.floor(Math.random() * 1500) + 800,
    category: 'education',
    credentialName,
    isValidCredential: true,
    consentScope: req.consentScope,
    companyId: req.companyId,
    expiresAt: Date.now() + 86400000 * 30,
  };
}

function mockDisclosureProof(req: CredentialProofRequest, credentialName: string): StoredProof {
  return {
    id: crypto.randomUUID(),
    proofType: 'disclosure-proof',
    status: 'PASSED',
    attestationId: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    ipfsCid: `QmWorkDisclose${Math.random().toString(36).substring(2, 46)}`,
    timestamp: Date.now(),
    generationTimeMs: Math.floor(Math.random() * 2000) + 1000,
    category: 'background-check',
    credentialName,
    isValidCredential: true,
    fieldMatches: true,
    companyId: req.companyId,
    expiresAt: Date.now() + 86400000 * 7,
  };
}

// ── Hook ──────────────────────────────────────────────────────

export function useWorkplaceProof() {
  const { addProof } = usePrivacy();
  const { credentialRecords, addAuditEvent } = useWorkplace();

  const [proofState, setProofState] = useState<WorkplaceProofState>({
    status: 'idle',
    progress: 0,
    error: null,
    generationTimeMs: null,
  });

  // ── Generate Credential Validity Proof ────────────────────

  const generateCredentialValidityProof = useCallback(
    async (req: CredentialProofRequest): Promise<StoredProof | null> => {
      const record = credentialRecords.find((r) => r.id === req.recordId);
      const credName = record?.name ?? 'Credential Record';

      setProofState({ status: 'generating', progress: 10, error: null, generationTimeMs: null });

      try {
        await simulateProgress(setProofState, [
          { progress: 30, delay: 400, status: 'generating' },
          { progress: 60, delay: 700, status: 'generating' },
          { progress: 85, delay: 400, status: 'uploading' },
        ]);

        // Attempt API call (will fall back to mock since endpoint is client-simulated)
        const response = await fetch(`${API_BASE}/api/proof/credential-validity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
        });

        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = await response.json() as { proof: StoredProof };
        const proof = data.proof;

        setProofState({ status: 'done', progress: 100, error: null, generationTimeMs: proof.generationTimeMs });
        addProof(proof);
        addAuditEvent({
          id: crypto.randomUUID(),
          eventType: 'proof_generated',
          timestamp: Date.now(),
          actorId: req.companyId,
          scope: req.consentScope,
        });
        return proof;
      } catch {
        const mock = mockCredentialValidityProof(req, credName);
        setProofState({ status: 'done', progress: 100, error: null, generationTimeMs: mock.generationTimeMs });
        addProof(mock);
        addAuditEvent({
          id: crypto.randomUUID(),
          eventType: 'proof_generated',
          timestamp: Date.now(),
          actorId: req.companyId,
          scope: req.consentScope,
        });
        return mock;
      }
    },
    [addProof, addAuditEvent, credentialRecords]
  );

  // ── Generate Disclosure Proof ─────────────────────────────

  const generateDisclosureProof = useCallback(
    async (req: CredentialProofRequest): Promise<StoredProof | null> => {
      const record = credentialRecords.find((r) => r.id === req.recordId);
      const credName = record?.name ?? 'Credential Record';

      setProofState({ status: 'generating', progress: 10, error: null, generationTimeMs: null });

      try {
        await simulateProgress(setProofState, [
          { progress: 20, delay: 500, status: 'generating' },
          { progress: 55, delay: 900, status: 'generating' },
          { progress: 80, delay: 500, status: 'uploading' },
        ]);

        const response = await fetch(`${API_BASE}/api/proof/disclosure`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
        });

        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = await response.json() as { proof: StoredProof };
        const proof = data.proof;

        setProofState({ status: 'done', progress: 100, error: null, generationTimeMs: proof.generationTimeMs });
        addProof(proof);
        return proof;
      } catch {
        const mock = mockDisclosureProof(req, credName);
        setProofState({ status: 'done', progress: 100, error: null, generationTimeMs: mock.generationTimeMs });
        addProof(mock);
        return mock;
      }
    },
    [addProof, credentialRecords]
  );

  const reset = useCallback(() => {
    setProofState({ status: 'idle', progress: 0, error: null, generationTimeMs: null });
  }, []);

  return {
    proofState,
    generateCredentialValidityProof,
    generateDisclosureProof,
    reset,
  };
}
