/**
 * Rate limiter for the render API using sliding window algorithm.
 * Tracks requests per user ID in memory and enforces configurable limits.
 */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

interface RequestRecord {
  timestamps: number[];
}

// In-memory storage for rate limit tracking
const rateLimitStore = new Map<string, RequestRecord>();

// Configuration
const WINDOW_SIZE_MS = 60 * 1000; // 60 seconds
const DEFAULT_LIMIT = 10;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// Cleanup timer reference
let cleanupTimer: NodeJS.Timeout | null = null;

/**
 * Get the rate limit from environment variable or use default
 */
function getRateLimit(): number {
  const envLimit = process.env.RENDER_RATE_LIMIT_PER_MINUTE;
  if (envLimit) {
    const parsed = parseInt(envLimit, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_LIMIT;
}

/**
 * Remove timestamps older than the sliding window
 */
function cleanExpiredTimestamps(timestamps: number[], now: number): number[] {
  const cutoff = now - WINDOW_SIZE_MS;
  return timestamps.filter((ts) => ts > cutoff);
}

/**
 * Clean up expired entries from the rate limit store
 * This prevents memory leaks by removing entries that have no recent requests
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const cutoff = now - WINDOW_SIZE_MS;

  for (const [key, record] of rateLimitStore.entries()) {
    const validTimestamps = record.timestamps.filter((ts) => ts > cutoff);
    if (validTimestamps.length === 0) {
      rateLimitStore.delete(key);
    } else {
      record.timestamps = validTimestamps;
    }
  }
}

/**
 * Start the periodic cleanup timer
 * Called automatically when the module is loaded
 */
function startCleanupTimer(): void {
  if (cleanupTimer === null) {
    cleanupTimer = setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);
    // Don't prevent Node.js from exiting
    cleanupTimer.unref();
  }
}

/**
 * Stop the periodic cleanup timer
 * Useful for testing or graceful shutdown
 */
export function stopCleanupTimer(): void {
  if (cleanupTimer !== null) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

/**
 * Check if a request is allowed under the rate limit
 *
 * @param key - Unique identifier for the rate limit (typically user ID)
 * @returns Rate limit result with allowed status and metadata
 */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const limit = getRateLimit();

  // Get or create record for this key
  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Clean expired timestamps for this key
  record.timestamps = cleanExpiredTimestamps(record.timestamps, now);

  // Calculate remaining requests
  const currentCount = record.timestamps.length;
  const remaining = Math.max(0, limit - currentCount);

  // Calculate reset time (oldest timestamp + window size)
  let resetAt: number;
  if (record.timestamps.length > 0) {
    const oldestTimestamp = Math.min(...record.timestamps);
    resetAt = Math.floor((oldestTimestamp + WINDOW_SIZE_MS) / 1000);
  } else {
    resetAt = Math.floor((now + WINDOW_SIZE_MS) / 1000);
  }

  // Check if request is allowed
  const allowed = currentCount < limit;

  // If allowed, add this request timestamp
  if (allowed) {
    record.timestamps.push(now);
  }

  return {
    allowed,
    limit,
    remaining: allowed ? remaining - 1 : remaining,
    resetAt,
  };
}

// Start periodic cleanup when module is loaded
startCleanupTimer();
