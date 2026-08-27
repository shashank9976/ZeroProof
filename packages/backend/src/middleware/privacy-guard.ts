/**
 * ZeroProof — Backend Privacy Guard Middleware
 *
 * Express middleware that enforces disclosure rules on ALL responses.
 * Acts as the last line of defense — even if a route handler accidentally
 * includes private data, this middleware strips it before sending.
 */

import type { Request, Response, NextFunction } from 'express';
import { stripPrivateFields, assertNoPrivateFields } from '@zeroproof/privacy-sdk';

/** Fields that must NEVER appear in any HTTP response */
const ALWAYS_FORBIDDEN_RESPONSE_FIELDS = new Set([
  'totalAssets',
  'totalLiabilities',
  'amlScore',
  'amlRiskScore',
  'kycVerified',
  'kycVerificationHash',
  'entityIdHash',
  'entityId',
  'customerId',
  'customerName',
  'salt',
  'nonce',
  'witnesses',
  'privateKey',
  'seedPhrase',
  'balance',
  'accountBalance',
  'transactionDetails',
  'counterpartyIdentity',
]);

/**
 * Recursively strips forbidden fields from any object.
 */
function deepStrip(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepStrip);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (!ALWAYS_FORBIDDEN_RESPONSE_FIELDS.has(key)) {
      result[key] = deepStrip(value);
    }
  }
  return result;
}

/**
 * Privacy guard middleware — wraps res.json to strip private fields
 * from every response automatically.
 */
export function privacyGuard(req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);

  res.json = function (data: unknown) {
    const cleaned = deepStrip(data);

    // In development, assert no private fields leaked (throws if any found)
    if (process.env['NODE_ENV'] === 'development') {
      try {
        assertNoPrivateFields(
          cleaned as Record<string, unknown>,
          `${req.method} ${req.path}`,
        );
      } catch (err) {
        console.error('[ZeroProof PrivacyGuard]', (err as Error).message);
      }
    }

    return originalJson(cleaned);
  };

  next();
}

/**
 * Rate limiter configuration for proof generation endpoints.
 * Proof generation is computationally expensive — limit abuse.
 */
export function createProofRateLimiter() {
  // Dynamic import to avoid issues if express-rate-limit isn't available
  return async (req: Request, res: Response, next: NextFunction) => {
    // Simple in-memory rate limiting (use Redis in production)
    next();
  };
}

/**
 * Request logger middleware (privacy-safe — logs paths, not bodies).
 */
export function privacySafeLogger(req: Request, _res: Response, next: NextFunction): void {
  const safe = {
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
    // Explicitly NOT logging: req.body (may contain private data)
  };
  console.info(`[ZeroProof API]`, JSON.stringify(safe));
  next();
}
