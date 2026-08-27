'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Upload, Shield, Lock, Plus, CheckCircle,
  FileText, Zap, Clock, Building2,
} from 'lucide-react';
import { useWorkplace } from '@/context/WorkplaceContext';
import { useWorkplaceProof } from '@/hooks/useWorkplaceProof';
import { usePrivacy } from '@/context/PrivacyContext';
import { CredentialCard } from '@/components/Workplace/CredentialCard';
import { CredentialAccessManager } from '@/components/Workplace/CredentialAccessManager';
import { VerificationBadge } from '@/components/Workplace/VerificationBadge';
import type { ConsentScope } from '@/types/workplace';

type Tab = 'records' | 'consents' | 'proofs';

// ── Upload Simulator ──────────────────────────────────────────

function UploadDropzone({ onUpload }: { onUpload: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [encrypting, setEncrypting] = useState(false);
  const [done, setDone] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setEncrypting(true);
    await new Promise((r) => setTimeout(r, 1800));
    setEncrypting(false);
    setDone(true);
    await new Promise((r) => setTimeout(r, 1200));
    setDone(false);
    onUpload();
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--color-primary)' : done ? 'var(--color-success)' : 'var(--color-border)'}`,
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        background: dragging
          ? 'rgba(10,132,255,0.05)'
          : done
          ? 'rgba(16,185,129,0.05)'
          : 'var(--color-surface)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    >
      {encrypting ? (
        <div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
            <Lock size={28} color="var(--color-primary-light)" />
          </motion.div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-primary-light)', marginTop: '0.75rem', fontWeight: 600 }}>
            Encrypting client-side…
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Raw values never leave your device
          </div>
        </div>
      ) : done ? (
        <div>
          <CheckCircle size={28} color="var(--color-success)" />
          <div style={{ fontSize: '0.875rem', color: 'var(--color-success-light)', marginTop: '0.75rem', fontWeight: 600 }}>
            Uploaded to IPFS encrypted ✓
          </div>
        </div>
      ) : (
        <div>
          <Upload size={28} color="var(--color-text-faint)" />
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', fontWeight: 600 }}>
            Drop credential document to encrypt & upload
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-faint)', marginTop: '0.25rem' }}>
            PDF, PNG, XML — encrypted in-browser before upload
          </div>
          <button
            onClick={onUpload}
            style={{
              marginTop: '1rem', padding: '0.5rem 1.25rem',
              background: 'var(--color-primary)', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.8125rem', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            }}
          >
            <Plus size={13} /> Add Sample Record
          </button>
        </div>
      )}
    </div>
  );
}

// ── Proof Generator Modal ─────────────────────────────────────

