'use client';

import { motion } from 'framer-motion';
import { Shield, FileCheck, Cpu, Globe } from 'lucide-react';
import { usePrivacy } from '@/context/PrivacyContext';

interface StatDef {
  label: string;
  sublabel: string;
  getValue: (data: ReturnType<typeof usePrivacy>) => string | number;
  suffix?: string;
  icon: typeof Shield;
  delay: number;
}

const STATS: StatDef[] = [
  {
    label: 'Total Proofs',
    sublabel: 'Generated on-chain',
    getValue: ({ proofs }) => proofs.length,
    icon: FileCheck,
    delay: 0,
  },
  {
    label: 'Avg. Proof Time',
    sublabel: 'ZK generation speed',
    getValue: ({ proofs }) =>
      proofs.length === 0
        ? 0
        : Math.round(proofs.reduce((s, p) => s + p.generationTimeMs, 0) / proofs.length),
    suffix: 'ms',
    icon: Cpu,
    delay: 0.05,
  },
  {
    label: 'Passed',
    sublabel: 'Compliance checks',
    getValue: ({ proofs }) => proofs.filter((p) => p.status === 'PASSED').length,
    icon: Shield,
    delay: 0.1,
  },
  {
    label: 'IPFS Receipts',
    sublabel: 'Immutable audit trail',
    getValue: ({ proofs }) => proofs.filter((p) => p.ipfsCid).length,
    icon: Globe,
    delay: 0.15,
  },
];

export function StatsGrid() {
  const privacyData = usePrivacy();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
      {STATS.map((stat) => {
        const Icon = stat.icon;
        const value = stat.getValue(privacyData);
        return (
          <motion.div
            key={stat.label}
            className="stat-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Icon */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36,
              borderRadius: '10px',
              background: 'var(--color-surface-2)',
              marginBottom: '1.25rem',
            }}>
              <Icon size={17} color="var(--color-text-muted)" strokeWidth={1.5} />
            </div>

            {/* Value */}
            <div style={{
              fontSize: '2rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}>
              {value}
              {stat.suffix && (
                <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '0.2em' }}>
                  {stat.suffix}
                </span>
              )}
            </div>

            {/* Label */}
            <div style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-text)',
              marginTop: '0.5rem',
            }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-faint)',
              marginTop: '0.125rem',
            }}>
              {stat.sublabel}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
