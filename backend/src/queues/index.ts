import { Queue } from 'bullmq';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';

/**
 * BullMQ queue for assignment generation jobs.
 * Configured for horizontal scaling and reliability.
 */
export const assignmentQueue = new Queue('assignment-generation', {
  connection: redis as any,
  defaultJobOptions: {
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

/**
 * BullMQ queue for PDF generation jobs.
 */
export const pdfQueue = new Queue('pdf-generation', {
  connection: redis as any,
  defaultJobOptions: {
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
  },
});

assignmentQueue.on('error', (err) => logger.error('Assignment queue error:', err));
pdfQueue.on('error', (err) => logger.error('PDF queue error:', err));

logger.info('✅ Assignment & PDF queues initialized');


