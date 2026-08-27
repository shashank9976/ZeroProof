'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Loader2, X, Shield, UserCheck,
  CheckCircle, Clock, Cpu, Archive, Zap, Link2, ChevronRight, AlertCircle,
} from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { usePrivacy } from '@/context/PrivacyContext';
import type { StoredProof } from '@/context/PrivacyContext';
import { useProofGeneration } from '@/hooks/useProofGeneration';
import { useSession } from 'next-auth/react';

/* ── Helpers ──────────────────────────────────────────────── */
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

function getStatusConfig(score: number) {
  if (score >= 90) return { label: 'Fully Compliant', description: 'All checks passed', rawColor: '#30D158', cssColor: 'var(--color-success)' };
  if (score >= 60) return { label: 'Partial', description: 'Some checks need attention', rawColor: '#FF9F0A', cssColor: 'var(--color-warning)' };
  return { label: 'Non-Compliant', description: 'Action required', rawColor: '#FF453A', cssColor: 'var(--color-danger)' };
}

/* ── Generate Modal ───────────────────────────────────────── */
function GenerateModal({ onClose }: { onClose: () => void }) {
  const { state, generateSolvencyProof, generateComplianceProof, reset } = useProofGeneration();
  const [mode, setMode] = useState<'solvency' | 'compliance'>('solvency');
  const [assets, setAssets] = useState('1000000000');
  const [liabilities, setLiabilities] = useState('800000000');
  const [kycStatus, setKycStatus] = useState<0 | 1>(1);
  const [amlScore, setAmlScore] = useState(15);

  const handleGenerate = async () => {
    if (mode === 'solvency') {
      await generateSolvencyProof({ totalAssets: assets, totalLiabilities: liabilities });
    } else {
      await generateComplianceProof({
        entityIdHash: BigInt('123456789').toString(),
        kycVerified: kycStatus,
        amlScore,
        amlThreshold: 30,
      });
    }
  };

  const isIdle = state.status === 'idle';
  const isDone = state.status === 'done';
  const isWorking = state.status === 'generating' || state.status === 'uploading';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid var(--color-border)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>Generate ZK Proof</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>Private inputs never leave this session</div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.375rem' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', padding: '3px' }}>
          <button onClick={() => { setMode('solvency'); reset(); }}
            style={{
              flex: 1, padding: '0.5rem', borderRadius: 'calc(var(--radius-lg) - 2px)',
              background: mode === 'solvency' ? 'var(--color-surface)' : 'transparent',
              border: mode === 'solvency' ? '1px solid var(--color-border)' : '1px solid transparent',
              color: mode === 'solvency' ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.15s ease',
            }}>
            <Shield size={13} /> Solvency
          </button>
          <button onClick={() => { setMode('compliance'); reset(); }}
            style={{
              flex: 1, padding: '0.5rem', borderRadius: 'calc(var(--radius-lg) - 2px)',
              background: mode === 'compliance' ? 'var(--color-surface)' : 'transparent',
              border: mode === 'compliance' ? '1px solid var(--color-border)' : '1px solid transparent',
              color: mode === 'compliance' ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.15s ease',
            }}>
            <UserCheck size={13} /> KYC/AML
          </button>
        </div>

        {mode === 'solvency' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: '0.5rem' }}>
                Total Assets <span style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem', fontWeight: 400 }}>(cents, private)</span>
              </label>
              <input className="input" type="number" value={assets} onChange={(e) => setAssets(e.target.value)} />
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginTop: '0.375rem' }}>
                = {(Number(assets) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: '0.5rem' }}>
                Total Liabilities <span style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem', fontWeight: 400 }}>(cents, private)</span>
              </label>
              <input className="input" type="number" value={liabilities} onChange={(e) => setLiabilities(e.target.value)} />
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginTop: '0.375rem' }}>
                = {(Number(liabilities) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </div>
            </div>
          </div>
        )}

        {mode === 'compliance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: '0.5rem' }}>
                KYC Status <span style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem', fontWeight: 400 }}>(private)</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', padding: '3px' }}>
                <button onClick={() => setKycStatus(1)}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: 'calc(var(--radius-lg) - 2px)',
                    background: kycStatus === 1 ? 'var(--color-surface)' : 'transparent',
                    border: kycStatus === 1 ? '1px solid var(--color-border)' : '1px solid transparent',
                    color: kycStatus === 1 ? 'var(--color-success)' : 'var(--color-text-muted)',
                    fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                  }}>Verified</button>
                <button onClick={() => setKycStatus(0)}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: 'calc(var(--radius-lg) - 2px)',
                    background: kycStatus === 0 ? 'var(--color-surface)' : 'transparent',
                    border: kycStatus === 0 ? '1px solid var(--color-border)' : '1px solid transparent',
                    color: kycStatus === 0 ? 'var(--color-danger)' : 'var(--color-text-muted)',
                    fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                  }}>Not Verified</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: '0.5rem' }}>
                AML Risk Score: {amlScore}/100 <span style={{ color: 'var(--color-text-faint)', fontSize: '0.75rem', fontWeight: 400 }}>(private)</span>
              </label>
              <input type="range" min={0} max={100} value={amlScore} onChange={(e) => setAmlScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: amlScore < 30 ? 'var(--color-success)' : amlScore < 60 ? 'var(--color-warning)' : 'var(--color-danger)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginTop: '0.25rem' }}>
                <span>Low Risk</span>
                <span style={{ color: amlScore < 30 ? 'var(--color-success)' : amlScore < 60 ? 'var(--color-warning)' : 'var(--color-danger)', fontWeight: 500 }}>
                  Threshold 30 — {amlScore < 30 ? 'Pass' : 'Fail'}
                </span>
                <span>High Risk</span>
              </div>
            </div>
          </div>
        )}

        {isWorking && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              <span>{state.status === 'generating' ? 'Generating ZK proof…' : 'Uploading to IPFS…'}</span>
              <span>{state.progress}%</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${state.progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        {isDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '1rem', background: 'var(--color-success-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-success-glow)',
              marginBottom: '1.5rem', textAlign: 'center',
            }}
          >
            <CheckCircle size={24} color="var(--color-success)" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>Proof Generated</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              {state.generationTimeMs}ms · Pinned to IPFS
            </div>
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isDone ? (
            <button onClick={onClose} className="btn btn-success" style={{ flex: 1 }}>View Proof</button>
          ) : (
            <button onClick={handleGenerate} disabled={isWorking} className="btn btn-primary" style={{ flex: 1 }}>
              {isWorking ? <><Loader2 size={15} style={{ animation: 'spin-slow 1s linear infinite' }} /> Processing…</> : <><Plus size={15} /> Generate Proof</>}
            </button>
          )}
          {!isWorking && !isDone && <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Proof Row Item ───────────────────────────────────────── */
function ProofRow({ proof, index }: { proof: StoredProof; index: number }) {
  const isCompliance = proof.proofType === 'compliance';
  const isPassed = proof.status === 'PASSED';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.875rem 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-surface-2)',
        }}>
          {isCompliance
            ? <UserCheck size={15} color="var(--color-text-muted)" strokeWidth={1.5} />
            : <Shield size={15} color="var(--color-text-muted)" strokeWidth={1.5} />}
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>
            {isCompliance ? 'KYC/AML Compliance' : 'Solvency Verification'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
            {proof.ipfsCid.slice(0, 22)}…
          </div>
        </div>
      </div>

      <span style={{
        fontSize: '0.6875rem', fontWeight: 500,
        color: isPassed ? 'var(--color-success)' : 'var(--color-danger)',
        background: isPassed ? 'var(--color-success-subtle)' : 'var(--color-danger-subtle)',
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--radius-full)',
        whiteSpace: 'nowrap',
      }}>
        {proof.status}
      </span>

      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', whiteSpace: 'nowrap' }}>
        {proof.generationTimeMs}ms
      </span>

      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', whiteSpace: 'nowrap' }}>
        {formatRelativeTime(proof.timestamp)}
      </span>
    </motion.div>
  );
}

