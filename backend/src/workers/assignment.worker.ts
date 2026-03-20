import { Worker, type Job } from 'bullmq';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';
import { aiService } from '../services/ai.service';
import { Assignment, ASSIGNMENT_STATUS } from '../models/assignment.model';
import { GeneratedPaper } from '../models/generated-paper.model';
import type { AssignmentJobData } from '../jobs/assignment.job';
import { JobTracking, JOB_STATUS } from '../models/job-tracking.model';

/**
 * Assignment worker — processes jobs from the assignment queue.
 */
export function startAssignmentWorker(): Worker<AssignmentJobData> {
  const worker = new Worker<AssignmentJobData>(
    'assignment-generation',
    async (job: Job<AssignmentJobData>) => {
      const { assignmentId } = job.data;
      logger.info(`[Worker] Starting job ${job.id} for assignment ${assignmentId}`);

      try {
        // 1. Fetch assignment and check existence
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
          logger.warn(`[Worker] Assignment ${assignmentId} not found. Skipping job ${job.id}.`);
          return;
        }

        // 2. Idempotency Check: Skip if already completed or has a paper
        const existingPaper = await GeneratedPaper.findOne({ assignmentId });
        if (assignment.status === ASSIGNMENT_STATUS.COMPLETED || existingPaper) {
          logger.info(`[Worker] Assignment ${assignmentId} already processed. Mark job as completed.`);
          await job.updateProgress(100);
          await JobTracking.updateOne({ jobId: job.id }, { progress: 100, status: JOB_STATUS.COMPLETED });
          return;
        }

        // 3. Update status to PROCESSING
        await job.updateProgress(10);
        await Promise.all([
          JobTracking.updateOne({ jobId: job.id }, { progress: 10, status: JOB_STATUS.ACTIVE }),
          Assignment.findByIdAndUpdate(assignmentId, { status: ASSIGNMENT_STATUS.PROCESSING }),
        ]);

        // 4. AIService generation
        logger.info(`[Worker] Calling AI service for assignment ${assignmentId}`);
        const generatedData = await aiService.generateAssignment({
          subject: assignment.title,
          instructions: assignment.instructions,
          totalQuestions: assignment.totalQuestions,
          questionTypes: assignment.questionTypes,
        });

        await job.updateProgress(70);
        await JobTracking.updateOne({ jobId: job.id }, { progress: 70 });

        // 5. Atomic Storage of Generated Paper
        await GeneratedPaper.create({
          assignmentId,
          sections: generatedData.sections,
          metadata: {
            generatedAt: new Date(),
            model: 'gemini-1.5-flash',
            attempts: job.attemptsMade + 1,
          },
        });

        // 4. Enqueue PDF generation job
        const { addPDFJob } = await import('../jobs/pdf.job');
        await addPDFJob({ assignmentId: (assignmentId as unknown as string) });

        // 5. Final success updates
        await job.updateProgress(100);
        await Promise.all([
          JobTracking.updateOne({ jobId: job.id }, { progress: 100, status: JOB_STATUS.COMPLETED }),
          Assignment.findByIdAndUpdate(assignmentId, { status: ASSIGNMENT_STATUS.COMPLETED }),
          import('../lib/cache').then(({ cacheService }) => cacheService.del(`assignment:${assignmentId}`)),
        ]);

        logger.info(`[Worker] Job ${job.id} for assignment ${assignmentId} finished successfully`);
      } catch (error: any) {
        logger.error(`[Worker] Job ${job.id} failed for assignment ${assignmentId}:`, error.message);
        
        // Handle failure state in DB
        const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts || 1);
        
        if (isLastAttempt) {
          await Promise.all([
            Assignment.findByIdAndUpdate(assignmentId, { status: ASSIGNMENT_STATUS.FAILED }),
            JobTracking.updateOne(
              { jobId: job.id },
              { status: JOB_STATUS.FAILED, error: error.message || 'Maximum retries reached' }
            ),
          ]);
        } else {
          // If not last attempt, just log the error but keep status as processing for retry
          await JobTracking.updateOne(
            { jobId: job.id },
            { error: `Attempt ${job.attemptsMade + 1} failed: ${error.message}` }
          );
        }
        
        throw error; // Re-throw to trigger BullMQ retry logic
      }
    },
    {
      connection: redis as any, // Cast needed: ioredis version mismatch with BullMQ's bundled ioredis types
      concurrency: 3, // Process up to 3 jobs in parallel
    },
  );

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', async (job, err) => {
    logger.error(`Job ${job?.id} failed:`, err);
    if (job?.id) {
      await JobTracking.updateOne(
        { jobId: job.id },
        { status: JOB_STATUS.FAILED, error: err.message }
      );
    }
  });

  worker.on('error', (err) => {
    logger.error('Worker error:', err);
  });

  logger.info('✅ Assignment worker started');
  return worker;
}


