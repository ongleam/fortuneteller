import { redis } from '../../infra/redis/client';

const CACHE_TTL = 60 * 60 * 24 * 3; // 3 days
const CACHE_ENABLED = false;

export const getCachedData = async (key: string): Promise<any | null> => {
  if (!redis || !CACHE_ENABLED) return null;

  try {
    const cachedData = await redis.get(key);
    await redis.expire(key, CACHE_TTL);
    if (cachedData) {
      console.log('[Redis] Cache hit');
      return cachedData;
    }
  } catch (e) {
    console.error(`[Redis] GET error:`, e);
  }
  return null;
};

export const setCachedData = async (cacheKey: string, data: any) => {
  if (!redis || !CACHE_ENABLED) return;

  try {
    await redis.set(cacheKey, data, { ex: CACHE_TTL });
    console.log(`[Redis] Saved to cache: "${cacheKey}"`);
  } catch (e) {
    console.error(`[Redis] SET error:`, e);
  }
};
