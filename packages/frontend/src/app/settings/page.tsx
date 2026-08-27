'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Server, Shield, Database, Save, Zap } from 'lucide-react';
import { usePrivacy } from '@/context/PrivacyContext';

function SettingToggle({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '0.625rem',
      border: '1px solid var(--color-border)',
    }}>
      <div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: checked ? 'var(--color-primary)' : 'var(--color-surface-3)',
          position: 'relative', transition: 'all 0.25s ease', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [network, setNetwork] = useState('testnet');
  const [ipfsProvider, setIpfsProvider] = useState('pinata');
  const [mockMode, setMockMode] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="section-title" style={{ fontSize: '2rem' }}>
          Platform <span className="text-gradient-primary">Settings</span>
        </h1>
        <p className="section-subtitle">
          Configure your ZK engine, network endpoints, and storage providers.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* ZK Engine Settings */}
        <motion.div
          className="card-proof"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(99,102,241,0.1)', borderRadius: '0.5rem' }}>
              <Zap size={20} color="var(--color-primary-light)" />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Zero-Knowledge Engine</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SettingToggle
              label="Mock Proof Generation"
              description="Use mock proofs for faster local development without compiling WASM circuits."
              checked={mockMode}
              onChange={setMockMode}
            />
            
            <div style={{
              padding: '1rem', background: 'rgba(255,255,255,0.02)',
              borderRadius: '0.625rem', border: '1px solid var(--color-border)',
            }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Proving System</label>
              <select className="input" defaultValue="groth16" style={{ background: 'var(--color-surface)', appearance: 'none' }}>
                <option value="groth16">Groth16 (snarkjs 0.7.0)</option>
                <option value="plonk" disabled>PLONK (Coming soon)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Network & Blockchain */}
        <motion.div
          className="card-proof"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(16,185,129,0.1)', borderRadius: '0.5rem' }}>
              <Server size={20} color="var(--color-success)" />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Midnight Network</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              padding: '1rem', background: 'rgba(255,255,255,0.02)',
              borderRadius: '0.625rem', border: '1px solid var(--color-border)',
            }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Active Network</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setNetwork('testnet')}
                  className={`btn btn-sm ${network === 'testnet' ? 'btn-success' : 'btn-ghost'}`}
                  style={{ flex: 1 }}
                >
                  Testnet
                </button>
                <button
                  onClick={() => setNetwork('mainnet')}
                  className={`btn btn-sm ${network === 'mainnet' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1 }}
                  disabled
                >
                  Mainnet (Locked)
                </button>
              </div>
            </div>

            <div style={{
              padding: '1rem', background: 'rgba(255,255,255,0.02)',
              borderRadius: '0.625rem', border: '1px solid var(--color-border)',
            }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>RPC Node URL</label>
              <input className="input" defaultValue="https://rpc.testnet.midnight.network" />
            </div>
          </div>
        </motion.div>

        {/* IPFS Storage */}
        <motion.div
          className="card-proof"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(6,182,212,0.1)', borderRadius: '0.5rem' }}>
              <Database size={20} color="var(--color-cyan)" />
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>IPFS Storage</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              padding: '1rem', background: 'rgba(255,255,255,0.02)',
              borderRadius: '0.625rem', border: '1px solid var(--color-border)',
            }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Pinning Provider</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setIpfsProvider('pinata')}
                  className={`btn btn-sm ${ipfsProvider === 'pinata' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1 }}
                >
                  Pinata Cloud
                </button>
                <button
                  onClick={() => setIpfsProvider('helia')}
                  className={`btn btn-sm ${ipfsProvider === 'helia' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ flex: 1 }}
                >
                  Local Helia Node
                </button>
              </div>
            </div>

            {ipfsProvider === 'pinata' && (
              <div style={{
                padding: '1rem', background: 'rgba(255,255,255,0.02)',
                borderRadius: '0.625rem', border: '1px solid var(--color-border)',
              }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Pinata JWT</label>
                <input className="input" type="password" placeholder="ey..." defaultValue="mock_jwt_token_for_demo" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}
        >
          <button onClick={handleSave} className="btn btn-primary btn-lg" style={{ minWidth: 160 }}>
            {saved ? (
              <>Saved!</>
            ) : (
              <><Save size={18} /> Save Changes</>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
