import { QueueEvents } from 'bullmq';
import { redis } from '../lib/redis';
import { getIO } from './index';
import { logger } from '../utils/logger';

/**
 * Initialize BullMQ QueueEvents to bridge job updates to WebSockets.
 * This runs in the main API process and listens to the global Redis event stream.
 */
export function initQueueEvents(): void {
  const queueEvents = new QueueEvents('assignment-generation', {
    connection: redis as any,
  });

  /**
   * Extract assignmentId from jobId (format: 'assignment-ID')
   */
  const getAssignmentId = (jobId: string) => jobId.replace('assignment-', '');

  // 1. Job Started (active)
  queueEvents.on('active', ({ jobId }) => {
    const assignmentId = getAssignmentId(jobId);
    logger.debug(`[WS] Job ${jobId} active. Emitting generation_started to room assignment:${assignmentId}`);
    getIO().to(`assignment:${assignmentId}`).emit('generation_started', {
      assignmentId,
      status: 'processing',
    });
  });

  // 2. Job Progress
  queueEvents.on('progress', ({ jobId, data }) => {
    const assignmentId = getAssignmentId(jobId);
    logger.debug(`[WS] Job ${jobId} progress: ${data}%. Emitting to room assignment:${assignmentId}`);
    getIO().to(`assignment:${assignmentId}`).emit('generation_progress', {
      assignmentId,
      progress: data,
    });
  });

  // 3. Job Completed
  queueEvents.on('completed', ({ jobId }) => {
    const assignmentId = getAssignmentId(jobId);
    logger.info(`[WS] Job ${jobId} completed. Emitting generation_completed to room assignment:${assignmentId}`);
    getIO().to(`assignment:${assignmentId}`).emit('generation_completed', {
      assignmentId,
      status: 'completed',
    });
  });

  // 4. Job Failed
  queueEvents.on('failed', ({ jobId, failedReason }) => {
    const assignmentId = getAssignmentId(jobId);
    logger.error(`[WS] Job ${jobId} failed. Emitting generation_failed to room assignment:${assignmentId}`);
    getIO().to(`assignment:${assignmentId}`).emit('generation_failed', {
      assignmentId,
      status: 'failed',
      error: failedReason,
    });
  });

  logger.info('✅ BullMQ QueueEvents bridge initialized');
}


