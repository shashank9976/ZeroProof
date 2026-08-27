'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, UserCheck, Copy, Check, ChevronDown, ChevronUp,
  ExternalLink, Lock, Cpu, Globe, Search, SlidersHorizontal,
  Eye, EyeOff
} from 'lucide-react';
import type { StoredProof } from '@/context/PrivacyContext';
import { usePrivacy } from '@/context/PrivacyContext';

/* ── Types ─────────────────────────────────────────────────── */
type FilterType = 'all' | 'solvency' | 'compliance';
type StatusFilter = 'all' | 'PASSED' | 'FAILED';

const DisclosureRules = {
  FINANCE: {
    can_disclose: ['compliance_status', 'attestation_valid', 'ipfs_cid', 'proof_timestamp', 'proof_type', 'generation_time_ms', 'commitment_hash'],
    must_prove: ['solvency_verified', 'kyc_completed', 'aml_cleared', 'sanctions_checked', 'entity_authenticated'],
    must_hide: ['account_balances', 'transaction_details', 'counterparty_identities', 'aml_score', 'entity_id', 'asset_amounts', 'liability_amounts', 'salt', 'private_keys'],
  },
} as const;

/* ── Helpers ───────────────────────────────────────────────── */
function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateFull(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

/* ── CopyButton ────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
        color: copied ? 'var(--color-success)' : 'var(--color-text-faint)',
        display: 'flex', alignItems: 'center',
        transition: 'color 0.15s ease',
        borderRadius: '4px',
      }}
      title="Copy"
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

/* ── StatusDot ─────────────────────────────────────────────── */
function StatusDot({ passed }: { passed: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: passed ? 'var(--color-success)' : 'var(--color-danger)',
        flexShrink: 0,
        display: 'inline-block',
      }} />
      <span style={{
        fontSize: '0.6875rem', fontWeight: 500,
        color: passed ? 'var(--color-success)' : 'var(--color-danger)',
        letterSpacing: '0.02em',
      }}>
        {passed ? 'Passed' : 'Failed'}
      </span>
    </span>
  );
}

