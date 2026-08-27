'use client';

import { useCallback } from 'react';
import { useWorkplace } from '@/context/WorkplaceContext';
import type { AccessConsent, ConsentScope, DisclosureMode } from '@/types/workplace';

export interface GrantConsentParams {
  recordId: string;
  companyId: string;
  companyName: string;
  scope: ConsentScope[];
  disclosureMode: DisclosureMode;
  durationDays: number;
}

export function useWorkplaceConsentManager() {
  const { consents, grantConsent, revokeConsent, getRecordConsents, getActiveConsents } = useWorkplace();

  const grant = useCallback(
    (params: GrantConsentParams) => {
      const consent: AccessConsent = {
        id: `consent-${crypto.randomUUID()}`,
        recordId: params.recordId,
        companyId: params.companyId,
        companyName: params.companyName,
        grantedAt: Date.now(),
        expiresAt: Date.now() + params.durationDays * 86400000,
        scope: params.scope,
        disclosureMode: params.disclosureMode,
        isActive: true,
        accessCount: 0,
      };
      grantConsent(consent);
      return consent;
    },
    [grantConsent]
  );

  const revoke = useCallback(
    (consentId: string) => {
      revokeConsent(consentId);
    },
    [revokeConsent]
  );

  const getExpiringConsents = useCallback(
    (withinMs: number = 86400000 * 3) => {
      const now = Date.now();
      return consents.filter(
        (c) => c.isActive && c.expiresAt > now && c.expiresAt - now <= withinMs
      );
    },
    [consents]
  );

  const getConsentsByCompany = useCallback(
    (companyId: string) => {
      return consents.filter((c) => c.companyId === companyId && c.isActive);
    },
    [consents]
  );

  const getScopeLabel = (scope: ConsentScope): string => {
    const labels: Record<ConsentScope, string> = {
      credential_valid: 'Credential Validity',
      credential_category: 'Category Only',
      verification_date: 'Verification Date',
      field_disclosure: 'Disclosure Matches',
    };
    return labels[scope] ?? scope;
  };

  const getModeLabel = (mode: DisclosureMode): string => {
    const labels: Record<DisclosureMode, string> = {
      'proof-only': 'Proof Only',
      'full-disclosure': 'Full Disclosure',
    };
    return labels[mode] ?? mode;
  };

  const getModeColor = (mode: DisclosureMode): string => {
    const colors: Record<DisclosureMode, string> = {
      'proof-only': 'var(--color-primary)',
      'full-disclosure': 'var(--color-warning)',
    };
    return colors[mode] ?? 'var(--color-text-muted)';
  };

  return {
    consents,
    grant,
    revoke,
    getRecordConsents,
    getActiveConsents,
    getExpiringConsents,
    getConsentsByCompany,
    getScopeLabel,
    getModeLabel,
    getModeColor,
  };
}
