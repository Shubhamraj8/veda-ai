import dotenv from 'dotenv';
import path from 'path';
import { envSchema, type EnvConfig } from './env';

// Load .env only for local/dev usage.
// In production, prefer environment variables injected by the platform/container.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

/**
 * Parse and validate environment variables.
 * Throws a descriptive error at startup if validation fails.
 */
function loadConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(formatted, null, 2));
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();

