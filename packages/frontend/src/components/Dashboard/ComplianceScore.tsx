'use client';

import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import { usePrivacy } from '@/context/PrivacyContext';

function getStatusConfig(score: number) {
  if (score >= 90) return {
    label: 'Fully Compliant',
    description: 'All checks passed',
    cssColor: 'var(--color-success)',
    rawColor: '#30D158',
    icon: ShieldCheck,
  };
  if (score >= 60) return {
    label: 'Partially Compliant',
    description: 'Some checks need attention',
    cssColor: 'var(--color-warning)',
    rawColor: '#FF9F0A',
    icon: AlertTriangle,
  };
  return {
    label: 'Non-Compliant',
    description: 'Action required',
    cssColor: 'var(--color-danger)',
    rawColor: '#FF453A',
    icon: XCircle,
  };
}

export function ComplianceScore() {
  const { proofs } = usePrivacy();

  const passedProofs = proofs.filter((p) => p.status === 'PASSED').length;
  const score = proofs.length === 0 ? 0 : Math.round((passedProofs / proofs.length) * 100);
  const config = getStatusConfig(score);
  const Icon = config.icon;

  const chartData = [
    { name: 'score', value: score, fill: config.rawColor },
    { name: 'bg', value: 100 - score, fill: 'rgba(128, 128, 128, 0.08)' },
  ];

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <div style={{
            fontSize: '0.6875rem',
            color: 'var(--color-text-faint)',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '0.25rem',
          }}>
            Compliance Score
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
            Overall Health
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          fontSize: '0.6875rem', fontWeight: 500,
          color: 'var(--color-primary)',
          padding: '0.25rem 0.625rem',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary-subtle)',
          border: '1px solid var(--color-primary-glow)',
        }}>
          <TrendingUp size={10} />
          Live
        </div>
      </div>

      {/* Ring Chart */}
      <div style={{ position: 'relative', height: 180, flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="62%" outerRadius="85%"
            data={chartData}
            startAngle={90} endAngle={-270}
            barSize={12}
          >
            <RadialBar dataKey="value" cornerRadius={6} />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Score */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            style={{
              fontSize: '2.25rem',
              fontWeight: 600,
              color: config.cssColor,
              lineHeight: 1,
              letterSpacing: '-0.04em',
            }}
          >
            {score}
            <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--color-text-muted)', letterSpacing: 0 }}>%</span>
          </motion.div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginTop: '0.25rem' }}>
            {passedProofs}/{proofs.length} proofs
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div style={{ marginTop: '1rem' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.875rem',
            background: 'var(--color-surface-2)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <Icon size={18} color={config.rawColor} strokeWidth={1.5} />
          <div>
            <div style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: config.cssColor,
            }}>
              {config.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
              {config.description}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
