'use client';

import { signIn } from 'next-auth/react';
import { Shield, Building2, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignIn() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 100px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-proof"
        style={{ maxWidth: 440, width: '100%', padding: '2.5rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 1.25rem', borderRadius: 16,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}>
            <Shield size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sign in to ZeroProof</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Choose your role to access the compliance platform.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={() => signIn('credentials', { role: 'bank', callbackUrl: '/dashboard' })}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1.25rem', background: 'var(--color-primary-subtle)',
              border: '1px solid var(--color-primary-glow)', borderRadius: '0.75rem',
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
              color: 'var(--color-text)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-glow)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary-subtle)'}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="var(--color-primary-light)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-primary-light)' }}>Financial Institution</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Generate ZK proofs for compliance</div>
            </div>
          </button>

          <button
            onClick={() => signIn('credentials', { role: 'auditor', callbackUrl: '/auditor' })}
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1.25rem', background: 'var(--color-success-subtle)',
              border: '1px solid var(--color-success-glow)', borderRadius: '0.75rem',
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
              color: 'var(--color-text)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-success-glow)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-success-subtle)'}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Landmark size={20} color="var(--color-success-light)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-success-light)' }}>Regulator / Auditor</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Verify Zero-Knowledge cryptographic receipts</div>
            </div>
          </button>
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-faint)' }}>
          This is a demonstration environment. Real integration uses OIDC or SIWE.
        </div>
      </motion.div>
    </div>
  );
}
