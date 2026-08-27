'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock, Eye, EyeOff, Shield, AlertTriangle, ChevronDown } from 'lucide-react';
import { useWorkplaceConsentManager } from '@/hooks/useWorkplaceConsentManager';
import type { AccessConsent, ConsentScope } from '@/types/workplace';

function formatTimeLeft(expiresAt: number): { label: string; urgent: boolean } {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return { label: 'Expired', urgent: true };
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days > 0) return { label: `${days}d left`, urgent: days <= 3 };
  return { label: `${hours}h left`, urgent: true };
}

const SCOPE_COLORS: Record<ConsentScope, { bg: string; text: string }> = {
  credential_valid:     { bg: 'rgba(16,185,129,0.12)',  text: 'var(--color-success-light)' },
  credential_category:  { bg: 'rgba(99,102,241,0.12)',  text: 'var(--color-primary-light)' },
  verification_date:    { bg: 'rgba(99,102,241,0.1)',   text: 'var(--color-primary-light)' },
  field_disclosure:     { bg: 'rgba(255,159,10,0.12)',  text: 'var(--color-warning-light)' },
};

interface ConsentRowProps {
  consent: AccessConsent;
  onRevoke: (id: string) => void;
  isRevoking: string | null;
}

function ConsentRow({ consent, onRevoke, isRevoking }: ConsentRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { getScopeLabel, getModeLabel, getModeColor } = useWorkplaceConsentManager();
  const timeLeft = formatTimeLeft(consent.expiresAt);
  const revoking = isRevoking === consent.id;

  const progress = Math.max(
    0,
    Math.min(100, ((consent.expiresAt - Date.now()) / (consent.expiresAt - consent.grantedAt)) * 100)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${timeLeft.urgent ? 'rgba(255,159,10,0.25)' : 'var(--color-border)'}`,
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Main row */}
      <div style={{ padding: '1rem 1.125rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Company icon */}
        <div style={{
          width: 36, height: 36, borderRadius: '8px', flexShrink: 0,
          background: `${getModeColor(consent.disclosureMode)}18`,
          border: `1px solid ${getModeColor(consent.disclosureMode)}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={16} color={getModeColor(consent.disclosureMode)} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {consent.companyName}
            </span>
            <span style={{
              fontSize: '0.625rem', fontWeight: 700, padding: '0.125rem 0.5rem',
              background: `${getModeColor(consent.disclosureMode)}18`,
              border: `1px solid ${getModeColor(consent.disclosureMode)}30`,
              color: getModeColor(consent.disclosureMode),
              borderRadius: '999px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {getModeLabel(consent.disclosureMode)}
            </span>
          </div>

          {/* Time left + access count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <span style={{
              fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '0.25rem',
              color: timeLeft.urgent ? 'var(--color-warning-light)' : 'var(--color-text-faint)',
              fontWeight: timeLeft.urgent ? 600 : 400,
            }}>
              {timeLeft.urgent && <AlertTriangle size={9} />}
              <Clock size={9} />
              {timeLeft.label}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}>
              {consent.accessCount} access{consent.accessCount !== 1 ? 'es' : ''}
            </span>
            {consent.lastAccessedAt && (
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}>
                · last {Math.round((Date.now() - consent.lastAccessedAt) / 3600000)}h ago
              </span>
            )}
          </div>

          {/* Expiry progress bar */}
          <div style={{ height: 3, background: 'var(--color-surface-3)', borderRadius: '999px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%',
                borderRadius: '999px',
                background: progress > 50
                  ? 'var(--color-success)'
                  : progress > 20
                  ? 'var(--color-warning)'
                  : 'var(--color-danger)',
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              padding: '0.375rem',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-faint)',
              borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={13} />
            </motion.div>
          </button>
          <button
            onClick={() => onRevoke(consent.id)}
            disabled={revoking}
            style={{
              padding: '0.375rem 0.625rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: 'var(--color-danger-light)',
              borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.6875rem', fontWeight: 600,
              transition: 'all 0.15s ease',
              opacity: revoking ? 0.5 : 1,
            }}
          >
            <Trash2 size={11} />
            {revoking ? 'Revoking…' : 'Revoke'}
          </button>
        </div>
      </div>

      {/* Expanded: scope details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}
          >
            <div style={{ padding: '0.875rem 1.125rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Scope — What {consent.companyName} can see
              </div>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {consent.scope.map((s) => {
                  const sc = SCOPE_COLORS[s];
                  return (
                    <span key={s} style={{
                      fontSize: '0.75rem', fontWeight: 500,
                      padding: '0.25rem 0.625rem',
                      background: sc.bg, color: sc.text,
                      borderRadius: '999px',
                      display: 'flex', alignItems: 'center', gap: '0.25rem',
                    }}>
                      <Eye size={10} /> {getScopeLabel(s)}
                    </span>
                  );
                })}
              </div>
              <div style={{ marginTop: '0.625rem', fontSize: '0.6875rem', color: 'var(--color-text-faint)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <EyeOff size={10} />
                Raw values, credential details, exact verified metrics — mathematically hidden
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── CredentialAccessManager ───────────────────────────────────

interface CredentialAccessManagerProps {
  filterByRecordId?: string;
}

export function CredentialAccessManager({ filterByRecordId }: CredentialAccessManagerProps) {
  const { consents, revoke, getActiveConsents } = useWorkplaceConsentManager();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const activeConsents = getActiveConsents().filter(
    (c) => !filterByRecordId || c.recordId === filterByRecordId
  );

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    await new Promise((r) => setTimeout(r, 800));
    revoke(id);
    setRevokingId(null);
  };

  if (activeConsents.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '3rem 1rem',
        background: 'var(--color-surface)', borderRadius: '12px',
        border: '1px solid var(--color-border)',
      }}>
        <Shield size={32} color="var(--color-text-faint)" style={{ marginBottom: '0.75rem' }} />
        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
          No active company consents
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Grant company access to let employers verify your credentials
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <AnimatePresence>
        {activeConsents.map((consent) => (
          <ConsentRow
            key={consent.id}
            consent={consent}
            onRevoke={handleRevoke}
            isRevoking={revokingId}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
