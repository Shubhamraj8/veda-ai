import { z } from 'zod';

/**
 * Zod schema for validating all required environment variables at startup.
 * The app will fail fast with a clear error if any variable is missing/invalid.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required'),

  REDIS_URL: z
    .string()
    .min(1, 'REDIS_URL is required'),

  GEMINI_API_KEY: z
    .string()
    .min(1, 'GEMINI_API_KEY is required'),

  GEMINI_MODEL: z
    .string()
    .min(1)
    .default('gemini-flash-latest'),

  CORS_ORIGIN: z
    .string()
    .default('*')
    // Accept comma-separated values: "https://a.com,https://b.com"
    .transform((val) => val.split(',').map((s) => s.trim()).filter(Boolean)),

  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'debug'])
    .default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;
