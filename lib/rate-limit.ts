// ===== Simple In-Memory Rate Limiter =====

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries lazily (only when checking, not with setInterval)
let lastCleanup = Date.now();
function cleanupIfNeeded() {
  const now = Date.now();
  // Clean every 60 seconds
  if (now - lastCleanup < 60000) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export const RATE_LIMITS = {
  // API endpoints
  api: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 requests per minute
  // Chat API (more restrictive)
  chat: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  // Auth endpoints
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
} as const;

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number; maxRequests: number } {
  cleanupIfNeeded();
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
      maxRequests: config.maxRequests,
    };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limited
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        maxRequests: config.maxRequests,
      };
  }

  // Increment count
    entry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
      maxRequests: config.maxRequests,
    };
}

export function getRateLimitHeaders(
  result: ReturnType<typeof checkRateLimit>
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.maxRequests ?? 0),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
  };
}
