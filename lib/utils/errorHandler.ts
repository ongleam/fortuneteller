// lib/utils/errorHandler.ts
import { sendSlackMessage } from '@/lib/actions/slack'; // 기존 Slack 전송 함수
import { getKSTDateTime } from '@/lib/utils'; // 날짜/시간 유틸리티

/**
 * 간단한 에러 알림 함수
 * @param error - 발생한 에러 객체 또는 에러 메시지 문자열
 * @param location - (선택적) 에러 발생 위치를 나타내는 문자열
 */
export async function notifySlackOnError(error: Error | string, location?: string): Promise<void> {
  try {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : '스택 정보 없음';

    const messageParts = [`🚨 *Error*`];

    if (location) {
      messageParts.push(`*location*: ${location}`);
    }

    messageParts.push(`*message*: \n\`\`\`\n${errorMessage}\n\`\`\``);
    messageParts.push(`*stack*: \n\`\`\`\n${errorStack}\n\`\`\``);

    const slackMessage = messageParts.join('\n\n');

    await sendSlackMessage(slackMessage);
  } catch (slackError) {
    console.error('[Slack Notify] Slack 알림 전송 중 에러 발생:', slackError);
    // Slack 알림 실패가 다른 에러 처리를 방해하지 않도록 합니다.
  }
}
