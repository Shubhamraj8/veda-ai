import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index';
import { logger } from '../utils/logger';

/**
 * Gemini AI client — singleton instance.
 * Models should be obtained via `gemini.getGenerativeModel({ model: '...' })`.
 */
export const gemini = new GoogleGenerativeAI(config.GEMINI_API_KEY);

/**
 * Pre-configured Gemini model for JSON generation.
 * Uses 1.5-flash for speed and reliability in extraction.
 */
export const geminiModel = gemini.getGenerativeModel({
  model: config.GEMINI_MODEL,
  generationConfig: {
    responseMimeType: 'application/json',
  },
});

logger.info('✅ Gemini AI client initialized with JSON output config');


