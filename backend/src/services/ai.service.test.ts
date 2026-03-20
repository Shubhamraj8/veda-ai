import { describe, it, expect, vi } from 'vitest';
import { AIService } from './ai.service';
import { GeneratedPaperSchema } from '../validators/ai.validator';

// Mock the Gemini model
vi.mock('../lib/gemini', () => ({
  geminiModel: {
    generateContent: vi.fn(),
  },
}));

describe('AIService Parser', () => {
  const getService = async () => {
    const { AIService } = await import('./ai.service');
    return new AIService();
  };

  it('should correctly parse a valid JSON response from Gemini', async () => {
    const aiService = await getService();
    const { geminiModel } = await import('../lib/gemini');
    (geminiModel.generateContent as any).mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          sections: [
            {
              title: 'Section A',
              instruction: 'Test instruction',
              questions: [
                {
                  text: 'What is 2+2?',
                  difficulty: 'easy',
                  marks: 1,
                  answerKey: '4',
                },
              ],
            },
          ],
        }),
      },
    });

    const result = await aiService.generateAssignment({
      subject: 'Math',
      totalQuestions: 1,
    });

    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].title).toBe('Section A');
    expect(result.sections[0].questions[0].text).toBe('What is 2+2?');
    expect(result.sections[0].questions[0].answerKey).toBe('4');
  });

  it('should handle markdown fences in the response', async () => {
    const aiService = await getService();
    const { geminiModel } = await import('../lib/gemini');
    (geminiModel.generateContent as any).mockResolvedValue({
      response: {
        text: () => '```json\n{"sections": [{"title": "S1", "questions": [{"text": "Q1", "difficulty": "easy", "marks": 2, "answerKey": "A1"}]}]}\n```',
      },
    });

    const result = await aiService.generateAssignment({
      subject: 'Math',
      totalQuestions: 1,
    });

    expect(result.sections[0].title).toBe('S1');
  });

  it('should throw an error for malformed JSON', async () => {
    const aiService = await getService();
    const { geminiModel } = await import('../lib/gemini');
    (geminiModel.generateContent as any).mockResolvedValue({
      response: {
        text: () => 'Not a JSON',
      },
    });

    await expect(aiService.generateAssignment({
      subject: 'Math',
      totalQuestions: 1,
    })).rejects.toThrow();
  });
});


