'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  CredentialRecord, AccessConsent, ConsentScope, DisclosureMode, WorkplaceAuditEvent,
} from '@/types/workplace';

// ── Mock Credential Records ────────────────────────────────────

const MOCK_CREDENTIAL_RECORDS: CredentialRecord[] = [
  {
    id: 'cred-001',
    category: 'work-auth',
    name: 'US I-9 Work Authorization',
    encryptedAt: Date.now() - 86400000 * 3,
    verifiedDate: Date.now() - 86400000 * 4,
    status: 'verified',
    ipfsCid: 'QmWorkAuth9xA7kPbHJDKs9Wq8n2TzYf6vLmRcEiUpQ4dX',
    consentCount: 2,
    isValid: true,
    verifierName: 'US CIS E-Verify Service',
  },
  {
    id: 'cred-002',
    category: 'background-check',
    name: 'Criminal & Background History',
    encryptedAt: Date.now() - 86400000 * 7,
    verifiedDate: Date.now() - 86400000 * 8,
    status: 'verified',
    ipfsCid: 'QmBgCheck7bK2pQnXmFsY4Rz1Av9WdHcEoLjNgUiTp8sV',
    consentCount: 1,
    isValid: true, // true means clear background
    verifierName: 'Checkr Screening Services',
  },
  {
    id: 'cred-003',
    category: 'education',
    name: 'B.S. in Computer Science (Stanford)',
    encryptedAt: Date.now() - 86400000 * 14,
    verifiedDate: Date.now() - 86400000 * 15,
    status: 'verified',
    ipfsCid: 'QmDegree1cJ5rSmYnGpZ8Bx3Ct7WeIaKkMhOjTqNu2lW',
    consentCount: 3,
    isValid: true,
    verifierName: 'Stanford Registrar Office',
  },
  {
    id: 'cred-004',
    category: 'identity',
    name: 'Verified Driver License',
    encryptedAt: Date.now() - 86400000 * 2,
    verifiedDate: Date.now() - 86400000 * 2,
    status: 'encrypted',
    consentCount: 0,
    isValid: true,
    verifierName: 'California DMV',
  },
  {
    id: 'cred-005',
    category: 'experience',
    name: 'Software Engineer Reference (Pied Piper)',
    encryptedAt: Date.now() - 86400000 * 30,
    verifiedDate: Date.now() - 86400000 * 31,
    status: 'verified',
    ipfsCid: 'QmExperience9dM4tUnYoHqA5Cy6Df8VfJbLlNiPkSrMv3nX',
    consentCount: 1,
    isValid: true,
    verifierName: 'Pied Piper HR Dept',
  },
  {
    id: 'cred-006',
    category: 'financial',
    name: 'Salary & Income Verification (W2)',
    encryptedAt: Date.now() - 86400000 * 1,
    verifiedDate: Date.now() - 86400000 * 1,
    status: 'pending',
    consentCount: 0,
    verifierName: 'ADP Payroll Services',
  },
];

// ── Mock Consents ─────────────────────────────────────────────

const MOCK_CONSENTS: AccessConsent[] = [
  {
    id: 'consent-001',
    recordId: 'cred-001',
    companyId: 'comp-acme',
    companyName: 'Acme Corporation',
    grantedAt: Date.now() - 86400000 * 2,
    expiresAt: Date.now() + 86400000 * 28,
    scope: ['credential_valid', 'credential_category', 'verification_date'],
    disclosureMode: 'full-disclosure',
    isActive: true,
    lastAccessedAt: Date.now() - 3600000 * 5,
    accessCount: 3,
  },
  {
    id: 'consent-002',
    recordId: 'cred-001',
    companyId: 'comp-initech',
    companyName: 'Initech Systems',
    grantedAt: Date.now() - 86400000 * 5,
    expiresAt: Date.now() + 86400000 * 55,
    scope: ['credential_valid', 'credential_category'],
    disclosureMode: 'proof-only',
    isActive: true,
    lastAccessedAt: Date.now() - 86400000,
    accessCount: 1,
  },
  {
    id: 'consent-003',
    recordId: 'cred-002',
    companyId: 'comp-hooli',
    companyName: 'Hooli Inc.',
    grantedAt: Date.now() - 86400000 * 6,
    expiresAt: Date.now() + 86400000 * 14,
    scope: ['credential_valid', 'credential_category', 'field_disclosure', 'verification_date'],
    disclosureMode: 'full-disclosure',
    isActive: true,
    lastAccessedAt: Date.now() - 3600000 * 2,
    accessCount: 7,
  },
  {
    id: 'consent-004',
    recordId: 'cred-003',
    companyId: 'comp-pied',
    companyName: 'Pied Piper',
    grantedAt: Date.now() - 86400000 * 13,
    expiresAt: Date.now() + 86400000 * 17,
    scope: ['credential_valid', 'credential_category', 'verification_date'],
    disclosureMode: 'proof-only',
    isActive: true,
    accessCount: 2,
  },
];

