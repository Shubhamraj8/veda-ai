import { assignmentQueue } from '../queues/index';
import { logger } from '../utils/logger';
import { JobTracking, JOB_STATUS } from '../models/job-tracking.model';

export interface AssignmentJobData {
  assignmentId: string;
  subject: string;
  instructions?: string;
  totalQuestions?: number;
  questionTypes?: string[];
  difficulty?: string;
}

/**
 * Enqueue an assignment generation job and create its JobTracking record.
 */
export async function addAssignmentJob(data: AssignmentJobData): Promise<string> {
  const jobId = `assignment-${data.assignmentId}`;

  // 1. Create JobTracking record with ACTIVE status initially
  await JobTracking.create({
    jobId,
    status: JOB_STATUS.ACTIVE,
    progress: 0,
  });

  // 2. Add to BullMQ
  const job = await assignmentQueue.add('generate', data, {
    jobId,
  });

  logger.info(`Assignment job enqueued: ${job.id}`);
  return job.id!;
}


