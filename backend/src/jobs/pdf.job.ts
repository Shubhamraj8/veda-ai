import { pdfQueue } from '../queues/index';
import { logger } from '../utils/logger';

export interface PDFJobData {
  assignmentId: string;
}

/**
 * Enqueue a PDF generation job.
 */
export async function addPDFJob(data: PDFJobData): Promise<string> {
  const jobId = `pdf-${data.assignmentId}`;

  const job = await pdfQueue.add('generate-pdf', data, {
    jobId,
  });

  logger.info(`PDF generation job enqueued: ${job.id}`);
  return job.id!;
}


