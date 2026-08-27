'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Zap, Lock, Clock } from 'lucide-react';
import type { StoredProof } from '@/context/PrivacyContext';

const PROOF_TYPE_LABELS: Record<string, string> = {
  'solvency':             'Solvency',
  'compliance':           'KYC/AML',
  'credential-validity':  'Credential Validity',
  'disclosure-proof':     'Disclosure Proof',
};

const PROOF_TYPE_COLORS: Record<string, string> = {
  'solvency':            '#6366f1',
  'compliance':          '#10b981',
  'credential-validity': '#06b6d4',
  'disclosure-proof':    '#f59e0b',
};

interface VerificationBadgeProps {
  proof: StoredProof;
  compact?: boolean;
  showCid?: boolean;
  showTime?: boolean;
  index?: number;
}

export function VerificationBadge({ proof, compact = false, showCid = true, showTime = true, index = 0 }: VerificationBadgeProps) {
  const color = PROOF_TYPE_COLORS[proof.proofType] ?? '#6366f1';
  const typeLabel = PROOF_TYPE_LABELS[proof.proofType] ?? proof.proofType;
  const isPassed = proof.status === 'PASSED';

  const StatusIcon = isPassed ? CheckCircle2 : proof.status === 'PENDING' ? Clock : XCircle;
  const statusColor = isPassed
    ? 'var(--color-success-light)'
    : proof.status === 'PENDING'
    ? 'var(--color-warning-light)'
    : 'var(--color-danger-light)';

  const timeAgo = (() => {
    const diff = Date.now() - proof.timestamp;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  })();

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.25rem 0.625rem',
          background: isPassed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${isPassed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: '999px',
          fontSize: '0.75rem', fontWeight: 600, color: statusColor,
        }}
      >
        <StatusIcon size={11} />
        {typeLabel} — {proof.status}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      style={{
        background: 'var(--color-surface)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        padding: '1rem 1.125rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: color, borderRadius: '3px 0 0 3px',
      }} />

      <div style={{ paddingLeft: '0.5rem' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <StatusIcon size={15} color={statusColor} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: statusColor }}>
              {proof.status}
            </span>
          </div>

          {/* Type pill */}
          <span style={{
            fontSize: '0.6875rem', fontWeight: 600, padding: '0.125rem 0.5rem',
            background: `${color}18`, border: `1px solid ${color}30`, color,
            borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {typeLabel}
          </span>

          {/* Credential Name */}
          {proof.credentialName && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {proof.credentialName}
            </span>
          )}

          {showTime && (
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginLeft: 'auto' }}>
              {timeAgo}
            </span>
          )}
        </div>

        {/* Workplace details */}
        {(proof.isValidCredential !== undefined || proof.consentScope) && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            {proof.isValidCredential !== undefined && (
              <span style={{
                fontSize: '0.6875rem', fontWeight: 600,
                color: proof.isValidCredential ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                background: proof.isValidCredential ? 'rgba(16,185,129,0.08)' : 'rgba(255,159,10,0.08)',
                border: `1px solid ${proof.isValidCredential ? 'rgba(16,185,129,0.25)' : 'rgba(255,159,10,0.25)'}`,
                borderRadius: '999px', padding: '0.125rem 0.5rem',
              }}>
                {proof.isValidCredential ? '✓ Credential Verified' : '⚠ Invalid / Expired'}
              </span>
            )}
            {proof.consentScope?.map((s) => (
              <span key={s} style={{
                fontSize: '0.6875rem', color: 'var(--color-text-faint)',
                background: 'var(--color-surface-2)',
                borderRadius: '999px', padding: '0.125rem 0.5rem',
              }}>
                {s.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Bottom: attestation + IPFS */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {showCid && proof.ipfsCid && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Lock size={10} color="var(--color-text-faint)" />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                color: 'var(--color-cyan)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '18ch',
              }}>
                {proof.ipfsCid}
              </span>
            </div>
          )}
          {proof.generationTimeMs && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Zap size={10} color="var(--color-text-faint)" />
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}>
                {proof.generationTimeMs}ms
              </span>
            </div>
          )}
          {proof.expiresAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={10} color="var(--color-text-faint)" />
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}>
                expires {new Date(proof.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
