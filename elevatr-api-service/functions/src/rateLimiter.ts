import { HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as dotenv from 'dotenv';

dotenv.config();

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  cleanupIntervalMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute by default
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60'), // 60 requests per minute by default
  cleanupIntervalMs: parseInt(process.env.RATE_LIMIT_CLEANUP_INTERVAL_MS || '3600000'), // 1 hour by default
};

interface RateLimitData {
  count: number;
  resetTime: number;
  lastAccess: number;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private db: admin.firestore.Firestore;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.db = admin.firestore();
    this.startCleanup();
  }

  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(async () => {
      const now = Date.now();
      const cutoff = now - this.config.windowMs;
      try {
        const snapshot = await this.db.collection('rateLimits')
          .where('lastAccess', '<', cutoff)
          .get();
        
        const batch = this.db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      } catch (error) {
        console.error('Error cleaning up rate limits:', error);
      }
    }, this.config.cleanupIntervalMs);
  }

  async checkRateLimit(uid: string): Promise<void> {
    const rateLimitRef = this.db.collection('rateLimits').doc(uid);
    const now = Date.now();
    
    try {
      const doc = await rateLimitRef.get();
      
      if (!doc.exists) {
        await rateLimitRef.set({
          count: 1,
          resetTime: now + this.config.windowMs,
          lastAccess: now
        });
        return;
      }
      
      const data = doc.data() as RateLimitData;
      
      if (now > data.resetTime) {
        await rateLimitRef.set({
          count: 1,
          resetTime: now + this.config.windowMs,
          lastAccess: now
        });
        return;
      }
      
      if (data.count >= this.config.maxRequests) {
        throw new HttpsError(
          'resource-exhausted',
          'Rate limit exceeded. Please try again later.',
          { retryAfter: Math.ceil((data.resetTime - now) / 1000) }
        );
      }
      
      await rateLimitRef.update({
        count: admin.firestore.FieldValue.increment(1),
        lastAccess: now
      });
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      console.error('Rate limit check failed:', error);
    }
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export a default instance with default config
export const rateLimiter = new RateLimiter();
export const checkRateLimit = (uid: string) => rateLimiter.checkRateLimit(uid); 