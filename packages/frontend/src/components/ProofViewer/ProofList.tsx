'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SortAsc } from 'lucide-react';
import { ProofCard } from './ProofCard';
import { usePrivacy } from '@/context/PrivacyContext';

type FilterType = 'all' | 'solvency' | 'compliance';
type StatusFilter = 'all' | 'PASSED' | 'FAILED';

export function ProofList() {
  const { proofs } = usePrivacy();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = proofs.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.attestationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ipfsCid.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || p.proofType === typeFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', pointerEvents: 'none' }} />
          <input
            className="input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search by ID or CID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Type filter */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {(['all', 'solvency', 'compliance'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`btn btn-sm ${typeFilter === f ? 'btn-primary' : 'btn-ghost'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {(['all', 'PASSED', 'FAILED'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`btn btn-sm ${statusFilter === s ? (s === 'PASSED' ? 'btn-success' : s === 'FAILED' ? 'btn-danger' : 'btn-primary') : 'btn-ghost'}`}
            >
              {s === 'PASSED' ? '✅ ' : s === 'FAILED' ? '❌ ' : ''}{s}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Filter size={13} color="var(--color-text-faint)" />
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          {filtered.length} proof{filtered.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Proof grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-faint)' }}>
          <SortAsc size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>No proofs match your filters</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Try adjusting the search or filter options</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((proof, i) => (
            <motion.div
              key={proof.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ProofCard
                proofData={proof}
                validatorAddress="0xMidnightTestnetValidator"
                showRawProof
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
