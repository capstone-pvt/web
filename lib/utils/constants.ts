export const APP_NAME = 'Web App';

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days in seconds
  REFRESH_TOKEN_REMEMBER: 30 * 24 * 60 * 60, // 30 days in seconds
} as const;

export const RATE_LIMITS = {
  LOGIN: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 requests per minute
  API: { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  REGISTER: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
