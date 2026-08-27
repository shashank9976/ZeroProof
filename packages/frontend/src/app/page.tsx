'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Globe, CheckCircle2, ArrowRight,
  Zap, Eye, EyeOff, GitBranch, Server, Users, Building2
} from 'lucide-react';

const PRIVACY_CHECKS = [
  { emoji: '✅', fact: 'Assets > Liabilities', hidden: '$842M assets / $671M liabilities' },
  { emoji: '✅', fact: 'KYC Verified (4,293 customers)', hidden: 'Names, IDs, DOBs — all hidden' },
  { emoji: '✅', fact: 'AML Score: Cleared', hidden: 'Raw scores — not disclosed' },
  { emoji: '✅', fact: 'Sanctions: Clear', hidden: 'Specific list + search path — hidden' },
];

const FEATURES = [
  {
    icon: Shield,
    title: 'Solvency Without Numbers',
    description: 'Prove assets exceed liabilities using Groth16 ZK-SNARKs. Auditors learn the fact, never the figures.',
    color: '#6366f1',
  },
  {
    icon: Lock,
    title: 'Anonymous KYC/AML',
    description: 'Demonstrate regulatory compliance through EdDSA signatures + Merkle non-inclusion proofs.',
    color: '#10b981',
  },
  {
    icon: Globe,
    title: 'Immutable IPFS Receipts',
    description: 'Every proof is pinned to IPFS. The CID is your tamper-evident audit receipt — forever.',
    color: '#06b6d4',
  },
  {
    icon: GitBranch,
    title: 'Midnight Network',
    description: 'Compact contracts on Midnight\'s dual-state blockchain. Privacy-by-design, not bolt-on.',
    color: '#f59e0b',
  },
  {
    icon: Zap,
    title: 'Sub-5ms Verification',
    description: 'On-chain Groth16 verification is near-instant. Generate proofs in under 3 seconds.',
    color: '#8b5cf6',
  },
  {
    icon: Server,
    title: 'Zero Trust Architecture',
    description: 'Private witnesses never leave your environment. The proof server runs on your infrastructure.',
    color: '#ec4899',
  },
];

function FloatingOrb({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(80px)',
      pointerEvents: 'none',
      ...style,
    }} />
  );
}

export default function HomePage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <FloatingOrb style={{ width: 600, height: 600, background: 'rgba(99,102,241,0.08)', top: -200, right: -100, animation: 'float 8s ease-in-out infinite' }} />
      <FloatingOrb style={{ width: 400, height: 400, background: 'rgba(6,182,212,0.06)', top: 200, left: -150 }} />
      <FloatingOrb style={{ width: 500, height: 500, background: 'rgba(16,185,129,0.05)', bottom: 100, right: 200 }} />

      {/* ── Hero ──────────────────────────────────── */}
      <section style={{ paddingTop: '4rem', paddingBottom: '6rem', maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}
        >
          <div className="badge badge-primary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }}>
            <span className="pulse-dot green" />
            Powered by Midnight Network + Groth16 ZK-SNARKs
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.5rem' }}
        >
          <span className="text-gradient-hero">Prove Compliance.</span>
          <br />
          <span style={{ color: 'var(--color-text)', opacity: 0.9 }}>Reveal Nothing.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', maxWidth: 640, margin: '0 auto 2.5rem', lineHeight: 1.7 }}
        >
          ZeroProof lets finance companies prove KYC/AML compliance and solvency to auditors
          using <strong style={{ color: 'var(--color-text)' }}>Zero-Knowledge Proofs</strong> —
          without exposing account balances, transaction details, or customer identities.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/dashboard" className="btn btn-primary btn-lg">
            <Shield size={18} />
            Open Dashboard
            <ArrowRight size={16} />
          </Link>
          <Link href="/auditor" className="btn btn-ghost btn-lg">
            <Eye size={18} />
            Auditor View
          </Link>
        </motion.div>
      </section>

      {/* ── Privacy Demo ─────────────────────────── */}
      <section style={{ maxWidth: 780, margin: '0 auto 6rem', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="card-proof"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                What an Auditor Sees
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Zero private data — only mathematical proofs
              </div>
            </div>
            <div className="badge badge-success" style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}>
              <CheckCircle2 size={14} />
              Proof Verified On-Chain
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {PRIVACY_CHECKS.map((check, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.875rem 1rem', background: 'rgba(16,185,129,0.04)', borderRadius: '0.625rem', border: '1px solid rgba(16,185,129,0.1)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.125rem' }}>{check.emoji}</span>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)' }}>{check.fact}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <EyeOff size={13} color="var(--color-text-faint)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', fontStyle: 'italic' }}>{check.hidden}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: 'rgba(99,102,241,0.06)', borderRadius: '0.75rem', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', fontWeight: 600, marginBottom: '0.375rem' }}>
              🔒 Proof Receipt (IPFS)
            </div>
            <div className="cid-display">QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG</div>
          </div>
        </motion.div>
      </section>

      {/* ── Features Grid ────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto 6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="section-title" style={{ fontSize: '2rem' }}>
            Privacy-by-<span className="text-gradient-primary">Architecture</span>
          </h2>
          <p className="section-subtitle" style={{ maxWidth: 480, margin: '0 auto' }}>
            Every layer enforces privacy. Not policy. Not promises. Cryptography.
          </p>
        </div>

        <div className="grid-3">
          {FEATURES.map(({ icon: Icon, title, description, color }, i) => (
            <motion.div
              key={title}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '10px', marginBottom: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${color}18`,
                border: `1px solid ${color}30`,
              }}>
                <Icon size={22} color={color} strokeWidth={2} />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>{title}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{description}</div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* ── Workplace Privacy ───────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto 6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge badge-primary" style={{ marginBottom: '1rem', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
            NEW USE CASE
          </div>
          <h2 className="section-title" style={{ fontSize: '2rem' }}>
            Introducing <span style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>WorkVault</span>
          </h2>
          <p className="section-subtitle" style={{ maxWidth: 600, margin: '0 auto' }}>
            Employee-controlled credential attestations. Prove visa status, background screening, and degrees without disclosing raw documents.
          </p>
        </div>

        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: 860, margin: '0 auto' }}>
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ width: 44, height: 44, borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.2)' }}>
              <Users size={22} color="var(--color-primary-light)" strokeWidth={2} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Employee-Controlled</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Employees hold verified credential attestations and generate proofs only when requested.</div>
            <Link href="/employee" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--color-primary-light)', fontWeight: 600, marginTop: '1rem', textDecoration: 'none' }}>
              Open Employee Vault <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div className="card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div style={{ width: 44, height: 44, borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <Building2 size={22} color="var(--color-success)" strokeWidth={2} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Secure Verification</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Companies request and verify credential ZK proofs on the Midnight network securely.</div>
            <Link href="/company" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--color-success)', fontWeight: 600, marginTop: '1rem', textDecoration: 'none' }}>
              Company Portal <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
