'use client';

import { motion } from 'framer-motion';
import { Users, Shield, Lock } from 'lucide-react';
import { AuditorView } from '@/components/DisclosureControl/AuditorView';

export default function AuditorPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={22} color="#10b981" strokeWidth={2} />
          </div>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.75rem', marginBottom: 0 }}>
              Auditor <span className="text-gradient-success">View</span>
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
              Verify compliance without accessing private data
            </p>
          </div>
        </div>

        {/* Privacy guarantee banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0.875rem 1.25rem',
          background: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '0.75rem',
          flexWrap: 'wrap',
        }}>
          <Lock size={16} color="#10b981" />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', flex: 1 }}>
            <strong style={{ color: 'var(--color-success-light)' }}>Privacy Guarantee:</strong> This view shows only cryptographic proof outputs.
            Account balances, customer identities, and transaction details are mathematically hidden
            inside the ZK circuit — they cannot be extracted from any data shown here.
          </span>
          <div className="badge badge-success" style={{ fontSize: '0.6875rem', flexShrink: 0 }}>
            <Shield size={11} />
            Groth16 Verified
          </div>
        </div>
      </motion.div>

      {/* Auditor View Component */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <AuditorView />
      </motion.div>
    </div>
  );
}
