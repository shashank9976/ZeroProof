'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import type { DisclosureMode } from '@/types/workplace';

interface DisclosureToggleProps {
  mode: DisclosureMode;
  onChange: (mode: DisclosureMode) => void;
  disabled?: boolean;
}

const MODES: { value: DisclosureMode; label: string; description: string; color: string }[] = [
  {
    value: 'proof-only',
    label: 'Proof Only',
    description: 'Boolean result — credential valid or not. No other info.',
    color: '#6366f1',
  },
  {
    value: 'full-disclosure',
    label: 'Full Disclosure',
    description: 'Enables revealing specific field attestations without raw details.',
    color: '#f59e0b',
  },
];

export function DisclosureToggle({ mode, onChange, disabled = false }: DisclosureToggleProps) {
  const current = (MODES.find((m) => m.value === mode) ?? MODES[0])!;

  return (
    <div>
      <div style={{
        display: 'flex',
        background: 'var(--color-surface-2)',
        borderRadius: '10px',
        padding: '3px',
        gap: '2px',
      }}>
        {MODES.map((m) => {
          const isActive = mode === m.value;
          return (
            <button
              key={m.value}
              onClick={() => !disabled && onChange(m.value)}
              disabled={disabled}
              style={{
                flex: 1, padding: '0.5rem 0.375rem',
                borderRadius: '8px',
                border: isActive ? `1px solid ${m.color}40` : '1px solid transparent',
                background: isActive ? `${m.color}14` : 'transparent',
                color: isActive ? m.color : 'var(--color-text-faint)',
                fontSize: '0.75rem', fontWeight: isActive ? 700 : 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
              }}
            >
              {m.value === 'proof-only' && <Lock size={11} />}
              {m.value === 'full-disclosure' && <Eye size={11} />}
              {m.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          style={{
            marginTop: '0.625rem',
            padding: '0.625rem 0.875rem',
            background: `${current.color}08`,
            border: `1px solid ${current.color}25`,
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: current.color, flexShrink: 0 }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <strong style={{ color: current.color }}>{current.label}: </strong>
            {current.description}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── DisclosureScope visual panel ──────────────────────────────

interface DisclosureScopeProps {
  mode: DisclosureMode;
  credentialName?: string;
}

const SCOPE_DATA: Record<DisclosureMode, {
  visible: string[];
  hidden: string[];
}> = {
  'proof-only': {
    visible: ['Credential verified ✓', 'Consent verified ✓', 'ZK Proof valid ✓'],
    hidden:  ['Exact records', 'Personal details', 'Verification date', 'Employee identity', 'Verifier name', 'Raw documents'],
  },
  'full-disclosure': {
    visible: ['Credential verified ✓', 'Consent verified ✓', 'Verifier name ✓', 'Credential category'],
    hidden:  ['Exact records', 'Employee identity', 'Raw documents'],
  },
};

const MODE_COLORS: Record<DisclosureMode, string> = {
  'proof-only':      '#6366f1',
  'full-disclosure': '#f59e0b',
};

export function DisclosureScope({ mode }: DisclosureScopeProps) {
  const data = SCOPE_DATA[mode] || SCOPE_DATA['proof-only'];
  const color = MODE_COLORS[mode] || MODE_COLORS['proof-only'];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
        }}
      >
        {/* Visible */}
        <div style={{
          padding: '0.875rem',
          background: 'rgba(16,185,129,0.05)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '10px',
        }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-success-light)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Eye size={10} /> Visible to verifier
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {data.visible.map((item) => (
              <div key={item} style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                <span style={{ color: 'var(--color-success-light)', marginTop: '0.0625rem', flexShrink: 0 }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Hidden */}
        <div style={{
          padding: '0.875rem',
          background: 'rgba(99,102,241,0.04)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: '10px',
        }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-faint)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <EyeOff size={10} /> ZK-hidden from verifier
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {data.hidden.map((item) => (
              <div key={item} style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', display: 'flex', alignItems: 'flex-start', gap: '0.375rem', textDecoration: 'line-through', textDecorationColor: 'rgba(99,102,241,0.4)' }}>
                <Lock size={9} style={{ marginTop: '0.125rem', flexShrink: 0, color: 'var(--color-text-faint)' }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
