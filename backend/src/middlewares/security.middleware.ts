import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Global API rate limiter.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again later.',
  },
});

/**
 * Stricter rate limiter for resource-heavy AI generation.
 */
export const generationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 generations per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'AI generation limit reached for this hour. Please try again later.',
  },
});

/**
 * Request ID middleware to trace requests across the system.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

/**
 * Input sanitization (NoSQL injection protection).
 */
// express-mongo-sanitize mutates `req.query`, but Express 5 exposes `req.query`
// as a read-only getter (runtime crash: "Cannot set property query ...").
// To stay secure without breaking runtime, we sanitize `req.body` and `req.params`.
export const sanitizeMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const sanitizeFn = (mongoSanitize as unknown as { sanitize?: (target: unknown, options?: unknown) => unknown })
    .sanitize;

  // If the sanitize function isn't available for some reason, fail-open (don't crash).
  if (typeof sanitizeFn !== 'function') return next();

  try {
    if (req.body) {
      req.body = sanitizeFn(req.body) as typeof req.body;
    }
    if (req.params) {
      req.params = sanitizeFn(req.params) as typeof req.params;
    }
  } catch (e) {
    logger.warn?.('mongoSanitize failed; continuing without sanitization.', {
      error: e instanceof Error ? e.message : String(e),
    });
  }

  next();
};


