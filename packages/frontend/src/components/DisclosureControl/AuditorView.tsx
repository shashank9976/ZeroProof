'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, CheckCircle2, XCircle, Lock, Globe, Clock, AlertCircle } from 'lucide-react';
import { useIPFSProof } from '@/hooks/useIPFSProof';
import { usePrivacy } from '@/context/PrivacyContext';

function AuditResult({ cid }: { cid: string }) {
  const { data, isLoading } = useIPFSProof(cid);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spin-slow 0.8s linear infinite',
          margin: '0 auto 1rem',
        }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>Fetching proof from IPFS...</p>
        <p style={{ color: 'var(--color-text-faint)', fontSize: '0.8125rem', marginTop: '0.375rem' }}>
          Verifying cryptographic validity
        </p>
      </div>
    );
  }

  if (!data) return null;

  const kycPassed = data.publicSignals[0] === '1';
  const amlPassed = data.proofType === 'compliance' ? data.publicSignals[1] === '1' : null;
  const isSolvent = data.proofType === 'solvency' ? data.publicSignals[0] === '1' : null;
  const overallPassed = data.isValid && (isSolvent ?? (kycPassed && (amlPassed ?? true)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Overall Status Banner */}
      <div style={{
        padding: '1.5rem',
        background: overallPassed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid rgba(${overallPassed ? '16,185,129' : '239,68,68'}, 0.3)`,
        borderRadius: '1rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
      }}>
        {overallPassed
          ? <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: '0.75rem' }} />
          : <XCircle size={40} color="#ef4444" style={{ marginBottom: '0.75rem' }} />
        }
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: overallPassed ? '#10b981' : '#ef4444', letterSpacing: '-0.02em' }}>
          {overallPassed ? '✅ COMPLIANCE VERIFIED' : '❌ COMPLIANCE FAILED'}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.375rem' }}>
          Proof type: {data.proofType} · System: Groth16 ZK-SNARK
        </div>
      </div>

      {/* What the auditor DOES see */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          ✅ Disclosed to Auditor
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {/* Proof type */}
          <div className="glass-light" style={{ padding: '0.875rem', borderRadius: '0.75rem' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Proof Type</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)', textTransform: 'capitalize' }}>{data.proofType}</div>
          </div>

          {/* Timestamp */}
          <div className="glass-light" style={{ padding: '0.875rem', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              <Clock size={10} /> Generated
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
              {new Date(data.timestamp).toLocaleDateString()} {new Date(data.timestamp).toLocaleTimeString()}
            </div>
          </div>

          {/* KYC/AML or Solvency */}
          {data.proofType === 'solvency' && (
            <div className="glass-light" style={{ padding: '0.875rem', borderRadius: '0.75rem', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Solvency Status</div>
              <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: isSolvent ? '#10b981' : '#ef4444' }}>
                {isSolvent ? '✅ SOLVENT — Assets exceed liabilities' : '❌ NOT SOLVENT'}
              </div>
            </div>
          )}
          {data.proofType === 'compliance' && (
            <>
              <div className="glass-light" style={{ padding: '0.875rem', borderRadius: '0.75rem' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>KYC Status</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: kycPassed ? '#10b981' : '#ef4444' }}>
                  {kycPassed ? '✅ VERIFIED' : '❌ NOT VERIFIED'}
                </div>
              </div>
              <div className="glass-light" style={{ padding: '0.875rem', borderRadius: '0.75rem' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>AML Status</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: amlPassed ? '#10b981' : '#ef4444' }}>
                  {amlPassed ? '✅ CLEARED' : '❌ NOT CLEARED'}
                </div>
              </div>
            </>
          )}

          {/* IPFS CID */}
          <div className="glass-light" style={{ padding: '0.875rem', borderRadius: '0.75rem', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              <Globe size={10} /> IPFS Proof Receipt
            </div>
            <div className="cid-display">{cid}</div>
          </div>
        </div>
      </div>

      {/* What the auditor does NOT see */}
      <div className="card-proof" style={{ background: 'rgba(239,68,68,0.03)', borderColor: 'rgba(239,68,68,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
          <Lock size={13} />
          🔒 Never Disclosed — Cryptographically Hidden
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {['Account Balances', 'Asset Amounts', 'Liability Values', 'Customer Names', 'Entity IDs', 'AML Score', 'Transaction History', 'Counterparty Identities'].map((field) => (
            <span key={field} style={{
              fontSize: '0.6875rem', fontFamily: 'var(--font-mono)',
              padding: '0.2rem 0.625rem', borderRadius: '0.25rem',
              background: 'rgba(239,68,68,0.06)', color: '#f87171',
              border: '1px solid rgba(239,68,68,0.15)',
            }}>
              {field}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '0.75rem' }}>
          These values were processed inside the ZK circuit and mathematically erased. Even with unlimited compute, they cannot be recovered from this proof.
        </div>
      </div>
    </motion.div>
  );
}

export function AuditorView() {
  const [cidInput, setCidInput] = useState('');
  const [activeCid, setActiveCid] = useState('');
  const { proofs } = usePrivacy();

  const handleSearch = () => {
    if (cidInput.trim()) setActiveCid(cidInput.trim());
  };

  return (
    <div>
      {/* Quick Select from existing proofs */}
      {proofs.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
            Quick Select from Your Proofs
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {proofs.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => { setCidInput(p.ipfsCid); setActiveCid(p.ipfsCid); }}
                className="btn btn-ghost btn-sm"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}
              >
                {p.proofType} · {p.ipfsCid.slice(0, 16)}...
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CID Input */}
      <div className="card-proof" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} color="var(--color-primary-light)" />
          Verify Proof by IPFS CID
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            className="input"
            placeholder="QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
            value={cidInput}
            onChange={(e) => setCidInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
          />
          <button onClick={handleSearch} className="btn btn-primary" disabled={!cidInput.trim()}>
            Verify
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
          <AlertCircle size={13} color="var(--color-text-faint)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
            Enter an IPFS CID to fetch and verify the proof. No private data will be shown.
          </span>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {activeCid && (
          <motion.div key={activeCid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuditResult cid={activeCid} />
          </motion.div>
        )}
      </AnimatePresence>

      {!activeCid && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-faint)' }}>
          <Shield size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Ready to Verify</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Enter a proof CID above or select one from your proofs list.
          </p>
        </div>
      )}
    </div>
  );
}
