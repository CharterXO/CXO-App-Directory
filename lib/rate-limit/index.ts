import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { getRateLimitConfig } from '@/lib/config';

const memoryStore = new Map<string, { tokens: number; last: number }>();

export interface RateLimitResult {
  success: boolean;
  reset: number;
}

export async function limit(identifier: string, max = 5, windowMs = 60_000): Promise<RateLimitResult> {
  const { redisUrl } = getRateLimitConfig();
  if (redisUrl) {
    const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
      ? Redis.fromEnv()
      : process.env.RATE_LIMIT_REDIS_TOKEN
        ? new Redis({ url: redisUrl, token: process.env.RATE_LIMIT_REDIS_TOKEN })
        : null;
    if (redis) {
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(max, `${Math.ceil(windowMs / 1000)} s`)
      });
      const result = await ratelimit.limit(identifier);
      return { success: result.success, reset: result.reset };
    }
  }

  const now = Date.now();
  const entry = memoryStore.get(identifier) ?? { tokens: max, last: now };
  const elapsed = now - entry.last;
  const refill = Math.floor(elapsed / windowMs) * max;
  entry.tokens = Math.min(max, entry.tokens + (refill > 0 ? refill : 0));
  entry.last = now;
  if (entry.tokens <= 0) {
    memoryStore.set(identifier, entry);
    return { success: false, reset: entry.last + windowMs };
  }
  entry.tokens -= 1;
  memoryStore.set(identifier, entry);
  return { success: true, reset: now + windowMs };
}
