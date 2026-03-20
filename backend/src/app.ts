import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index';
import routes from './routes/index';
import healthRoutes from './routes/health.route';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';
import path from 'path';

/**
 * Express application factory.
 * Wires up all middleware, routes, and the error handler.
 */
import {
  globalRateLimiter,
  requestIdMiddleware,
  sanitizeMiddleware
} from './middlewares/security.middleware';

export function createApp(): express.Application {
  const app = express();

  // Basic security and tracing
  app.use(requestIdMiddleware);
  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );
  app.use(globalRateLimiter);
  app.use(sanitizeMiddleware);
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // ── Static files ──────────────────────────────
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // ── HTTP request logging ──────────────────────
  app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] as string | undefined;
    const start = Date.now();

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      logger.http(`${req.method} ${req.url}`, {
        requestId,
        statusCode: res.statusCode,
        durationMs,
      });
    });

    next();
  });

  // ── API routes ────────────────────────────────
  // Health check route always available at root level
  app.use('/health', healthRoutes);
  app.use('/api/v1/health', healthRoutes);

  // All other routes prefixed with /api/v1
  app.use('/api/v1', routes);

  // ── 404 catch-all ─────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });

  // ── Centralized error handler ─────────────────
  app.use(errorHandler);

  return app;
}

