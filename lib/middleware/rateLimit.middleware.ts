import { NextRequest } from 'next/server';
import { RateLimitError } from '@/lib/utils/errors';

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};

setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 60000); // Clean up every minute

export function rateLimit(options: {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}) {
  const { maxRequests, windowMs, keyPrefix = 'global' } = options;

  return async (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    if (!store[key] || now > store[key].resetAt) {
      store[key] = { count: 1, resetAt: now + windowMs };
      return;
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      const resetIn = Math.ceil((store[key].resetAt - now) / 1000);
      throw new RateLimitError(`Too many requests. Try again in ${resetIn} seconds`);
    }
  };
}

export const loginRateLimit = rateLimit({
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: 'login'
});

export const apiRateLimit = rateLimit({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: 'api'
});

export const registerRateLimit = rateLimit({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: 'register'
});
