import { GeneratedPaperType, GeneratedPaperSchema } from '../validators/ai.validator';
import { geminiModel } from '../lib/gemini';
import { logger } from '../utils/logger';
import { AppError } from '../types/index';
import httpStatus from 'http-status-codes';

export class AIService {
  constructor(
    private readonly model: any = geminiModel
  ) {}


  /**
   * Generate an assessment using Gemini.
   */
  async generateAssignment(params: {
    subject: string;
    instructions?: string;
    totalQuestions?: number;
    questionTypes?: string[];
    difficulty?: string;
  }): Promise<GeneratedPaperType> {
    const { subject, instructions, totalQuestions = 10, questionTypes = ['Short Answer'], difficulty = 'medium' } = params;

    // 1. Build the prompt
    const prompt = `
      You are a senior academic expert and examiner from a prestigious school like Delhi Public School. 
      Generate a professional assessment paper for the subject: "${subject}".
      
      Requirements:
      - Total Questions: ${totalQuestions}
      - Difficulty Level: ${difficulty}
      - Question Types: ${questionTypes.join(', ')}
      ${instructions ? `- Additional Instructions: ${instructions}` : ''}
      
      Formatting Rules for Questions:
      - Each question must have a difficulty level: "easy", "medium", "hard", or "challenging".
      - Each question must have associated marks.
      - Each question MUST have a clear, detailed "answerKey" explaining the correct answer or solution.

      Output Format:
      You MUST return ONLY a JSON object with the following structure:
      {
        "sections": [
          {
            "title": "Section Title (e.g., Section A: Short Answer Questions)",
            "instruction": "Specific instruction (e.g., Attempt all questions. Each question carries 2 marks)",
            "questions": [
              {
                "text": "The actual question text",
                "difficulty": "easy | medium | hard | challenging",
                "marks": number,
                "answerKey": "The detailed answer or solution for this specific question"
              }
            ]
          }
        ]
      }

      Ensure the total number of questions across all sections equals exactly ${totalQuestions}.
      The questions should be high quality, relevant, and follow the requested difficulty distribution.
    `;

    try {
      logger.info(`Sending prompt to Gemini for subject: ${subject}`);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 2. Parse and Validate
      let jsonResponse: unknown;
      try {
        const cleanJson = text.replace(/```json|```/g, '').trim();
        jsonResponse = JSON.parse(cleanJson);
      } catch (parseError) {
        logger.error('Failed to parse Gemini JSON response:', parseError);
        logger.debug('Raw response text:', text);
        throw new AppError('AI generated a malformed response', httpStatus.INTERNAL_SERVER_ERROR);
      }

      const validatedData = GeneratedPaperSchema.safeParse(jsonResponse);

      if (!validatedData.success) {
        logger.error('AI output validation failed:', validatedData.error);
        throw new AppError('AI generated an invalid data structure', httpStatus.INTERNAL_SERVER_ERROR);
      }

      return validatedData.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      logger.error('Gemini API Error:', error);
      throw new AppError('Failed to generate assignment using AI', httpStatus.SERVICE_UNAVAILABLE);
    }
  }
}

export const aiService = new AIService();


