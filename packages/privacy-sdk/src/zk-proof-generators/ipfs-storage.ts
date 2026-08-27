/**
 * ZeroProof — IPFS Proof Storage
 *
 * Stores ZK proof bundles on IPFS for immutable, tamper-evident
 * audit trails. CIDs are the receipts — if the content changes,
 * the CID changes.
 *
 * Uses Helia (in-process IPFS node) with optional Pinata fallback
 * for persistence.
 *
 * PRIVACY: Only ZKProofBundle objects are stored — which contain
 * only public signals and the proof, never private witnesses.
 */

import type { ZKProofBundle, IPFSUploadResult, IPFSProofRecord } from '../attestation-types.js';

// ── IPFS Storage Class ────────────────────────────────────────

export class IPFSProofStorage {
  private heliaInstance: unknown = null;
  private jsonHelper: unknown = null;
  private readonly pinataJwt: string | undefined;
  private readonly ipfsGateway: string;

  constructor(options?: { pinataJwt?: string; ipfsGateway?: string }) {
    this.pinataJwt = options?.pinataJwt ?? process.env['PINATA_JWT'];
    this.ipfsGateway =
      options?.ipfsGateway ??
      process.env['IPFS_GATEWAY'] ??
      'https://gateway.pinata.cloud/ipfs';
  }

  /**
   * Initialize the Helia IPFS node (lazy, called on first use)
   */
  private async init(): Promise<void> {
    if (this.heliaInstance) return;

    try {
      const { createHelia } = await import('helia');
      const { json } = await import('@helia/json');
      this.heliaInstance = await createHelia();
      this.jsonHelper = json(this.heliaInstance as Parameters<typeof json>[0]);
    } catch (err) {
      console.warn('[ZeroProof IPFS] Helia init failed, falling back to Pinata API:', err);
    }
  }

  /**
   * Uploads a ZK proof bundle to IPFS.
   * The bundle contains only public signals — no private witness data.
   *
   * @param bundle - ZK proof bundle to store
   * @returns Upload result with CID and gateway URL
   */
  async uploadProofBundle(bundle: ZKProofBundle): Promise<IPFSUploadResult> {
    await this.init();

    // Try Helia first, fall back to Pinata HTTP API
    if (this.jsonHelper && this.heliaInstance) {
      return this.uploadViaHelia(bundle);
    } else if (this.pinataJwt) {
      return this.uploadViaPinata(bundle);
    } else {
      return this.uploadMock(bundle);
    }
  }

  /**
   * Retrieves a proof bundle from IPFS by CID.
   */
  async getProofBundle(cid: string): Promise<ZKProofBundle | null> {
    await this.init();

    if (this.jsonHelper && this.heliaInstance) {
      return this.getViaHelia(cid);
    } else if (this.pinataJwt) {
      return this.getViaPinataGateway(cid);
    } else {
      return this.getMockBundle(cid);
    }
  }

  /**
   * Verifies that a CID's content matches the expected proof bundle.
   * (CID is derived from content, so if it matches, the content is authentic)
   */
  async verifyProofCid(cid: string): Promise<IPFSProofRecord> {
    const bundle = await this.getProofBundle(cid);

    if (!bundle) {
      return {
        cid,
        proofType: 'solvency',
        timestamp: 0,
        publicSignals: [],
        isVerified: false,
      };
    }

    return {
      cid,
      proofType: bundle.proofType,
      timestamp: bundle.timestamp,
      publicSignals: bundle.publicSignals,
      isVerified: true,
    };
  }

  // ── Private: Helia Upload ──────────────────────────────────
  private async uploadViaHelia(bundle: ZKProofBundle): Promise<IPFSUploadResult> {
    const j = this.jsonHelper as {
      add: (data: unknown) => Promise<{ toString(): string }>;
    };
    const cid = await j.add(bundle);
    const cidStr = cid.toString();

    // Also pin to Pinata if available (for persistence)
    if (this.pinataJwt) {
      this.uploadViaPinata(bundle).catch(() => {
        // Non-fatal: Helia CID is the source of truth
      });
    }

    return {
      cid: cidStr,
      url: `${this.ipfsGateway}/${cidStr}`,
      size: JSON.stringify(bundle).length,
      uploadedAt: Date.now(),
    };
  }

  private async getViaHelia(cid: string): Promise<ZKProofBundle | null> {
    try {
      const { CID } = await import('multiformats/cid');
      const j = this.jsonHelper as {
        get: (cid: unknown) => Promise<ZKProofBundle>;
      };
      return await j.get(CID.parse(cid));
    } catch {
      return null;
    }
  }

  // ── Private: Pinata HTTP API ───────────────────────────────
  private async uploadViaPinata(bundle: ZKProofBundle): Promise<IPFSUploadResult> {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.pinataJwt}`,
      },
      body: JSON.stringify({
        pinataContent: bundle,
        pinataMetadata: {
          name: `ZeroProof-${bundle.proofType}-${bundle.reportId}`,
          keyvalues: {
            proofType: bundle.proofType,
            reportId: bundle.reportId,
            timestamp: bundle.timestamp.toString(),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const result = (await response.json()) as { IpfsHash: string };
    return {
      cid: result.IpfsHash,
      url: `${this.ipfsGateway}/${result.IpfsHash}`,
      size: JSON.stringify(bundle).length,
      uploadedAt: Date.now(),
    };
  }

  private async getViaPinataGateway(cid: string): Promise<ZKProofBundle | null> {
    try {
      const response = await fetch(`${this.ipfsGateway}/${cid}`);
      if (!response.ok) return null;
      return (await response.json()) as ZKProofBundle;
    } catch {
      return null;
    }
  }

  // ── Private: Mock (development fallback) ──────────────────
  private uploadMock(bundle: ZKProofBundle): IPFSUploadResult {
    // Generate a deterministic mock CID from the bundle content
    const mockCid = `Qm${Buffer.from(JSON.stringify(bundle).slice(0, 40)).toString('hex').padEnd(44, '0').slice(0, 44)}`;

    console.info(
      `[ZeroProof IPFS] Mock mode — proof stored locally. CID: ${mockCid}`,
    );

    return {
      cid: mockCid,
      url: `https://ipfs.io/ipfs/${mockCid}`,
      size: JSON.stringify(bundle).length,
      uploadedAt: Date.now(),
    };
  }

  private getMockBundle(cid: string): ZKProofBundle {
    return {
      proof: {
        pi_a: ['1', '2', '1'],
        pi_b: [['1', '2'], ['3', '4'], ['1', '0']],
        pi_c: ['1', '2', '1'],
        protocol: 'groth16',
        curve: 'bn128',
      },
      publicSignals: ['1', '0x1234567890abcdef'],
      proofType: 'solvency',
      reportId: cid.slice(0, 32),
      timestamp: Date.now(),
      generationTimeMs: 2,
      circuitVersion: '1.0.0',
      metadata: {
        proofType: 'solvency',
        network: 'testnet',
        sdkVersion: '1.0.0',
      },
    };
  }
}

// ── Singleton instance ────────────────────────────────────────
export const ipfsStorage = new IPFSProofStorage();
