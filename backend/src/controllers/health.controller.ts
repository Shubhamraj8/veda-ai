import { type Request, type Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../types/index';

/**
 * Health check controller.
 * Returns server status, uptime, and timestamp.
 */
export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'VedaAI Backend is running',
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});


