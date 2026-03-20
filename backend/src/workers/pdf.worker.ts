import { Worker, type Job } from 'bullmq';
import { redis } from '../lib/redis';
import { logger } from '../utils/logger';
import { Assignment } from '../models/assignment.model';
import { GeneratedPaper } from '../models/generated-paper.model';
import { pdfService } from '../services/pdf.service';
import type { PDFJobData } from '../jobs/pdf.job';

/**
 * PDF worker — generates exam-style PDFs from AI-generated papers.
 */
export function startPDFWorker(): Worker<PDFJobData> {
  const worker = new Worker<PDFJobData>(
    'pdf-generation',
    async (job: Job<PDFJobData>) => {
      const { assignmentId } = job.data;
      logger.info(`[PDF-Worker] Starting PDF generation for assignment ${assignmentId}`);

      try {
        const [assignment, paper] = await Promise.all([
          Assignment.findById(assignmentId),
          GeneratedPaper.findOne({ assignmentId }),
        ]);

        if (!assignment || !paper) {
          logger.error(`[PDF-Worker] Assignment or Paper not found for ${assignmentId}`);
          return;
        }

        // Generate PDF
        const fileUrl = await pdfService.generate(assignment, paper as any);

        // Update assignment with file URL
        await Assignment.findByIdAndUpdate(assignmentId, { fileUrl });

        logger.info(`[PDF-Worker] PDF generated and stored for assignment ${assignmentId}: ${fileUrl}`);
      } catch (error: any) {
        logger.error(`[PDF-Worker] Job ${job.id} failed:`, error.message);
        throw error;
      }
    },
    {
      connection: redis as any,
      concurrency: 2,
    }
  );

  logger.info('✅ PDF worker started');
  return worker;
}


