export type ModerationAction = 'safe' | 'warning' | 'block';

export interface ModerationResult {
  action: ModerationAction;
  reason: string;
}

interface CachedModeration {
  result: ModerationResult;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 200;

// Simple in-memory cache keyed by message content hash
const moderationCache = new Map<string, CachedModeration>();

function hashMessage(message: string): string {
  // Simple hash for cache key — normalized lowercase trimmed
  return message.trim().toLowerCase();
}

function pruneCache(): void {
  if (moderationCache.size <= MAX_CACHE_SIZE) return;

  const now = Date.now();
  const entries = Array.from(moderationCache.entries());

  // Remove expired entries first
  for (const [key, cached] of entries) {
    if (now - cached.timestamp > CACHE_TTL_MS) {
      moderationCache.delete(key);
    }
  }

  // If still over limit, remove oldest entries
  if (moderationCache.size > MAX_CACHE_SIZE) {
    const sorted = Array.from(moderationCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = sorted.slice(0, sorted.length - MAX_CACHE_SIZE);
    for (const [key] of toRemove) {
      moderationCache.delete(key);
    }
  }
}

export const moderationService = {
  /**
   * Moderate a chat message using the AI moderation API.
   * Results are cached to avoid re-checking duplicate messages.
   */
  async moderateMessage(
    message: string,
    streamId: string
  ): Promise<ModerationResult> {
    const cacheKey = hashMessage(message);

    // Check cache
    const cached = moderationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.result;
    }

    try {
      const response = await fetch('/api/ai/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          streamContext: `Stream ID: ${streamId}`,
        }),
      });

      if (!response.ok) {
        console.error('Moderation API error:', response.status);
        return { action: 'safe', reason: 'Moderation service unavailable' };
      }

      const result: ModerationResult = await response.json();

      // Cache the result
      moderationCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });
      pruneCache();

      return result;
    } catch (err) {
      console.error('Moderation service error:', err);
      return { action: 'safe', reason: 'Moderation service error' };
    }
  },

  /** Clear the moderation cache */
  clearCache(): void {
    moderationCache.clear();
  },
};
