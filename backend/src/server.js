import cors from 'cors';
import express from 'express';
import { validateEnvironment } from './config/env.js';
import { supabase } from './config/supabase.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { asyncHandler } from './middleware/asyncHandler.js';

const app = express();
const config = validateEnvironment();
app.disable('x-powered-by');
app.use(cors({ origin: config.frontendUrl.split(',').map((origin) => origin.trim()), methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ success: true, message: 'InsightBot AI backend is running' }));
app.get('/api/health/supabase', asyncHandler(async (req, res, next) => {
  const { error } = await supabase.from('profiles').select('id').limit(1);
  if (error) return next(Object.assign(new Error(`Supabase database check failed: ${error.message}`), { status: 503, publicMessage: 'Supabase is not reachable or database tables are not set up yet.' }));
  return res.json({ success: true, data: { connected: true } });
}));
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  app.listen(config.port, () => {
    console.log(`InsightBot AI backend listening on port ${config.port}`);
    if (config.authMode === 'development' && process.env.NODE_ENV !== 'production') console.warn('Development auth bypass is active. Set DEV_USER_ID to an existing Supabase Auth UUID. Set NODE_ENV=production and AUTH_MODE=supabase before deployment.');
  });
}
start().catch((error) => { console.error('Backend startup failed:', error.message); process.exit(1); });
