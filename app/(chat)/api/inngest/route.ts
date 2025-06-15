import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { processKakaoMessage } from '@/lib/inngest/kakao';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processKakaoMessage],
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
