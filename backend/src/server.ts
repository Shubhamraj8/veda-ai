import http from 'http';
import { config } from './config/index';
import { logger } from './utils/logger';
import { createApp } from './app';
import { connectDB } from './lib/db';
import { redis } from './lib/redis';
import { initWebSocket } from './websocket/index';
import { initQueueEvents } from './websocket/events';

/**
 * Boot the entire server:
 *  1. Connect MongoDB
 *  2. Confirm Redis
 *  3. Start Express + HTTP server
 *  4. Attach Socket.IO
 *  5. Listen for traffic
 */
async function bootstrap(): Promise<void> {
  // ── Database ──────────────────────────────────
  await connectDB();

  // ── Redis health check ────────────────────────
  try {
    await redis.ping();
    logger.info('✅ Redis ping successful');
  } catch (err) {
    logger.error('❌ Redis ping failed:', err);
    process.exit(1);
  }

  // ── Express + HTTP server ─────────────────────
  const app = createApp();
  const httpServer = http.createServer(app);

  // ── WebSocket ─────────────────────────────────
  initWebSocket(httpServer);
  initQueueEvents();

  // ── Start listening ───────────────────────────
  httpServer.listen(config.PORT, () => {
    logger.info(`🚀 VedaAI Backend listening`, {
      port: config.PORT,
      env: config.NODE_ENV,
      corsOrigin: config.CORS_ORIGIN,
    });
  });

  // ── Graceful shutdown ─────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully...`);

    // Stop accepting new connections
    httpServer.close(() => {
      logger.info('HTTP server closed');
    });

    // Close Redis
    await redis.quit();
    logger.info('Redis connection closed');

    // Close MongoDB
    const mongoose = await import('mongoose');
    await mongoose.default.connection.close();
    logger.info('MongoDB connection closed');

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled rejections
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