/* ── Proof Row ─────────────────────────────────────────────── */
function ProofRow({ proof, index }: { proof: StoredProof; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isPassed = proof.status === 'PASSED';
  const isCompliance = proof.proofType === 'compliance';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Main Row ── */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'grid',
          gridTemplateColumns: '36px 1fr 120px 100px 32px',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.875rem 1.25rem',
          borderBottom: '1px solid var(--color-border)',
          cursor: 'pointer',
          transition: 'background 0.12s ease',
          background: expanded ? 'var(--color-surface-2)' : 'transparent',
        }}
        onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'; }}
        onMouseLeave={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        {/* Icon */}
        <div style={{
          width: 32, height: 32, borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-surface-2)',
          flexShrink: 0,
        }}>
          {isCompliance
            ? <UserCheck size={14} color="var(--color-text-muted)" strokeWidth={1.5} />
            : <Shield size={14} color="var(--color-text-muted)" strokeWidth={1.5} />}
        </div>

        {/* Name + meta */}
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)', marginBottom: '0.1875rem' }}>
            {isCompliance ? 'KYC / AML Compliance' : 'Solvency Verification'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)' }}>
              {formatDate(proof.timestamp)}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
              color: 'var(--color-text-faint)', opacity: 0.7,
            }}>
              {proof.attestationId.slice(0, 14)}…
            </span>
          </div>
        </div>

        {/* Status */}
        <div><StatusDot passed={isPassed} /></div>

        {/* Type badge */}
        <div>
          <span style={{
            fontSize: '0.6875rem', fontWeight: 500,
            color: 'var(--color-text-muted)',
            background: 'var(--color-surface-2)',
            padding: '0.1875rem 0.5rem',
            borderRadius: '4px',
            textTransform: 'capitalize',
            fontFamily: 'var(--font-mono)',
          }}>
            {proof.proofType}
          </span>
        </div>

        {/* Expand chevron */}
        <div style={{ color: 'var(--color-success)', display: 'flex', justifyContent: 'center' }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* ── Expanded Detail Panel ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '1.5rem 1.25rem 1.75rem',
              background: 'var(--color-surface-2)',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
              }}>

                {/* Left column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* Verification */}
                  <div>
                    <div style={{
                      fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em',
                      textTransform: 'uppercase', color: 'var(--color-text-faint)',
                      marginBottom: '0.75rem',
                    }}>
                      Verification
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <DetailRow label="Audit status" value={<StatusDot passed={isPassed} />} />
                      <DetailRow label="Result" value={proof.status} mono />
                      <DetailRow label="Generated" value={formatDateFull(proof.timestamp)} />
                      {proof.validUntil && (
                        <DetailRow
                          label="Valid until"
                          value={new Date(proof.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        />
                      )}
                    </div>
                  </div>

                  {/* KYC/AML specific */}
                  {isCompliance && (
                    <div>
                      <div style={{
                        fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em',
                        textTransform: 'uppercase', color: 'var(--color-text-faint)',
                        marginBottom: '0.75rem',
                      }}>
                        Compliance Checks
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {proof.kycPassed !== undefined && (
                          <DetailRow label="KYC" value={<StatusDot passed={proof.kycPassed} />} />
                        )}
                        {proof.amlPassed !== undefined && (
                          <DetailRow label="AML" value={<StatusDot passed={proof.amlPassed} />} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Privacy */}
                  <div>
                    <div style={{
                      fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em',
                      textTransform: 'uppercase', color: 'var(--color-text-faint)',
                      marginBottom: '0.75rem',
                    }}>
                      Privacy
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <DetailRow
                        label="Private values"
                        value={
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Lock size={10} color="var(--color-text-faint)" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Not disclosed</span>
                          </span>
                        }
                      />
                      <DetailRow label="Disclosure" value="Per FINANCE profile" />
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* Cryptographic */}
                  <div>
                    <div style={{
                      fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em',
                      textTransform: 'uppercase', color: 'var(--color-text-faint)',
                      marginBottom: '0.75rem',
                    }}>
                      Cryptographic
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <DetailRow label="ZK time" value={`${proof.generationTimeMs}ms`} mono />
                      <DetailRow label="Engine" value="Groth16 · circom 2.1.6" mono />
                    </div>
                  </div>

                  {/* Attestation ID */}
                  <div>
                    <div style={{
                      fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em',
                      textTransform: 'uppercase', color: 'var(--color-text-faint)',
                      marginBottom: '0.5rem',
                    }}>
                      Attestation ID
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--color-surface)',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                        color: 'var(--color-text-muted)', flex: 1,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {proof.attestationId}
                      </span>
                      <CopyButton text={proof.attestationId} />
                    </div>
                  </div>

                  {/* Storage */}
                  <div>
                    <div style={{
                      fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em',
                      textTransform: 'uppercase', color: 'var(--color-text-faint)',
                      marginBottom: '0.5rem',
                    }}>
                      IPFS Storage
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--color-surface)',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                    }}>
                      <Globe size={11} color="var(--color-text-faint)" />
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                        color: 'var(--color-text-muted)', flex: 1,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {proof.ipfsCid}
                      </span>
                      <CopyButton text={proof.ipfsCid} />
                      <a
                        href={`https://ipfs.io/ipfs/${proof.ipfsCid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ color: 'var(--color-text-faint)', display: 'flex' }}
                      >
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>

                  {/* Commitment hash */}
                  {proof.commitmentHash && (
                    <div>
                      <div style={{
                        fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em',
                        textTransform: 'uppercase', color: 'var(--color-text-faint)',
                        marginBottom: '0.5rem',
                      }}>
                        Poseidon Commitment
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--color-surface)',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                          color: 'var(--color-text-muted)', flex: 1,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {proof.commitmentHash}
                        </span>
                        <CopyButton text={proof.commitmentHash} />
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginTop: '0.375rem' }}>
                        Auditor can verify with preimage. Raw values remain private.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── DetailRow helper ──────────────────────────────────────── */
function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{
        fontSize: '0.75rem', color: 'var(--color-text-faint)',
        minWidth: '96px', flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '0.75rem', color: 'var(--color-text-muted)',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      }}>
        {value}
      </span>
    </div>
  );
}

/* ── Privacy Panel ─────────────────────────────────────────── */
function PrivacyPanel() {
  const {
    showIpfsCid, showTimestamps, showGenerationTime,
    toggleShowIpfsCid, toggleShowTimestamps, toggleShowGenerationTime,
    disclosureLevel, setDisclosureLevel,
  } = usePrivacy();

  const rules = DisclosureRules.FINANCE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Disclosure Level */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{
          fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em',
          textTransform: 'uppercase', color: 'var(--color-text-faint)',
          marginBottom: '0.75rem',
        }}>
          Disclosure Level
        </div>
        <div style={{
          display: 'flex',
          background: 'var(--color-surface-2)',
          borderRadius: '7px',
          padding: '2px',
          gap: '2px',
        }}>
          {(['auditor', 'regulator', 'internal'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setDisclosureLevel(level)}
              style={{
                flex: 1, padding: '0.375rem',
                borderRadius: '5px',
                background: disclosureLevel === level ? 'var(--color-surface)' : 'transparent',
                border: disclosureLevel === level ? '1px solid var(--color-border)' : '1px solid transparent',
                color: disclosureLevel === level ? 'var(--color-text)' : 'var(--color-text-faint)',
                fontSize: '0.75rem', fontWeight: disclosureLevel === level ? 500 : 400,
                cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {level}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginTop: '0.625rem', lineHeight: 1.5 }}>
          {disclosureLevel === 'auditor' && 'Compliance status and IPFS CIDs only'}
          {disclosureLevel === 'regulator' && 'Compliance verdicts and timestamps'}
          {disclosureLevel === 'internal' && 'All public proof metadata visible'}
        </div>
      </div>

      {/* Optional Disclosures */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{
          fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em',
          textTransform: 'uppercase', color: 'var(--color-text-faint)',
          marginBottom: '0.75rem',
        }}>
          Optional Disclosures
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { label: 'IPFS Proof CID', description: 'Immutable proof receipt', value: showIpfsCid, toggle: toggleShowIpfsCid },
            { label: 'Proof Timestamps', description: 'When each proof was generated', value: showTimestamps, toggle: toggleShowTimestamps },
            { label: 'Generation Time', description: 'ZK computation speed', value: showGenerationTime, toggle: toggleShowGenerationTime },
          ].map(({ label, description, value, toggle }, i, arr) => (
            <div
              key={label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.625rem 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>{label}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', marginTop: '0.0625rem' }}>{description}</div>
              </div>
              {/* Compact toggle */}
              <button
                onClick={toggle}
                style={{
                  width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: value ? 'var(--color-primary)' : 'var(--color-surface-3)',
                  position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: value ? 18 : 2,
                  width: 16, height: 16, borderRadius: '50%', background: 'white',
                  transition: 'left 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Disclosure Rules */}
      <div style={{ padding: '1rem 1.25rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '0.875rem',
        }}>
          <div style={{
            fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em',
            textTransform: 'uppercase', color: 'var(--color-text-faint)',
          }}>
            Disclosure Rules
          </div>
          <span style={{
            fontSize: '0.625rem', fontWeight: 500,
            color: 'var(--color-text-faint)',
            background: 'var(--color-surface-2)',
            padding: '0.125rem 0.375rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
          }}>
            FINANCE
          </span>
        </div>

        {/* Can disclose */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Can disclose to auditors</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', paddingLeft: '0.875rem' }}>
            {rules.can_disclose.map(f => (
              <span key={f} style={{
                fontSize: '0.625rem', fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-faint)',
                background: 'var(--color-surface-2)',
                padding: '0.125rem 0.375rem',
                borderRadius: '3px',
              }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Must prove */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Must prove (zero-knowledge)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', paddingLeft: '0.875rem' }}>
            {rules.must_prove.map(f => (
              <span key={f} style={{
                fontSize: '0.625rem', fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-faint)',
                background: 'var(--color-surface-2)',
                padding: '0.125rem 0.375rem',
                borderRadius: '3px',
              }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Must hide */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-danger)', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Must never disclose</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', paddingLeft: '0.875rem' }}>
            {rules.must_hide.map(f => (
              <span key={f} style={{
                fontSize: '0.625rem', fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-faint)',
                background: 'var(--color-surface-2)',
                padding: '0.125rem 0.375rem',
                borderRadius: '3px',
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main ProofManager Page ─────────────────────────────────── */
export default function ProofsPage() {
  const { proofs } = usePrivacy();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showPrivacyPanel, setShowPrivacyPanel] = useState(true);

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
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: '2rem',
      }}>
        <div>
          <p style={{
            fontSize: '0.6875rem', fontWeight: 500,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--color-text-faint)', marginBottom: '0.375rem',
          }}>
            ZeroProof
          </p>
          <h1 style={{
            fontSize: '1.625rem', fontWeight: 600,
            letterSpacing: '-0.02em', color: 'var(--color-text)', lineHeight: 1.1,
          }}>
            Proof Manager
          </h1>
          <p style={{
            fontSize: '0.875rem', color: 'var(--color-text-muted)',
            marginTop: '0.375rem', fontWeight: 400,
          }}>
            All generated ZK proofs with IPFS receipts.
          </p>
        </div>
        <button
          onClick={() => setShowPrivacyPanel(!showPrivacyPanel)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.8125rem', fontWeight: 500,
            color: showPrivacyPanel ? 'var(--color-primary)' : 'var(--color-text-faint)',
            background: showPrivacyPanel ? 'var(--color-primary-subtle)' : 'transparent',
            border: '1px solid',
            borderColor: showPrivacyPanel ? 'var(--color-primary-glow)' : 'var(--color-border)',
            borderRadius: '6px', padding: '0.4375rem 0.875rem', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {showPrivacyPanel ? <Eye size={13} /> : <EyeOff size={13} />}
          Privacy Controls
        </button>
      </div>

      {/* ── Layout ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showPrivacyPanel ? '1fr 280px' : '1fr',
        gap: '1.25rem',
        alignItems: 'start',
      }}>

        {/* ── LEFT: Proof List ── */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '10px',
          overflow: 'hidden',
        }}>

          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.875rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
              <Search size={13} style={{
                position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-faint)', pointerEvents: 'none',
              }} />
              <input
                style={{
                  width: '100%', paddingLeft: '2.25rem', paddingRight: '0.75rem',
                  paddingTop: '0.4375rem', paddingBottom: '0.4375rem',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '0.8125rem', color: 'var(--color-text)',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  boxSizing: 'border-box',
                }}
                placeholder="Search by ID or CID…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />

            {/* Type filter */}
            <div style={{ display: 'flex', gap: '2px', background: 'var(--color-surface-2)', padding: '2px', borderRadius: '6px' }}>
              {(['all', 'solvency', 'compliance'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  style={{
                    padding: '0.3125rem 0.625rem',
                    borderRadius: '4px',
                    background: typeFilter === f ? 'var(--color-surface)' : 'transparent',
                    border: typeFilter === f ? '1px solid var(--color-border)' : '1px solid transparent',
                    color: typeFilter === f ? 'var(--color-text)' : 'var(--color-text-faint)',
                    fontSize: '0.75rem', fontWeight: typeFilter === f ? 500 : 400,
                    cursor: 'pointer', textTransform: 'capitalize',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div style={{ display: 'flex', gap: '2px', background: 'var(--color-surface-2)', padding: '2px', borderRadius: '6px' }}>
              {(['all', 'PASSED', 'FAILED'] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '0.3125rem 0.625rem',
                    borderRadius: '4px',
                    background: statusFilter === s ? 'var(--color-surface)' : 'transparent',
                    border: statusFilter === s ? '1px solid var(--color-border)' : '1px solid transparent',
                    color: statusFilter === s
                      ? s === 'PASSED' ? 'var(--color-success)' : s === 'FAILED' ? 'var(--color-danger)' : 'var(--color-text)'
                      : 'var(--color-text-faint)',
                    fontSize: '0.75rem', fontWeight: statusFilter === s ? 500 : 400,
                    cursor: 'pointer', textTransform: 'capitalize',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Result count */}
            <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-faint)', whiteSpace: 'nowrap' }}>
              {filtered.length} proof{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr 120px 100px 32px',
            gap: '1rem',
            padding: '0.625rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
          }}>
            {['', 'Proof', 'Status', 'Type', ''].map((h, i) => (
              <div key={i} style={{
                fontSize: '0.6875rem', fontWeight: 500,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'var(--color-text-faint)',
              }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '4rem 2rem',
              color: 'var(--color-text-faint)',
            }}>
              <SlidersHorizontal size={28} strokeWidth={1.5} style={{ marginBottom: '0.75rem', opacity: 0.4, display: 'block', margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>No proofs match your filters</p>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>Try adjusting the search or filter options</p>
            </div>
          ) : (
            <div>
              {filtered.map((proof, i) => (
                <ProofRow key={proof.id} proof={proof} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Privacy Panel ── */}
        <AnimatePresence>
          {showPrivacyPanel && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                overflow: 'hidden',
                position: 'sticky',
                top: '1.5rem',
              }}
            >
              {/* Panel header */}
              <div style={{
                padding: '0.875rem 1.25rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <Lock size={13} color="var(--color-text-faint)" strokeWidth={1.5} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                  Privacy Controls
                </span>
              </div>
              <PrivacyPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
