import { redis } from './redis';
import { logger } from '../utils/logger';

export class CacheService {
  private readonly ttl: number;

  constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds;
  }

  /**
   * Get a value from cache.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error: any) {
      logger.error(`[Cache] Error getting key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set a value in cache with TTL.
   */
  async set(key: string, value: any, ttlOverride?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      await redis.set(key, data, 'EX', ttlOverride || this.ttl);
    } catch (error: any) {
      logger.error(`[Cache] Error setting key ${key}:`, error.message);
    }
  }

  /**
   * Delete a value from cache.
   */
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error: any) {
      logger.error(`[Cache] Error deleting key ${key}:`, error.message);
    }
  }

  /**
   * Delete multiple keys by pattern.
   */
  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error: any) {
      logger.error(`[Cache] Error deleting pattern ${pattern}:`, error.message);
    }
  }
}

export const cacheService = new CacheService();