/* ── Dashboard Page ───────────────────────────────────────── */
export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);
  const { data: session } = useSession();
  const { proofs } = usePrivacy();
  const isBank = (session?.user as any)?.role === 'bank';

  const totalProofs = proofs.length;
  const passedProofs = proofs.filter((p) => p.status === 'PASSED').length;
  const score = totalProofs === 0 ? 0 : Math.round((passedProofs / totalProofs) * 100);
  const avgTime = totalProofs === 0 ? 0 : Math.round(proofs.reduce((s, p) => s + p.generationTimeMs, 0) / totalProofs);
  const ipfsCount = proofs.filter((p) => p.ipfsCid).length;
  const statusConfig = getStatusConfig(score);

  const chartData = [
    { name: 'score', value: score, fill: statusConfig.rawColor },
    { name: 'bg', value: 100 - score, fill: 'rgba(128, 128, 128, 0.08)' },
  ];

  const recent = proofs.slice(0, 5);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: '2.5rem', gap: '1rem',
      }}>
        <div>
          <p style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: '0.375rem' }}>
            ZeroProof
          </p>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--color-text)', lineHeight: 1.1 }}>
            Compliance Overview
          </h1>
        </div>
        {isBank ? (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Generate Proof
          </button>
        ) : (
          <div style={{
            padding: '0.5rem 0.875rem',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.8125rem',
            color: 'var(--color-text-faint)',
          }}>
            Sign in as Bank to generate proofs
          </div>
        )}
      </div>

      {/* ── True Bento Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridTemplateRows: 'auto auto auto',
        gap: '1rem',
      }}>

        {/* ① Large: Compliance Score — spans 2 cols × 2 rows */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            gridColumn: '1 / 3',
            gridRow: '1 / 3',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 280,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: '0.375rem' }}>
                Compliance Score
              </p>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                Overall Health
              </h2>
            </div>
            <div style={{
              fontSize: '0.6875rem', fontWeight: 500, color: 'var(--color-primary)',
              background: 'var(--color-primary-subtle)',
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--radius-full)',
            }}>
              Live
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1, paddingTop: '1.5rem' }}>
            {/* Ring */}
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="62%" outerRadius="88%"
                  data={chartData}
                  startAngle={90} endAngle={-270}
                  barSize={11}
                >
                  <RadialBar dataKey="value" cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 600, color: statusConfig.cssColor, lineHeight: 1, letterSpacing: '-0.04em' }}>
                  {score}<span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-faint)' }}>%</span>
                </div>
                <div style={{ fontSize: '0.625rem', color: 'var(--color-text-faint)', marginTop: '0.2rem' }}>
                  {passedProofs}/{totalProofs}
                </div>
              </div>
            </div>

            {/* Status */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.375rem', fontWeight: 600, color: statusConfig.cssColor, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                {statusConfig.label}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {statusConfig.description}
              </div>
              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--color-text-faint)' }}>Passed</span>
                  <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{passedProofs}</span>
                </div>
                <div style={{ height: 4, background: 'var(--color-surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${score}%`, background: statusConfig.rawColor, borderRadius: 2, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--color-text-faint)' }}>Total</span>
                  <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{totalProofs}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ② Stat: Total Proofs — top right first */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          style={{
            gridColumn: '3 / 4',
            gridRow: '1 / 2',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', fontWeight: 400 }}>Total Proofs</p>
            <Archive size={15} color="var(--color-text-faint)" strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {totalProofs}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '0.375rem' }}>Generated on-chain</p>
          </div>
        </motion.div>

        {/* ③ Stat: Avg Proof Time */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            gridColumn: '4 / 5',
            gridRow: '1 / 2',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', fontWeight: 400 }}>Avg. Proof Time</p>
            <Zap size={15} color="var(--color-text-faint)" strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {avgTime}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--color-text-faint)', marginLeft: '0.2em' }}>ms</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '0.375rem' }}>ZK generation speed</p>
          </div>
        </motion.div>

        {/* ④ Stat: Passed — with subtle green accent */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            gridColumn: '3 / 4',
            gridRow: '2 / 3',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', fontWeight: 400 }}>Passed</p>
            <CheckCircle size={15} color="var(--color-success)" strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {passedProofs}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '0.375rem' }}>Compliance checks</p>
          </div>
        </motion.div>

        {/* ⑤ Stat: IPFS Receipts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            gridColumn: '4 / 5',
            gridRow: '2 / 3',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', fontWeight: 400 }}>IPFS Receipts</p>
            <Link2 size={15} color="var(--color-text-faint)" strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {ipfsCount}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '0.375rem' }}>Immutable audit trail</p>
          </div>
        </motion.div>

        {/* ⑥ Recent Proofs — full width */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{
            gridColumn: '1 / 5',
            gridRow: '3 / 4',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-2xl)',
            padding: '1.75rem 2rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: '0.25rem' }}>
                Activity
              </p>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                Recent Proofs
              </h2>
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontSize: '0.8125rem', color: 'var(--color-primary)',
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
              fontFamily: 'var(--font-sans)',
            }}>
              View all <ChevronRight size={14} />
            </button>
          </div>

          {recent.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem 1rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <AlertCircle size={24} color="var(--color-text-faint)" strokeWidth={1.5} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>No proofs yet</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-faint)', marginTop: '0.25rem' }}>
                Generate your first ZK proof to get started
              </p>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '1rem',
                padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)',
                marginTop: '1.25rem',
              }}>
                {['Proof', 'Status', 'Time', 'When'].map(h => (
                  <span key={h} style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-faint)' }}>
                    {h}
                  </span>
                ))}
              </div>
              {recent.map((proof, i) => (
                <ProofRow key={proof.id} proof={proof} index={i} />
              ))}
            </>
          )}
        </motion.div>

      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {showModal && <GenerateModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
