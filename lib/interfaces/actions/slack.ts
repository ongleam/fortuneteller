'use server';

import { WebClient } from '@slack/web-api';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN!;
const CHANNEL_ID = process.env.NEXT_PUBLIC_SLACK_CHANNEL_ID!;

const slack = new WebClient(SLACK_BOT_TOKEN);

// Slack 블록 텍스트 최대 길이 (3000자 제한)
const MAX_SLACK_TEXT_LENGTH = 2900; // 약간의 여유를 두어 2900자로 설정

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // 텍스트를 자르고 말줄임 표시 추가
  return text.substring(0, maxLength - 20) + '\n\n... (텍스트 길이 초과로 생략됨)';
}

export async function sendSlackMessage(message: string) {
  try {
    // 메시지 길이 확인 및 자르기
    const truncatedMessage = truncateText(message, MAX_SLACK_TEXT_LENGTH);

    // 메시지가 잘렸다면 로그 출력
    if (message.length > MAX_SLACK_TEXT_LENGTH) {
      console.warn(
        `[Slack] 메시지가 ${MAX_SLACK_TEXT_LENGTH}자를 초과하여 잘렸습니다. (원본: ${message.length}자)`
      );
    }

    const result = await slack.chat.postMessage({
      channel: CHANNEL_ID,
      text: truncatedMessage,
      // 블록 키트를 사용하는 경우
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: truncatedMessage,
          },
        },
      ],
    });

    if (!result.ok) {
      throw new Error('Slack 메시지 전송 실패');
    }

    return { success: true };
  } catch (error) {
    console.error('Slack 메시지 전송 오류:', error);
    return { success: false, error: '메시지 전송 실패' };
  }
}
