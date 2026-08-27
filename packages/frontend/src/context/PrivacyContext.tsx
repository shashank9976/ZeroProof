'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────

export interface StoredProof {
  id: string;
  proofType: 'solvency' | 'compliance' | 'lab-validity' | 'range-proof' | 'emergency-triage' | 'credential-validity' | 'disclosure-proof';
  status: 'PASSED' | 'FAILED' | 'PENDING';
  attestationId: string;
  ipfsCid: string;
  timestamp: number;
  generationTimeMs: number;
  // Solvency specific
  isSolvent?: boolean;
  commitmentHash?: string;
  // Compliance specific
  kycPassed?: boolean;
  amlPassed?: boolean;
  fullyCompliant?: boolean;
  validUntil?: number;
  // Healthcare specific (retained for backward compatibility or refactoring)
  testType?: string;
  testName?: string;
  resultInRange?: boolean;
  expiresAt?: number;
  emergencyFlag?: boolean;
  hospitalId?: string;
  thresholdBreached?: boolean;
  // Workplace specific
  category?: string;
  credentialName?: string;
  isValidCredential?: boolean;
  consentScope?: string[];
  companyId?: string;
  fieldMatches?: boolean;
}

export type DisclosureLevel = 'auditor' | 'regulator' | 'internal';

interface PrivacyContextValue {
  // Proof store
  proofs: StoredProof[];
  addProof: (proof: StoredProof) => void;
  clearProofs: () => void;

  // Disclosure settings
  disclosureLevel: DisclosureLevel;
  setDisclosureLevel: (level: DisclosureLevel) => void;

  // Privacy toggles
  showIpfsCid: boolean;
  showTimestamps: boolean;
  showGenerationTime: boolean;
  toggleShowIpfsCid: () => void;
  toggleShowTimestamps: () => void;
  toggleShowGenerationTime: () => void;

  // Proof generation state
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  lastGeneratedProofId: string | null;
  setLastGeneratedProofId: (id: string | null) => void;
}

// ── Context ───────────────────────────────────────────────────

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

// ── Mock Initial Proofs (for UI demo) ─────────────────────────

const MOCK_PROOFS: StoredProof[] = [
  {
    id: 'proof-001',
    proofType: 'solvency',
    status: 'PASSED',
    attestationId: 'a1b2c3d4e5f6789012345678901234567890abcd',
    ipfsCid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    timestamp: Date.now() - 3600000 * 2,
    generationTimeMs: 1847,
    isSolvent: true,
    commitmentHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
  },
  {
    id: 'proof-002',
    proofType: 'compliance',
    status: 'PASSED',
    attestationId: 'b2c3d4e5f6789012345678901234567890abcde',
    ipfsCid: 'QmT4AewhW7LsKnqVZBi7VoaENkJMNePYF8jwFnqrMK3GGQ',
    timestamp: Date.now() - 3600000 * 24,
    generationTimeMs: 3214,
    kycPassed: true,
    amlPassed: true,
    fullyCompliant: true,
    validUntil: Date.now() + 3600000 * 24 * 365,
  },
  {
    id: 'proof-003',
    proofType: 'solvency',
    status: 'PASSED',
    attestationId: 'c3d4e5f6789012345678901234567890abcdef',
    ipfsCid: 'QmRKs2ZfuwvmZA3QAWmCqrGUjV9d5eDNtez3JMAPN3hsZc',
    timestamp: Date.now() - 3600000 * 48,
    generationTimeMs: 1923,
    isSolvent: true,
    commitmentHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
  },
];

// ── Provider ──────────────────────────────────────────────────

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [proofs, setProofs] = useState<StoredProof[]>(MOCK_PROOFS);
  const [disclosureLevel, setDisclosureLevel] = useState<DisclosureLevel>('auditor');
  const [showIpfsCid, setShowIpfsCid] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showGenerationTime, setShowGenerationTime] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedProofId, setLastGeneratedProofId] = useState<string | null>(null);

  const addProof = useCallback((proof: StoredProof) => {
    setProofs((prev) => [proof, ...prev]);
  }, []);

  const clearProofs = useCallback(() => {
    setProofs([]);
  }, []);

  return (
    <PrivacyContext.Provider
      value={{
        proofs,
        addProof,
        clearProofs,
        disclosureLevel,
        setDisclosureLevel,
        showIpfsCid,
        showTimestamps,
        showGenerationTime,
        toggleShowIpfsCid: () => setShowIpfsCid((v) => !v),
        toggleShowTimestamps: () => setShowTimestamps((v) => !v),
        toggleShowGenerationTime: () => setShowGenerationTime((v) => !v),
        isGenerating,
        setIsGenerating,
        lastGeneratedProofId,
        setLastGeneratedProofId,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────

export function usePrivacy(): PrivacyContextValue {
  const ctx = useContext(PrivacyContext);
  if (!ctx) throw new Error('usePrivacy must be used inside PrivacyProvider');
  return ctx;
}