function ProofModal({ recordId, onClose }: { recordId: string; onClose: () => void }) {
  const { credentialRecords } = useWorkplace();
  const { proofState, generateCredentialValidityProof, reset } = useWorkplaceProof();
  const record = credentialRecords.find((r) => r.id === recordId);

  const [companyId, setCompanyId] = useState('comp-acme');
  const [scope, setScope] = useState<ConsentScope[]>(['credential_valid', 'credential_category']);

  const isWorking = proofState.status === 'generating' || proofState.status === 'uploading';
  const isDone = proofState.status === 'done';

  const toggleScope = (s: ConsentScope) => {
    setScope((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const allScopes: { value: ConsentScope; label: string }[] = [
    { value: 'credential_valid', label: 'Validity Attestation' },
    { value: 'credential_category', label: 'Category details' },
    { value: 'verification_date', label: 'Verification Date' },
    { value: 'field_disclosure', label: 'Disclose fields' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: 460,
          background: 'var(--color-surface)',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.125rem' }}>
              Generate ZK Proof
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              {record?.name ?? 'Credential Record'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-faint)', padding: '4px' }}>✕</button>
        </div>

        {!isDone ? (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '0.5rem' }}>
                Company / Employer ID <span style={{ color: 'var(--color-text-faint)', fontWeight: 400 }}>(recipient)</span>
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="input"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <option value="comp-acme">Acme Corporation</option>
                <option value="comp-initech">Initech Systems</option>
                <option value="comp-hooli">Hooli Inc.</option>
                <option value="comp-pied">Pied Piper</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: '0.625rem' }}>
                Disclosure Scope <span style={{ color: 'var(--color-text-faint)', fontWeight: 400 }}>(what they can verify)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {allScopes.map(({ value, label }) => {
                  const isSelected = scope.includes(value);
                  return (
                    <button
                      key={value}
                      onClick={() => toggleScope(value)}
                      style={{
                        padding: '0.3125rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem', fontWeight: 600,
                        border: `1px solid ${isSelected ? 'rgba(10,132,255,0.4)' : 'var(--color-border)'}`,
                        background: isSelected ? 'rgba(10,132,255,0.12)' : 'transparent',
                        color: isSelected ? 'var(--color-primary-light)' : 'var(--color-text-faint)',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {isWorking && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                  <span>{proofState.status === 'generating' ? 'Generating ZK proof…' : 'Uploading to IPFS…'}</span>
                  <span>{proofState.progress}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${proofState.progress}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>
            )}

            <button
              onClick={() => generateCredentialValidityProof({ recordId: recordId, consentScope: scope, companyId })}
              disabled={isWorking || scope.length === 0}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isWorking ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Zap size={15} /></motion.div> Generating…</> : <><Shield size={15} /> Generate ZK Proof</>}
            </button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle size={40} color="var(--color-success)" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.375rem' }}>Proof Generated!</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Pinned to IPFS · {proofState.generationTimeMs}ms · Raw values mathematically hidden
            </div>
            <button onClick={() => { reset(); onClose(); }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              Done
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function EmployeePage() {
  const [activeTab, setActiveTab] = useState<Tab>('records');
  const [proofModalRecord, setProofModalRecord] = useState<string | null>(null);
  const { credentialRecords, addCredentialRecord } = useWorkplace();
  const { proofs } = usePrivacy();

  const workplaceProofs = proofs.filter((p) =>
    ['credential-validity', 'disclosure-proof'].includes(p.proofType)
  );

  const handleAddSample = () => {
    addCredentialRecord({
      id: `cred-${crypto.randomUUID().substring(0, 8)}`,
      category: 'identity',
      name: 'US Passport Attestation',
      encryptedAt: Date.now(),
      verifiedDate: Date.now() - 3600000,
      status: 'encrypted',
      consentCount: 0,
      isValid: true,
      verifierName: 'US Dept of State',
    });
  };

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: 'records', label: 'My Credentials', icon: FileText, count: credentialRecords.length },
    { id: 'consents', label: 'Active Consents', icon: Building2 },
    { id: 'proofs', label: 'ZK Proofs', icon: Shield, count: workplaceProofs.length },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={22} color="var(--color-primary-light)" strokeWidth={2} />
          </div>
          <div>
            <h1 className="section-title" style={{ fontSize: '1.75rem', marginBottom: 0 }}>
              Employee <span style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Vault</span>
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
              Your encrypted background, identity and work certifications — you control who can verify what
            </p>
          </div>
        </div>

        {/* Privacy guarantee */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.875rem',
          padding: '0.875rem 1.25rem',
          background: 'rgba(10,132,255,0.05)',
          border: '1px solid rgba(10,132,255,0.15)',
          borderRadius: '10px', flexWrap: 'wrap',
        }}>
          <Lock size={15} color="var(--color-primary-light)" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', flex: 1 }}>
            <strong style={{ color: 'var(--color-primary-light)' }}>Your credentials stay encrypted.</strong>{' '}
            Raw documents and details never appear on-chain. Employers receive only ZK proofs — mathematical guarantees with zero data leakage.
          </span>
          <div className="badge badge-primary" style={{ fontSize: '0.6875rem', flexShrink: 0 }}>
            <Shield size={10} /> Employee-Controlled
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}
      >
        {[
          { icon: FileText, label: 'Stored Credentials', value: credentialRecords.length, color: '#06b6d4' },
          { icon: Building2, label: 'Granted Companies', value: credentialRecords.reduce((a, r) => a + r.consentCount, 0), color: '#10b981' },
          { icon: Shield, label: 'ZK Proofs Generated', value: workplaceProofs.length, color: '#6366f1' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="stat-card" style={{ padding: '1rem 1.125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Icon size={14} color={color} />
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-faint)', fontWeight: 500 }}>{label}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>{value}</div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--color-surface-2)', borderRadius: '10px', padding: '3px', marginBottom: '1.25rem' }}>
          {tabs.map(({ id, label, icon: Icon, count }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  flex: 1, padding: '0.5625rem',
                  borderRadius: '8px',
                  border: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                  background: isActive ? 'var(--color-surface)' : 'transparent',
                  color: isActive ? 'var(--color-text)' : 'var(--color-text-faint)',
                  fontSize: '0.8125rem', fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                }}
              >
                <Icon size={13} />
                {label}
                {count !== undefined && count > 0 && (
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 700, minWidth: 18, height: 18,
                    background: isActive ? 'var(--color-primary)' : 'var(--color-surface-3)',
                    color: isActive ? 'white' : 'var(--color-text-faint)',
                    borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingInline: '4px',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'records' && (
            <motion.div key="records" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <UploadDropzone onUpload={handleAddSample} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                {credentialRecords.map((record, i) => (
                  <CredentialCard
                    key={record.id}
                    record={record}
                    index={i}
                    onGenerateProof={(id) => setProofModalRecord(id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'consents' && (
            <motion.div key="consents" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ marginBottom: '1rem', padding: '0.875rem 1rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                <strong style={{ color: 'var(--color-success-light)' }}>Consent auto-revokes</strong> at expiry. You can revoke any company's access at any time with one click — even mid-session.
              </div>
              <CredentialAccessManager />
            </motion.div>
          )}

          {activeTab === 'proofs' && (
            <motion.div key="proofs" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {workplaceProofs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <Shield size={32} color="var(--color-text-faint)" style={{ margin: '0 auto 0.75rem' }} />
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>No credential proofs yet</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Go to "My Credentials" tab and generate a ZK proof for any verified document
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {workplaceProofs.map((proof, i) => (
                    <VerificationBadge key={proof.id} proof={proof} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Proof modal */}
      <AnimatePresence>
        {proofModalRecord && (
          <ProofModal recordId={proofModalRecord} onClose={() => setProofModalRecord(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
