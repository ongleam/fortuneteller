'use server';

import { WebClient } from '@slack/web-api';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN!;
const CHANNEL_ID = process.env.NEXT_PUBLIC_SLACK_CHANNEL_ID!;

const slack = new WebClient(SLACK_BOT_TOKEN);

export async function sendSlackMessage(message: string) {
  try {
    const result = await slack.chat.postMessage({
      channel: CHANNEL_ID,
      text: message,
      // 블록 키트를 사용하는 경우
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
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
