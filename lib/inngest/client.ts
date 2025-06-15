// lib/inngest/client.ts
import { Inngest } from 'inngest';

// console.log(
//   'Attempting to read INNGEST_EVENT_KEY in client.ts:',
//   process.env.INNGEST_EVENT_KEY ? 'Found' : 'Not Found'
// );

// Inngest 클라이언트 생성
export const inngest = new Inngest({
  id: 'kakao-chat-agent',
  // Vercel 환경에서는 자동으로 eventKey, signingKey 등을 감지할 수 있습니다.
  // 로컬에서는 inngest-cli dev를 사용하면 보통 명시적 키 설정이 필요 없습니다.
});
