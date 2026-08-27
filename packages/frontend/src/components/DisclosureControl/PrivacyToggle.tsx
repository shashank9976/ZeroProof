'use client';

import { motion } from 'framer-motion';
import { Eye, Shield, Globe } from 'lucide-react';
import { usePrivacy } from '@/context/PrivacyContext';

// Inlined from @zeroproof/privacy-sdk disclosure-rules
const DisclosureRules = {
  FINANCE: {
    can_disclose: ['compliance_status', 'attestation_valid', 'ipfs_cid', 'proof_timestamp', 'proof_type', 'generation_time_ms', 'commitment_hash'],
    must_prove: ['solvency_verified', 'kyc_completed', 'aml_cleared', 'sanctions_checked', 'entity_authenticated'],
    must_hide: ['account_balances', 'transaction_details', 'counterparty_identities', 'aml_score', 'entity_id', 'asset_amounts', 'liability_amounts', 'salt', 'private_keys'],
  },
} as const;


interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  color?: string;
}

function ToggleRow({ label, description, checked, onToggle, color = '#6366f1' }: ToggleRowProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.875rem 1rem',
      background: 'var(--color-surface)',
      borderRadius: '0.625rem',
      border: `1px solid ${checked ? `rgba(${color === '#10b981' ? '16,185,129' : '99,102,241'}, 0.2)` : 'var(--color-border)'}`,
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{label}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: checked ? `var(--gradient-primary)` : 'var(--color-surface-3)',
          position: 'relative', transition: 'all 0.25s ease', flexShrink: 0,
          boxShadow: checked ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  );
}

function FieldList({ title, fields, variant }: {
  title: string;
  fields: readonly string[];
  variant: 'success' | 'warning' | 'danger';
}) {
  const colors = {
    success: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)', text: '#10b981', label: '#34d399' },
    warning: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)', text: '#f59e0b', label: '#fbbf24' },
    danger: { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)', text: '#ef4444', label: '#f87171' },
  }[variant];

  return (
    <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '0.75rem', padding: '0.875rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.label, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
        {fields.map((f) => (
          <span key={f} style={{
            fontSize: '0.6875rem', fontFamily: 'var(--font-mono)',
            padding: '0.2rem 0.5rem', borderRadius: '0.25rem',
            background: 'rgba(0,0,0,0.2)', color: colors.text,
            border: `1px solid ${colors.border}`,
          }}>
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PrivacyToggle() {
  const {
    showIpfsCid, showTimestamps, showGenerationTime,
    toggleShowIpfsCid, toggleShowTimestamps, toggleShowGenerationTime,
    disclosureLevel, setDisclosureLevel,
  } = usePrivacy();

  const rules = DisclosureRules.FINANCE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Disclosure Level Selector */}
      <div className="card-proof" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={16} color="var(--color-primary-light)" />
          Disclosure Level
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['auditor', 'regulator', 'internal'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setDisclosureLevel(level)}
              className={`btn btn-sm ${disclosureLevel === level ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, textTransform: 'capitalize' }}
            >
              {level}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
          {disclosureLevel === 'auditor' && '🔍 Auditors see: compliance status + IPFS CIDs only'}
          {disclosureLevel === 'regulator' && '⚖️ Regulators see: compliance verdicts + timestamps'}
          {disclosureLevel === 'internal' && '🏢 Internal: all public proof metadata visible'}
        </div>
      </div>

      {/* Field Disclosure Toggles */}
      <div className="card-proof" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye size={16} color="var(--color-primary-light)" />
          Optional Disclosures
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <ToggleRow
            label="IPFS Proof CID"
            description="Show immutable proof receipt URL"
            checked={showIpfsCid}
            onToggle={toggleShowIpfsCid}
          />
          <ToggleRow
            label="Proof Timestamps"
            description="When each proof was generated"
            checked={showTimestamps}
            onToggle={toggleShowTimestamps}
          />
          <ToggleRow
            label="Generation Time"
            description="ZK proof computation speed (transparency)"
            checked={showGenerationTime}
            onToggle={toggleShowGenerationTime}
          />
        </div>
      </div>

      {/* Disclosure Rule Summary */}
      <div className="card-proof">
        <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={16} color="var(--color-success)" />
          Active Disclosure Rules <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-faint)' }}>· FINANCE profile</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <FieldList title="✅ Can Disclose to Auditors" fields={rules.can_disclose} variant="success" />
          <FieldList title="🔏 Must Prove (Zero-Knowledge)" fields={rules.must_prove} variant="warning" />
          <FieldList title="🚫 Must Never Disclose" fields={rules.must_hide} variant="danger" />
        </div>
      </div>
    </motion.div>
  );
}