// ── Context Shape ─────────────────────────────────────────────

interface WorkplaceContextValue {
  credentialRecords: CredentialRecord[];
  consents: AccessConsent[];
  auditEvents: WorkplaceAuditEvent[];

  addCredentialRecord: (record: CredentialRecord) => void;
  updateRecordStatus: (id: string, status: CredentialRecord['status']) => void;
  grantConsent: (consent: AccessConsent) => void;
  revokeConsent: (consentId: string) => void;
  addAuditEvent: (event: WorkplaceAuditEvent) => void;

  // Derived
  getRecordConsents: (recordId: string) => AccessConsent[];
  getActiveConsents: () => AccessConsent[];
}

const WorkplaceContext = createContext<WorkplaceContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────

export function WorkplaceProvider({ children }: { children: React.ReactNode }) {
  const [credentialRecords, setCredentialRecords] = useState<CredentialRecord[]>(MOCK_CREDENTIAL_RECORDS);
  const [consents, setConsents] = useState<AccessConsent[]>(MOCK_CONSENTS);
  const [auditEvents, setAuditEvents] = useState<WorkplaceAuditEvent[]>([]);

  const addCredentialRecord = useCallback((record: CredentialRecord) => {
    setCredentialRecords((prev) => [record, ...prev]);
  }, []);

  const updateRecordStatus = useCallback((id: string, status: CredentialRecord['status']) => {
    setCredentialRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }, []);

  const grantConsent = useCallback((consent: AccessConsent) => {
    setConsents((prev) => [consent, ...prev]);
    setCredentialRecords((prev) =>
      prev.map((r) =>
        r.id === consent.recordId
          ? { ...r, consentCount: r.consentCount + 1 }
          : r
      )
    );
  }, []);

  const revokeConsent = useCallback((consentId: string) => {
    setConsents((prev) =>
      prev.map((c) => {
        if (c.id !== consentId) return c;
        setCredentialRecords((records) =>
          records.map((r) =>
            r.id === c.recordId
              ? { ...r, consentCount: Math.max(0, r.consentCount - 1) }
              : r
          )
        );
        return { ...c, isActive: false };
      })
    );
  }, []);

  const addAuditEvent = useCallback((event: WorkplaceAuditEvent) => {
    setAuditEvents((prev) => [event, ...prev]);
  }, []);

  const getRecordConsents = useCallback(
    (recordId: string) => consents.filter((c) => c.recordId === recordId && c.isActive),
    [consents]
  );

  const getActiveConsents = useCallback(
    () => consents.filter((c) => c.isActive && c.expiresAt > Date.now()),
    [consents]
  );

  return (
    <WorkplaceContext.Provider
      value={{
        credentialRecords,
        consents,
        auditEvents,
        addCredentialRecord,
        updateRecordStatus,
        grantConsent,
        revokeConsent,
        addAuditEvent,
        getRecordConsents,
        getActiveConsents,
      }}
    >
      {children}
    </WorkplaceContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────

export function useWorkplace(): WorkplaceContextValue {
  const ctx = useContext(WorkplaceContext);
  if (!ctx) throw new Error('useWorkplace must be used inside WorkplaceProvider');
  return ctx;
}
