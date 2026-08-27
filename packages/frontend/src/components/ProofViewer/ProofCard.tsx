'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Lock, Globe, Cpu, Copy, Check,
  ChevronDown, ChevronUp, Shield, UserCheck, ExternalLink
} from 'lucide-react';
import type { StoredProof } from '@/context/PrivacyContext';

interface ZKProof {
  pi_a?: [string, string, string];
  pi_b?: [[string, string], [string, string], [string, string]];
  pi_c?: [string, string, string];
  protocol?: string;
}

export interface ProofVerifierProps {
  proofData: StoredProof;
  validatorAddress?: string;
  showRawProof?: boolean;
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hours ago`;
  return new Date(timestamp).toLocaleDateString();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="btn btn-ghost btn-sm"
      style={{ padding: '0.25rem 0.5rem', gap: '0.25rem' }}
      title="Copy to clipboard"
    >
      {copied ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
    </button>
  );
}

export function ProofCard({ proofData, validatorAddress, showRawProof = false }: ProofVerifierProps) {
  const [expanded, setExpanded] = useState(false);
  const isPassed = proofData.status === 'PASSED';
  const isCompliance = proofData.proofType === 'compliance';

  return (
    <motion.div
      className="card-proof"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      layout
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* ── Header Row ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isPassed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid rgba(${isPassed ? '16,185,129' : '239,68,68'}, 0.3)`,
          }}>
            {isCompliance
              ? <UserCheck size={20} color={isPassed ? '#10b981' : '#ef4444'} strokeWidth={2} />
              : <Shield size={20} color={isPassed ? '#10b981' : '#ef4444'} strokeWidth={2} />}
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text)' }}>
              {isCompliance ? 'KYC/AML Compliance' : 'Solvency Verification'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
              {formatTimeAgo(proofData.timestamp)}
            </div>
          </div>
        </div>

        {/* Audit Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        >
          {isPassed ? (
            <div className="badge badge-success" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
              <span className="pulse-dot green" style={{ flexShrink: 0 }} />
              ✅ AUDIT: PASSED
            </div>
          ) : (
            <div className="badge badge-danger" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
              <XCircle size={13} />
              AUDIT: FAILED
            </div>
          )}
        </motion.div>
      </div>

      <hr className="divider" style={{ margin: '0.75rem 0' }} />

      {/* ── Status Grid ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem', marginBottom: '1rem' }}>
        {/* Private Values */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.625rem 0.875rem',
          background: 'rgba(99, 102, 241, 0.06)',
          borderRadius: '0.625rem',
          border: '1px solid rgba(99, 102, 241, 0.15)',
        }}>
          <Lock size={14} color="var(--color-primary-light)" />
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🔒 Private values
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}>Not disclosed</div>
          </div>
        </div>

        {/* ZK Generation Time */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.625rem 0.875rem',
          background: 'rgba(6, 182, 212, 0.06)',
          borderRadius: '0.625rem',
          border: '1px solid rgba(6, 182, 212, 0.15)',
        }}>
          <Cpu size={14} color="var(--color-cyan)" />
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-cyan)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ⚙️ ZK Generation
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}>
              {proofData.generationTimeMs}ms · Groth16
            </div>
          </div>
        </div>
      </div>

      {/* ── Compliance-Specific Details ──────────────── */}
      {isCompliance && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{
            flex: 1, padding: '0.625rem',
            background: proofData.kycPassed ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
            borderRadius: '0.5rem',
            border: `1px solid rgba(${proofData.kycPassed ? '16,185,129' : '239,68,68'}, 0.2)`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1rem' }}>{proofData.kycPassed ? '✅' : '❌'}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: proofData.kycPassed ? 'var(--color-success-light)' : 'var(--color-danger-light)', marginTop: '0.25rem' }}>
              KYC
            </div>
          </div>
          <div style={{
            flex: 1, padding: '0.625rem',
            background: proofData.amlPassed ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
            borderRadius: '0.5rem',
            border: `1px solid rgba(${proofData.amlPassed ? '16,185,129' : '239,68,68'}, 0.2)`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1rem' }}>{proofData.amlPassed ? '✅' : '❌'}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: proofData.amlPassed ? 'var(--color-success-light)' : 'var(--color-danger-light)', marginTop: '0.25rem' }}>
              AML
            </div>
          </div>
          {proofData.validUntil && (
            <div style={{
              flex: 2, padding: '0.625rem',
              background: 'rgba(245, 158, 11, 0.06)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-warning-light)', fontWeight: 600 }}>Valid Until</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                {new Date(proofData.validUntil).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── IPFS CID ────────────────────────────────── */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>
          <Globe size={11} style={{ display: 'inline', marginRight: 4 }} />
          IPFS Proof Receipt
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="cid-display" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {proofData.ipfsCid}
          </div>
          <CopyButton text={proofData.ipfsCid} />
          <a
            href={`https://ipfs.io/ipfs/${proofData.ipfsCid}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-cyan)', flexShrink: 0 }}
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* ── Attestation ID ─────────────────────────── */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>
          Attestation ID
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="proof-hex" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0.375rem 0.75rem' }}>
            {proofData.attestationId}
          </div>
          <CopyButton text={proofData.attestationId} />
        </div>
      </div>

      {/* ── Expand for commitment hash ─────────────── */}
      {(showRawProof || proofData.commitmentHash) && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide' : 'Show'} Commitment Hash
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    Poseidon Commitment (Auditor Verification)
                  </div>
                  <div className="proof-hex">
                    {proofData.commitmentHash ?? 'Poseidon(assets, liabilities, salt) — values hidden'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginTop: '0.5rem' }}>
                    ℹ️ An auditor with the preimage can verify this hash — raw values remain private.
                  </div>
                </div>

                {validatorAddress && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Verified By
                    </div>
                    <div className="cid-display">{validatorAddress}</div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
