import { z } from 'zod';

/**
 * Zod schema for validating the Gemini response structure.
 */
export const QuestionSchema = z.object({
  text: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard', 'challenging']),
  marks: z.number().int().positive(),
  answerKey: z.string().min(1),
});

export const SectionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().optional(),
  questions: z.array(QuestionSchema).min(1),
});

export const GeneratedPaperSchema = z.object({
  sections: z.array(SectionSchema).min(1),
});

export type GeneratedPaperType = z.infer<typeof GeneratedPaperSchema>;
export type QuestionType = z.infer<typeof QuestionSchema>;
export type SectionType = z.infer<typeof SectionSchema>;
