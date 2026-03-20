import mongoose from 'mongoose';
import { config } from '../config/index';
import { logger } from '../utils/logger';

/**
 * Connect to MongoDB Atlas.
 * Retries are handled by Mongoose's built-in buffering.
 */
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}


