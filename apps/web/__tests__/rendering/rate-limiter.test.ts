import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit, stopCleanupTimer } from '@/lib/rendering/rate-limiter';

describe('rate-limiter', () => {
  afterEach(() => {
    stopCleanupTimer();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    // Reset module state by clearing the internal store
    // We use different keys per test to avoid cross-test contamination
    delete process.env.RENDER_RATE_LIMIT_PER_MINUTE;
  });

  it('allows requests under the limit', () => {
    const result = checkRateLimit('test-user-allow');
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(10);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it('tracks remaining requests accurately', () => {
    const key = 'test-user-remaining';
    const first = checkRateLimit(key);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(9);

    const second = checkRateLimit(key);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(8);
  });

  it('blocks requests when limit is exceeded', () => {
    const key = 'test-user-block';
    process.env.RENDER_RATE_LIMIT_PER_MINUTE = '3';

    // Make 3 allowed requests
    for (let i = 0; i < 3; i++) {
      const result = checkRateLimit(key);
      expect(result.allowed).toBe(true);
    }

    // 4th request should be blocked
    const blocked = checkRateLimit(key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('respects custom rate limit from environment', () => {
    process.env.RENDER_RATE_LIMIT_PER_MINUTE = '2';
    const key = 'test-user-custom';

    const first = checkRateLimit(key);
    expect(first.limit).toBe(2);
    expect(first.remaining).toBe(1);

    const second = checkRateLimit(key);
    expect(second.limit).toBe(2);
    expect(second.remaining).toBe(0);

    const third = checkRateLimit(key);
    expect(third.allowed).toBe(false);
  });

  it('uses default limit for invalid env value', () => {
    process.env.RENDER_RATE_LIMIT_PER_MINUTE = 'invalid';
    const result = checkRateLimit('test-user-invalid-env');
    expect(result.limit).toBe(10);
  });

  it('isolates rate limits per key', () => {
    process.env.RENDER_RATE_LIMIT_PER_MINUTE = '1';

    const resultA = checkRateLimit('user-a');
    expect(resultA.allowed).toBe(true);

    const resultB = checkRateLimit('user-b');
    expect(resultB.allowed).toBe(true);

    // user-a is now blocked
    const resultA2 = checkRateLimit('user-a');
    expect(resultA2.allowed).toBe(false);

    // user-b is also blocked
    const resultB2 = checkRateLimit('user-b');
    expect(resultB2.allowed).toBe(false);
  });

  it('provides resetAt as unix timestamp in seconds', () => {
    const result = checkRateLimit('test-user-reset');
    expect(typeof result.resetAt).toBe('number');
    // resetAt should be approximately 60 seconds from now
    const nowSeconds = Math.floor(Date.now() / 1000);
    expect(result.resetAt).toBeGreaterThan(nowSeconds);
    expect(result.resetAt).toBeLessThanOrEqual(nowSeconds + 61);
  });

  it('allows requests after window expires', () => {
    const key = 'test-user-expire';
    process.env.RENDER_RATE_LIMIT_PER_MINUTE = '1';

    const first = checkRateLimit(key);
    expect(first.allowed).toBe(true);

    // Mock time to advance past the window
    const originalNow = Date.now;
    vi.spyOn(Date, 'now').mockReturnValue(originalNow() + 61_000);

    const afterExpiry = checkRateLimit(key);
    expect(afterExpiry.allowed).toBe(true);

    vi.spyOn(Date, 'now').mockRestore();
  });
});
