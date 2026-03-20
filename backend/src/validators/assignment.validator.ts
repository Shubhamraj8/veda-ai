import { z } from 'zod';

/**
 * Placeholder Zod schema for assignment creation requests.
 * Expand this when implementing business logic.
 */
export const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(100),
  instructions: z.string().optional(),
  totalMarks: z.number().int().positive().optional(),
  totalQuestions: z.number().int().positive().optional(),
  questionTypes: z
    .array(z.enum(['mcq', 'short-answer', 'long-answer', 'true-false']))
    .optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
  dueDate: z.string().datetime().optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
