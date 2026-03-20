import winston from 'winston';
import { config } from '../config/index';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

/**
 * Custom format for development: colorized, human-readable.
 */
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
  }),
);

/**
 * Production format: structured JSON for log aggregation tools.
 */
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: config.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: { service: 'vedaai-backend' },
  transports: [
    new winston.transports.Console(),
  ],
});


