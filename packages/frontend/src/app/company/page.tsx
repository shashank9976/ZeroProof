'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Search, Shield, CheckCircle2,
  Clock, Lock, Zap, AlertTriangle, Eye,
} from 'lucide-react';
import { useWorkplaceConsentManager } from '@/hooks/useWorkplaceConsentManager';
import { DisclosureToggle, DisclosureScope } from '@/components/Workplace/DisclosureToggle';
import type { DisclosureMode } from '@/types/workplace';

// ── Mock proof verification result ────────────────────────────

interface VerificationResult {
  proofId: string;
  name: string;
  category: string;
  resultValid: boolean;
  consentVerified: boolean;
  companyAuthorized: boolean;
  verifiedAt: number;
  ipfsCid: string;
  generationMs: number;
}

function generateMockVerification(proofId: string, mode: DisclosureMode): VerificationResult {
  return {
    proofId,
    name: 'B.S. in Computer Science (Stanford)',
    category: 'education',
    resultValid: true,
    consentVerified: true,
    companyAuthorized: true,
    verifiedAt: Date.now(),
    ipfsCid: `QmVerified${proofId.substring(0, 20)}`,
    generationMs: Math.floor(Math.random() * 400) + 120,
  };
}

// ── Verifier Panel ────────────────────────────────────────────

function CredentialVerifier() {
  const [proofId, setProofId] = useState('');
  const [disclosureMode, setDisclosureMode] = useState<DisclosureMode>('proof-only');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!proofId.trim()) { setError('Please enter a proof ID or attestation hash'); return; }
    setError('');
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1400));
    setVerifying(false);
    setResult(generateMockVerification(proofId, disclosureMode));
  };

  return (
    <div className="card" style={{ marginBottom: '1.25rem' }}>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
        Verify Employee Proof
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
        Enter a proof ID or attestation hash provided by the employee
      </div>

      <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem' }}>
        <input
          className="input"
          placeholder="Proof ID or attestation hash…"
          value={proofId}
          onChange={(e) => { setProofId(e.target.value); setError(''); setResult(null); }}
          style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
        />
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="btn btn-primary"
          style={{ flexShrink: 0, gap: '0.375rem' }}
        >
          {verifying
            ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Search size={15} /></motion.div> Verifying…</>
            : <><Search size={15} /> Verify</>}
        </button>
      </div>

      {/* Disclosure mode toggle */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.625rem' }}>
          Disclosure Mode
        </div>
        <DisclosureToggle mode={disclosureMode} onChange={setDisclosureMode} disabled={verifying} />
      </div>

      {/* Disclosure scope visual */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.625rem' }}>
          What you will see
        </div>
        <DisclosureScope mode={disclosureMode} />
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--color-danger-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '1.125rem',
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
              <CheckCircle2 size={18} color="var(--color-success-light)" />
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-success-light)' }}>
                Proof Verified On-Chain
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: 'var(--color-text-faint)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Zap size={10} /> {result.generationMs}ms
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Attestation Verified', value: '✓ Yes', show: true },
                { label: 'Consent Verified', value: '✓ Authorized', show: true },
                { label: 'Company Authorized', value: '✓ Yes', show: true },
                { label: 'Result Valid', value: result.resultValid ? '✓ PASSED' : '✗ FAILED', show: true },
                { label: 'Credential Name', value: result.name, show: disclosureMode === 'full-disclosure' },
              ]
                .filter((row) => row.show)
                .map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                    <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
            </div>

            <div style={{ marginTop: '0.875rem', padding: '0.5rem 0.75rem', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--color-cyan)', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                IPFS Receipt
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-cyan)' }}>
                {result.ipfsCid}
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', fontSize: '0.6875rem', color: 'var(--color-text-faint)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Lock size={9} /> Raw details, employee identity, and documents — not disclosed
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Access History ────────────────────────────────────────────

const MOCK_ACCESS_LOG = [
  { id: 'log-1', employee: 'Employee #8821', scope: 'credential_valid', at: Date.now() - 3600000, status: 'verified' },
  { id: 'log-2', employee: 'Employee #4459', scope: 'credential_category', at: Date.now() - 7200000, status: 'verified' },
  { id: 'log-3', employee: 'Employee #2217', scope: 'field_disclosure', at: Date.now() - 86400000, status: 'pending' },
  { id: 'log-4', employee: 'Employee #9983', scope: 'credential_valid', at: Date.now() - 86400000 * 2, status: 'verified' },
];

function AccessHistory() {
  return (
    <div className="card">
      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
        Access History
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
        Anonymized audit log — no personal details stored
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {MOCK_ACCESS_LOG.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              background: 'var(--color-surface-2)', borderRadius: '8px',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '6px', flexShrink: 0,
              background: log.status === 'verified' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {log.status === 'verified'
                ? <CheckCircle2 size={14} color="var(--color-success-light)" />
                : <Clock size={14} color="var(--color-warning-light)" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text)' }}>{log.employee}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}>
                Scope: {log.scope.replace('_', ' ')}
              </div>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', flexShrink: 0 }}>
              {Math.round((Date.now() - log.at) / 3600000)}h ago
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Consent Snapshot ──────────────────────────────────────────

function ConsentSnapshot() {
  const { getActiveConsents, getScopeLabel } = useWorkplaceConsentManager();
  const active = getActiveConsents().slice(0, 3);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.125rem' }}>Active Consents</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Employee-granted verification permissions</div>
        </div>
        <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text)' }}>{active.length}</span>
      </div>

      {active.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--color-text-faint)', fontSize: '0.875rem' }}>
          No consents granted to your organization
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {active.map((c) => (
            <div key={c.id} style={{
              padding: '0.75rem', background: 'var(--color-surface-2)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <Eye size={14} color="var(--color-primary-light)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.companyName}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}>
                  {c.scope.slice(0, 2).map(getScopeLabel).join(' · ')}
                </div>
              </div>
              <div style={{ fontSize: '0.6875rem', color: c.expiresAt - Date.now() < 86400000 * 3 ? 'var(--color-warning-light)' : 'var(--color-text-faint)', flexShrink: 0 }}>
                {Math.ceil((c.expiresAt - Date.now()) / 86400000)}d left
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function CompanyPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={22} color="var(--color-primary-light)" strokeWidth={2} />
          </div>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.75rem', marginBottom: 0 }}>
              Company <span style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Portal</span>
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
              Verify employee proofs · Minimal disclosure, cryptographically guaranteed
            </p>
          </div>
        </div>

        {/* Privacy banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.875rem',
          padding: '0.875rem 1.25rem',
          background: 'rgba(10,132,255,0.05)',
          border: '1px solid rgba(10,132,255,0.15)',
          borderRadius: '10px', flexWrap: 'wrap',
        }}>
          <Lock size={15} color="var(--color-primary-light)" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', flex: 1 }}>
            <strong style={{ color: 'var(--color-primary-light)' }}>Secure ZK credential verification:</strong>{' '}
            You see only what the employee consented to disclose. Raw values, personal identifiers, and documents are mathematically hidden inside the ZK circuit.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: 'var(--color-text-faint)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
            <Shield size={11} color="var(--color-success)" />
            Groth16 · Midnight
          </div>
        </div>
      </motion.div>

      {/* 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
        <div>
          <CredentialVerifier />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <ConsentSnapshot />
          <AccessHistory />
        </div>
      </div>
    </div>
  );
}
