import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './modules/auth/auth.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Load .env file manually (avoid dotenv dependency)
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const app = express();

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '1mb' }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Try again in 15 minutes.',
  },
});

// Apply rate limiter to auth routes
app.use('/api/auth', authLimiter);

// Auth routes
app.use('/api/auth', authRoutes);

// Serve static client files
app.use(express.static(join(__dirname, '..', '..', 'client')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route — serve login page
app.get('/', (_req, res) => {
  res.sendFile(join(__dirname, '..', '..', 'client', 'index.html'));
});

// Global error handler
app.use(errorHandler);

export default app;
