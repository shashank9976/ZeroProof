'use client';

import { motion } from 'framer-motion';
import { Shield, UserCheck, Cpu, AlertCircle, Clock } from 'lucide-react';
import { usePrivacy } from '@/context/PrivacyContext';
import type { StoredProof } from '@/context/PrivacyContext';

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function ProofTimelineItem({ proof, index }: { proof: StoredProof; index: number }) {
  const isCompliance = proof.proofType === 'compliance';
  const isPassed = proof.status === 'PASSED';

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex', gap: '0.75rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 38, height: 38,
        borderRadius: '10px',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-surface-2)',
      }}>
        {isCompliance
          ? <UserCheck size={17} color={isPassed ? 'var(--color-success)' : 'var(--color-danger)'} strokeWidth={1.5} />
          : <Shield size={17} color={isPassed ? 'var(--color-success)' : 'var(--color-danger)'} strokeWidth={1.5} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.25rem',
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
            {isCompliance ? 'KYC/AML Compliance' : 'Solvency Verification'}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.6875rem',
            color: 'var(--color-text-faint)',
          }}>
            <Clock size={10} />
            {formatRelativeTime(proof.timestamp)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Status pill */}
          <span style={{
            fontSize: '0.6875rem',
            fontWeight: 500,
            color: isPassed ? 'var(--color-success)' : 'var(--color-danger)',
            background: isPassed ? 'var(--color-success-subtle)' : 'var(--color-danger-subtle)',
            padding: '0.125rem 0.5rem',
            borderRadius: 'var(--radius-full)',
          }}>
            {proof.status}
          </span>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            fontSize: '0.6875rem',
            color: 'var(--color-text-faint)',
          }}>
            <Cpu size={10} />
            {proof.generationTimeMs}ms
          </div>

          {isCompliance && (
            <>
              {proof.kycPassed !== undefined && (
                <span style={{
                  fontSize: '0.6875rem',
                  color: proof.kycPassed ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                  KYC {proof.kycPassed ? '✓' : '✗'}
                </span>
              )}
              {proof.amlPassed !== undefined && (
                <span style={{
                  fontSize: '0.6875rem',
                  color: proof.amlPassed ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                  AML {proof.amlPassed ? '✓' : '✗'}
                </span>
              )}
            </>
          )}
        </div>

        {/* CID */}
        <div style={{
          marginTop: '0.375rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: 'var(--color-text-faint)',
          opacity: 0.7,
        }}>
          {proof.ipfsCid.slice(0, 24)}…
        </div>
      </div>
    </motion.div>
  );
}

export function ProofTimeline() {
  const { proofs } = usePrivacy();
  const recent = proofs.slice(0, 6);

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <div style={{
            fontSize: '0.6875rem',
            color: 'var(--color-text-faint)',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0.25rem',
          }}>
            Activity
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>Recent Proofs</div>
        </div>
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          background: 'var(--color-surface-2)',
          padding: '0.25rem 0.625rem',
          borderRadius: 'var(--radius-full)',
        }}>
          {proofs.length} total
        </span>
      </div>

      {/* List */}
      {recent.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--color-text-faint)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <AlertCircle size={28} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>No proofs yet</p>
          <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem', color: 'var(--color-text-faint)' }}>
            Generate your first ZK proof to get started
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {recent.map((proof, index) => (
            <ProofTimelineItem key={proof.id} proof={proof} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
