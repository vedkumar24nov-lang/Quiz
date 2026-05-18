import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { config } from '@/config';
import { ensureSchema, closeDb } from '@/db/client';
import authRoutes from '@/routes/authRoutes';
import authorRoutes from '@/routes/authorRoutes';
import adminRoutes from '@/routes/adminRoutes';

async function bootstrap() {
  await ensureSchema();

  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, driver: config.dbDriver, env: config.isDev ? 'dev' : 'prod' });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/author', authorRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 for any unmatched /api/* request
  app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Centralized error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status =
      err && typeof err === 'object' && 'status' in err && typeof err.status === 'number'
        ? err.status
        : 500;
    const message = err instanceof Error ? err.message : 'Internal server error';
    if (status >= 500) console.error('[server error]', err);
    res.status(status).json({ error: message });
  });

  const server = app.listen(config.port, () => {
    console.log(`🚀 PrepLab backend listening on http://localhost:${config.port}`);
    console.log(`   CORS allowing: ${config.corsOrigin}`);
    console.log(`   DB driver:     ${config.dbDriver} (${config.dbFile})`);
  });

  // Graceful shutdown
  function shutdown() {
    console.log('\n👋 Shutting down…');
    server.close(() => {
      closeDb();
      process.exit(0);
    });
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
