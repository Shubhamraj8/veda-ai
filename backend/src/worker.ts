import { connectDB } from './lib/db';
import { redis } from './lib/redis';
import { startAssignmentWorker } from './workers/assignment.worker';
import { startPDFWorker } from './workers/pdf.worker';
import { logger } from './utils/logger';
import mongoose from 'mongoose';

/**
 * Boot the dedicated worker process:
 *  1. Connect MongoDB
 *  2. Confirm Redis
 *  3. Start BullMQ isolated workers
 */
async function bootstrapWorker(): Promise<void> {
  let isShuttingDown = false;

  // These are set only after successful boot. Declared upfront so shutdown can
  // safely run even if a signal arrives during startup.
  let assignmentWorker: ReturnType<typeof startAssignmentWorker> | null = null;
  let pdfWorker: ReturnType<typeof startPDFWorker> | null = null;

  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info('Shutting down BullMQ workers...', {
      signal,
      env: process.env.NODE_ENV,
    });

    try {
      // Close BullMQ workers first to stop processing new jobs.
      await Promise.all([
        assignmentWorker?.close?.(),
        pdfWorker?.close?.(),
      ]);
    } catch (e) {
      logger.error('Error while closing BullMQ workers', {
        error: e instanceof Error ? e.message : String(e),
      });
    }

    try {
      await redis.quit();
    } catch (e) {
      logger.error('Error while quitting Redis', {
        error: e instanceof Error ? e.message : String(e),
      });
    }

    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    } catch (e) {
      logger.error('Error while closing MongoDB connection', {
        error: e instanceof Error ? e.message : String(e),
      });
    }

    process.exit(0);
  };

  // ── Database ──────────────────────────────────
  await connectDB();

  // ── Redis health check ────────────────────────
  try {
    await redis.ping();
    logger.info('✅ Redis ping successful (Worker Process)');
  } catch (err) {
    logger.error('❌ Redis ping failed (Worker Process):', err);
    process.exit(1);
  }

  // ── BullMQ Workers ─────────────────────────────
  assignmentWorker = startAssignmentWorker();
  pdfWorker = startPDFWorker();

  logger.info('🚀 BullMQ workers started', {
    env: process.env.NODE_ENV,
  });

  // ── Graceful shutdown ─────────────────────────
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception in worker process', {
      error: err instanceof Error ? err.message : String(err),
    });
    void shutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection in worker process', {
      reason: reason instanceof Error ? reason.message : String(reason),
    });
    void shutdown('unhandledRejection');
  });
}

bootstrapWorker().catch((err) => {
  logger.error('Worker failed to boot:', err);
  process.exit(1);
});

