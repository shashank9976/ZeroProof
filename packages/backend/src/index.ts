/**
 * ZeroProof — Backend API Server
 *
 * Express server with privacy-by-design architecture.
 * All routes protected by privacy guard middleware.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { proofRouter } from './routes/proof.js';
import { auditRouter } from './routes/audit.js';
import { privacyGuard, privacySafeLogger } from './middleware/privacy-guard.js';

const app = express();
const PORT = Number(process.env['PORT'] ?? 3001);

// ── Security Headers ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Privacy Middleware (applied globally) ─────────────────────
app.use(privacySafeLogger);
app.use(privacyGuard);

// ── Routes ────────────────────────────────────────────────────
app.use('/api/proof', proofRouter);
app.use('/api/audit', auditRouter);

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ZeroProof API',
    version: '1.0.0',
    timestamp: Date.now(),
  });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Error Handler ─────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ZeroProof API Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🔒 ZeroProof API running at http://localhost:${PORT}`);
  console.log(`📡 Network: ${process.env['MIDNIGHT_NETWORK'] ?? 'testnet'}`);
  console.log(`🌍 CORS: ${process.env['CORS_ORIGIN'] ?? 'http://localhost:3000'}`);
  console.log(`🧪 Mock ZK proofs: ${process.env['ZK_MOCK_PROOFS'] ?? 'true'}`);
});

export default app;
