import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

// Services
import { startCronJobs } from './services/cronService.js';

const app = express();

// ============================================
// Security Middleware
// ============================================
app.use(helmet());
app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ============================================
// General Middleware
// ============================================
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ============================================
// Health Check
// ============================================
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

// ============================================
// API Routes
// ============================================
app.use('/api', routes);

// ============================================
// Error Handling
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🚀 FirmEdge API running on port ${env.PORT} [${env.NODE_ENV}]`);
    console.log(`📡 Health check: http://localhost:${env.PORT}/health`);
  });

  // Start background cron jobs
  if (env.NODE_ENV !== 'test') {
    startCronJobs();
  }
};

startServer().catch(console.error);

export default app;
