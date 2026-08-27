'use client';

import { motion } from 'framer-motion';
import {
  Lock, User, ShieldCheck, Globe, GraduationCap, Briefcase, Banknote,
  Building2, Shield, ChevronRight,
} from 'lucide-react';
import type { CredentialRecord, CredentialCategory } from '@/types/workplace';

const CATEGORY_CONFIG: Record<CredentialCategory, {
  icon: any;
  color: string;
  label: string;
}> = {
  'identity':          { icon: User,           color: '#3b82f6', label: 'Identity' },
  'background-check':  { icon: ShieldCheck,    color: '#8b5cf6', label: 'Background Check' },
  'work-auth':         { icon: Globe,           color: '#f97316', label: 'Work Authorization' },
  'education':         { icon: GraduationCap,   color: '#06b6d4', label: 'Education' },
  'experience':        { icon: Briefcase,       color: '#a855f7', label: 'Employment History' },
  'financial':         { icon: Banknote,        color: '#10b981', label: 'Income Verification' },
};

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.3)',  text: 'var(--color-primary-light)' },
  encrypted: { label: 'Encrypted', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: 'var(--color-success-light)' },
  verified:  { label: 'ZK Attested', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', text: 'var(--color-success-light)' },
  expired:   { label: 'Expired',   bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  text: 'var(--color-danger-light)' },
};

interface CredentialCardProps {
  record: CredentialRecord;
  index?: number;
  onGenerateProof?: (id: string) => void;
  onManageConsent?: (id: string) => void;
}

export function CredentialCard({ record, index = 0, onGenerateProof, onManageConsent }: CredentialCardProps) {
  const cat = CATEGORY_CONFIG[record.category];
  const CategoryIcon = cat.icon;
  const status = STATUS_CONFIG[record.status];

  const verifiedDate = new Date(record.verifiedDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const daysAgo = Math.floor((Date.now() - record.verifiedDate) / 86400000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      style={{
        background: 'var(--color-surface)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        padding: '1.125rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.2s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ borderColor: `${cat.color}40`, backgroundColor: `${cat.color}04` }}
    >
      {/* Category icon */}
      <div style={{
        width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
        background: `${cat.color}18`, border: `1px solid ${cat.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CategoryIcon size={20} color={cat.color} strokeWidth={2} />
      </div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {record.name}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* Status badge */}
          <span style={{
            fontSize: '0.6875rem', fontWeight: 600,
            background: status.bg, border: `1px solid ${status.border}`,
            color: status.text, borderRadius: '999px', padding: '0.125rem 0.5rem',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
          }}>
            {record.status === 'encrypted' || record.status === 'verified'
              ? <Lock size={9} />
              : null}
            {status.label}
          </span>

          {/* Authority pill */}
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Building2 size={9} />
            {record.verifierName}
          </span>

          {/* Date */}
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}>
            {verifiedDate} · {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}
          </span>
        </div>
      </div>

      {/* Right: consent count + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {record.consentCount > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.1 }}>
              {record.consentCount}
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--color-text-faint)', fontWeight: 500 }}>
              {record.consentCount === 1 ? 'company' : 'companies'}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {record.status !== 'pending' && onGenerateProof && (
            <button
              onClick={() => onGenerateProof(record.id)}
              style={{
                padding: '0.375rem 0.75rem',
                background: 'rgba(10,132,255,0.12)',
                border: '1px solid rgba(10,132,255,0.3)',
                color: 'var(--color-primary-light)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Shield size={11} />
              Generate Proof
            </button>
          )}
          {onManageConsent && (
            <button
              onClick={() => onManageConsent(record.id)}
              style={{
                padding: '0.375rem',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-faint)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
