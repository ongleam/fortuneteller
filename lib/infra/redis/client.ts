// lib/redis/client.ts
import { Redis } from '@upstash/redis';

let redisInstance: Redis | null = null;

const initializeRedis = (): Redis | null => {
  const upstashUrl = process.env.UPSTASH_URL;
  const upstashKey = process.env.UPSTASH_KEY;

  if (upstashUrl && upstashKey) {
    try {
      const client = new Redis({
        url: upstashUrl,
        token: upstashKey,
      });
      // 간단한 PING 테스트로 연결 확인 (선택 사항)
      client
        .ping()
        .then((pong) => {
          if (pong === 'PONG') {
            console.log(`[REDIS] Upstash Redis client initialized and connected successfully.`);
          } else {
            console.warn(`[REDIS] Upstash Redis PING test failed, received: ${pong}`);
          }
        })
        .catch((pingError) => {
          console.error(`[REDIS] Upstash Redis PING test error:`, pingError);
        });
      return client;
    } catch (error) {
      console.error(`[REDIS] Failed to initialize Upstash Redis client:`, error);
      return null;
    }
  } else {
    console.warn(
      `[REDIS] UPSTASH_URL or UPSTASH_KEY not found in environment variables. Redis client will not be initialized.`
    );
    return null;
  }
};

// 모듈이 로드될 때 Redis 클라이언트를 한 번만 초기화합니다 (싱글톤 패턴).
if (!redisInstance) {
  redisInstance = initializeRedis();
}

export const redis = redisInstance;
