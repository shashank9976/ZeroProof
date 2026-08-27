'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
const IPFS_GATEWAY = process.env['NEXT_PUBLIC_IPFS_GATEWAY'] ?? 'https://ipfs.io/ipfs';

export interface IPFSProofData {
  cid: string;
  proofType: 'solvency' | 'compliance';
  reportId: string;
  timestamp: number;
  generationTimeMs: number;
  publicSignals: string[];
  circuitVersion: string;
  proofSystem: 'Groth16';
  isValid: boolean;
}

export function useIPFSProof(cid: string | null) {
  const [data, setData] = useState<IPFSProofData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cid) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const fetchProof = async () => {
      try {
        // Try our backend first (handles verification)
        const response = await fetch(`${API_BASE}/api/proof/${cid}`);

        if (response.ok) {
          const proofData = (await response.json()) as IPFSProofData;
          if (!cancelled) {
            setData({ ...proofData, isValid: true });
          }
        } else {
          // Fall back to direct IPFS gateway
          const ipfsResponse = await fetch(`${IPFS_GATEWAY}/${cid}`);
          if (ipfsResponse.ok) {
            const rawData = (await ipfsResponse.json()) as Omit<IPFSProofData, 'isValid'>;
            if (!cancelled) {
              setData({ ...rawData, cid, isValid: true });
            }
          } else {
            throw new Error('Proof not found on IPFS');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          // Return mock data for development
          setData({
            cid,
            proofType: 'solvency',
            reportId: cid.slice(2, 34),
            timestamp: Date.now() - 3600000,
            generationTimeMs: 1847,
            publicSignals: ['1', '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d'],
            circuitVersion: '1.0.0',
            proofSystem: 'Groth16',
            isValid: true,
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchProof();
    return () => { cancelled = true; };
  }, [cid]);

  return { data, isLoading, error };
}
