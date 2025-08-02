import { NextRequest, NextResponse } from 'next/server';
import { getKSTDateTime } from '@/lib/shared/utils';
import { KakaoRequestBody, KakaoSkillResponse } from '@/lib/shared/types/kakao';
import { siteConfig } from '@/config/site';

import axios from 'axios';

// Vercel 환경에 따른 콜백 URL 설정
const getBackgroundTaskUrl = () => {
  // 로컬 개발 환경
  if (process.env.NODE_ENV === 'development') {
    return `${siteConfig.urls.local}/api/kakao/callback`;
  }

  // Vercel 환경
  switch (process.env.VERCEL_ENV) {
    case 'production':
      return `${siteConfig.urls.production}/api/kakao/callback`; // 실제 프로덕션 도메인
    case 'preview':
      return `${siteConfig.urls.development}/api/kakao/callback`; // 프리뷰/개발 도메인
    default:
      // VERCEL_ENV가 없는 경우 (로컬 환경 등)
      return `${siteConfig.urls.local}/api/kakao/callback`;
  }
};

const TIMEOUT_MS = 1000;

const backgroundTaskUrl = getBackgroundTaskUrl();

export async function POST(request: NextRequest) {
  // let requestBody: KakaoRequestBody;

  try {
    const body: KakaoRequestBody = await request.json();

    const userMessage = body.userRequest?.utterance;
    const userId = body.userRequest?.user?.id;
    const callbackUrl = body.userRequest?.callbackUrl;

    if (!callbackUrl || !userMessage) {
      console.warn(
        `[${getKSTDateTime()}:api/kakao] No Parameter: callbackUrl(${callbackUrl}) | userMessage(${userMessage})`
      );
      throw new Error('필수 파라미터가 누락되었습니다.');
    }

    // throw new Error('test');
    console.log(
      `[${getKSTDateTime()}:api/kakao] Sending event: ${callbackUrl}/ ${backgroundTaskUrl}`
    );
    await axios
      .post(
        backgroundTaskUrl,
        {
          callbackUrl,
          userMessage,
          userId,
        },
        { timeout: TIMEOUT_MS }
      )
      .catch(() => {});

    console.log(
      `[${getKSTDateTime()}:api/kakao] Successfully sent event to callback: ${backgroundTaskUrl}`
    );

    const response: KakaoSkillResponse = {
      version: '2.0',
      useCallback: true,
      data: {
        message: '답변을 생성하고 있습니다. 잠시만 기다려주세요 ...',
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error(
      `[${getKSTDateTime()}:api/kakao] Failed to send event to callback: ${backgroundTaskUrl}`,
      error.message
    );
    const failedResponse: KakaoSkillResponse = {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '죄송합니다. 요청을 처리하는 중 오류가 발생했습니다.',
            },
          },
        ],
      },
    };

    return NextResponse.json(failedResponse, { status: 200 });
  }
}
