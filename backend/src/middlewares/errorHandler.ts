import { type Request, type Response, type NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../types/index';
import { logger } from '../utils/logger';
import { config } from '../config/index';

/**
 * Centralized error handler — the last middleware in the Express chain.
 * Logs the error and returns a structured JSON response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = _req.headers['x-request-id'] as string | undefined;

  // If it's a known operational error, use its status code
  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message}`, {
      statusCode: err.statusCode,
      stack: err.stack,
      requestId,
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unknown / programming errors
  logger.error('Unexpected error:', {
    message: err.message,
    stack: err.stack,
    requestId,
  });

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message:
      config.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
  });
}


