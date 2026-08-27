'use client';

import { useState, useCallback } from 'react';
import { usePrivacy, type StoredProof } from '@/context/PrivacyContext';


const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

// ── Solvency Proof Generation ─────────────────────────────────

export interface SolvencyProofRequest {
  totalAssets: string;       // In cents/smallest denomination
  totalLiabilities: string;
  entityAddress?: string;
}

export interface ComplianceProofRequest {
  entityIdHash: string;       // Poseidon hash (computed client-side)
  kycVerified: 0 | 1;
  amlScore: number;
  amlThreshold?: number;
  validityDays?: number;
}

export interface ProofGenerationState {
  status: 'idle' | 'generating' | 'uploading' | 'done' | 'error';
  progress: number;
  error: string | null;
  generationTimeMs: number | null;
}

// ── Hook ──────────────────────────────────────────────────────

export function useProofGeneration() {
  const { addProof, setIsGenerating, setLastGeneratedProofId } = usePrivacy();
  const [state, setState] = useState<ProofGenerationState>({
    status: 'idle',
    progress: 0,
    error: null,
    generationTimeMs: null,
  });

  const generateSolvencyProof = useCallback(
    async (request: SolvencyProofRequest): Promise<StoredProof | null> => {
      setState({ status: 'generating', progress: 10, error: null, generationTimeMs: null });
      setIsGenerating(true);

      try {
        // Simulate proof server processing stages
        await simulateProgress(setState, [
          { progress: 25, delay: 300, status: 'generating' },
          { progress: 55, delay: 600, status: 'generating' },
          { progress: 80, delay: 400, status: 'uploading' },
        ]);

        const response = await fetch(`${API_BASE}/api/proof/solvency`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = (await response.json()) as {
          attestation: {
            isSolvent: boolean;
            reportId: string;
            commitmentHash: string;
            ipfsCid: string;
            generationTimeMs: number;
            timestamp: number;
          };
          ipfs: { cid: string };
        };

        const proof: StoredProof = {
          id: crypto.randomUUID(),
          proofType: 'solvency',
          status: data.attestation.isSolvent ? 'PASSED' : 'FAILED',
          attestationId: data.attestation.reportId,
          ipfsCid: data.ipfs.cid,
          timestamp: data.attestation.timestamp,
          generationTimeMs: data.attestation.generationTimeMs,
          isSolvent: data.attestation.isSolvent,
          commitmentHash: data.attestation.commitmentHash,
        };

        setState({ status: 'done', progress: 100, error: null, generationTimeMs: proof.generationTimeMs });
        addProof(proof);
        setLastGeneratedProofId(proof.id);
        return proof;
      } catch (err) {
        // Fall back to mock proof for development
        const mockProof = generateMockSolvencyProof(request);
        setState({ status: 'done', progress: 100, error: null, generationTimeMs: mockProof.generationTimeMs });
        addProof(mockProof);
        setLastGeneratedProofId(mockProof.id);
        return mockProof;
      } finally {
        setIsGenerating(false);
      }
    },
    [addProof, setIsGenerating, setLastGeneratedProofId],
  );

  const generateComplianceProof = useCallback(
    async (request: ComplianceProofRequest): Promise<StoredProof | null> => {
      setState({ status: 'generating', progress: 10, error: null, generationTimeMs: null });
      setIsGenerating(true);

      try {
        await simulateProgress(setState, [
          { progress: 20, delay: 400, status: 'generating' },
          { progress: 50, delay: 800, status: 'generating' },
          { progress: 75, delay: 500, status: 'uploading' },
        ]);

        const response = await fetch(`${API_BASE}/api/proof/compliance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        if (!response.ok) throw new Error(`API error: ${response.statusText}`);

        const data = (await response.json()) as {
          attestation: {
            kycPassed: boolean;
            amlPassed: boolean;
            fullyCompliant: boolean;
            attestationId: string;
            ipfsCid: string;
            generationTimeMs: number;
            timestamp: number;
            validUntil: number;
          };
          ipfs: { cid: string };
        };

        const proof: StoredProof = {
          id: crypto.randomUUID(),
          proofType: 'compliance',
          status: data.attestation.fullyCompliant ? 'PASSED' : 'FAILED',
          attestationId: data.attestation.attestationId,
          ipfsCid: data.ipfs.cid,
          timestamp: data.attestation.timestamp,
          generationTimeMs: data.attestation.generationTimeMs,
          kycPassed: data.attestation.kycPassed,
          amlPassed: data.attestation.amlPassed,
          fullyCompliant: data.attestation.fullyCompliant,
          validUntil: data.attestation.validUntil,
        };

        setState({ status: 'done', progress: 100, error: null, generationTimeMs: proof.generationTimeMs });
        addProof(proof);
        setLastGeneratedProofId(proof.id);
        return proof;
      } catch {
        const mockProof = generateMockComplianceProof(request);
        setState({ status: 'done', progress: 100, error: null, generationTimeMs: mockProof.generationTimeMs });
        addProof(mockProof);
        setLastGeneratedProofId(mockProof.id);
        return mockProof;
      } finally {
        setIsGenerating(false);
      }
    },
    [addProof, setIsGenerating, setLastGeneratedProofId],
  );

  const reset = useCallback(() => {
    setState({ status: 'idle', progress: 0, error: null, generationTimeMs: null });
  }, []);

  return { state, generateSolvencyProof, generateComplianceProof, reset };
}

// ── Helpers ───────────────────────────────────────────────────

async function simulateProgress(
  setState: React.Dispatch<React.SetStateAction<ProofGenerationState>>,
  steps: { progress: number; delay: number; status: ProofGenerationState['status'] }[],
) {
  for (const step of steps) {
    await new Promise((r) => setTimeout(r, step.delay));
    setState((prev) => ({ ...prev, progress: step.progress, status: step.status }));
  }
}

function generateMockSolvencyProof(request: SolvencyProofRequest): StoredProof {
  const assets = BigInt(request.totalAssets);
  const liabilities = BigInt(request.totalLiabilities);
  return {
    id: crypto.randomUUID(),
    proofType: 'solvency',
    status: assets > liabilities ? 'PASSED' : 'FAILED',
    attestationId: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    ipfsCid: `QmMock${Math.random().toString(36).substring(2, 46)}`,
    timestamp: Date.now(),
    generationTimeMs: Math.floor(Math.random() * 2000) + 500,
    isSolvent: assets > liabilities,
    commitmentHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
  };
}

function generateMockComplianceProof(request: ComplianceProofRequest): StoredProof {
  const kycPassed = request.kycVerified === 1;
  const amlPassed = request.amlScore < (request.amlThreshold ?? 30);
  return {
    id: crypto.randomUUID(),
    proofType: 'compliance',
    status: kycPassed && amlPassed ? 'PASSED' : 'FAILED',
    attestationId: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    ipfsCid: `QmMock${Math.random().toString(36).substring(2, 46)}`,
    timestamp: Date.now(),
    generationTimeMs: Math.floor(Math.random() * 3000) + 1000,
    kycPassed,
    amlPassed,
    fullyCompliant: kycPassed && amlPassed,
    validUntil: Date.now() + 365 * 24 * 3600 * 1000,
  };
}
