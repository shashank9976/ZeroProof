# ZeroProof API Documentation

Base URL: `http://localhost:3001`

All endpoints are protected by the privacy guard middleware — private fields are automatically stripped from every response.

---

## Proof Endpoints

### POST `/api/proof/solvency`

Generate a ZK proof that total assets exceed total liabilities.

**Privacy:** `totalAssets` and `totalLiabilities` are processed locally in the ZK circuit. They are NEVER logged or stored.

**Request Body:**
```json
{
  "totalAssets": "1000000000",
  "totalLiabilities": "800000000",
  "entityAddress": "0x000...000"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `totalAssets` | `string` | ✅ | Total assets in cents (use string to preserve precision) |
| `totalLiabilities` | `string` | ✅ | Total liabilities in cents |
| `entityAddress` | `string` | — | On-chain entity identifier |

**Response `201`:**
```json
{
  "success": true,
  "attestation": {
    "isSolvent": true,
    "reportId": "a1b2c3d4e5f6...",
    "commitmentHash": "0x7f3a9b...",
    "timestamp": 1720000000000,
    "ipfsCid": "QmYwAPJzv5CZsnA625s3...",
    "generationTimeMs": 1847
  },
  "ipfs": {
    "cid": "QmYwAPJzv5CZsnA625s3...",
    "url": "https://gateway.pinata.cloud/ipfs/QmYw..."
  }
}
```

**What is NOT returned:** `totalAssets`, `totalLiabilities`, `salt`, or any raw financial data.

---

### POST `/api/proof/compliance`

Generate a ZK proof of KYC identity verification and AML screening.

**Privacy:** `entityIdHash`, `kycVerified`, and `amlScore` are processed in the ZK circuit. The entity's real identity is never transmitted.

**Request Body:**
```json
{
  "entityIdHash": "123456789012345678901234567890",
  "kycVerified": 1,
  "amlScore": 15,
  "amlThreshold": 30,
  "validityDays": 365
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `entityIdHash` | `string` | ✅ | Poseidon hash of entity's real ID (computed client-side) |
| `kycVerified` | `0 \| 1` | ✅ | KYC provider's verification status |
| `amlScore` | `number` | ✅ | AML risk score 0-100 |
| `amlThreshold` | `number` | — | Max acceptable score (default: 30) |
| `validityDays` | `number` | — | Attestation validity period (default: 365) |

**Response `201`:**
```json
{
  "success": true,
  "attestation": {
    "kycPassed": true,
    "amlPassed": true,
    "fullyCompliant": true,
    "attestationId": "b2c3d4e5f6...",
    "timestamp": 1720000000000,
    "validUntil": 1751536000000,
    "ipfsCid": "QmT4AewhW7Ls...",
    "generationTimeMs": 3214
  },
  "ipfs": {
    "cid": "QmT4AewhW7Ls...",
    "url": "https://gateway.pinata.cloud/ipfs/QmT4..."
  }
}
```

---

### GET `/api/proof/:cid`

Fetch proof bundle metadata from IPFS by CID.

**Response `200`:**
```json
{
  "cid": "QmYwAPJzv5CZsn...",
  "proofType": "solvency",
  "reportId": "a1b2c3...",
  "timestamp": 1720000000000,
  "generationTimeMs": 1847,
  "publicSignals": ["1", "0x7f3a9b..."],
  "circuitVersion": "1.0.0",
  "proofSystem": "Groth16"
}
```

---

### GET `/api/proof/verify/:cid`

Cryptographically verify a proof by CID.

**Response `200`:**
```json
{
  "cid": "QmYwAPJzv5CZsn...",
  "isValid": true,
  "proofType": "solvency",
  "timestamp": 1720000000000,
  "publicSignals": ["1", "0x7f3a9b..."]
}
```

---

## Audit Endpoints

### GET `/api/audit/status`

Platform-level compliance statistics (anonymized).

**Response `200`:**
```json
{
  "platform": "ZeroProof",
  "version": "1.0.0",
  "totalProofsGenerated": 42,
  "proofSystem": "Groth16",
  "network": "testnet",
  "privacyModel": {
    "disclosed": ["compliance_status", "attestation_valid", "ipfs_cid"],
    "proven": ["solvency_verified", "kyc_completed", "aml_cleared"],
    "hidden": ["account_balances", "transaction_details", "counterparty_identities"]
  }
}
```

### GET `/api/audit/report/:entityAddress`

Full audit report for a specific entity (public data only).

### GET `/api/audit/history`

Recent proof events (anonymized — no entity addresses).

---

## Health Check

### GET `/health`

```json
{ "status": "ok", "service": "ZeroProof API", "version": "1.0.0" }
```

---

## Error Responses

| Code | Meaning |
|---|---|
| 400 | Invalid request body (see `details` field) |
| 404 | Proof not found |
| 500 | Internal error (proof generation failed) |

All errors: `{ "error": "Description" }`
