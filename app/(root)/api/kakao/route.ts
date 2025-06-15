import { NextRequest, NextResponse } from 'next/server';
import { getKSTDateTime } from '@/lib/utils';
import { KakaoRequestBody, KakaoSkillResponse } from '@/lib/types/kakao';
import { normalizeText } from '@/lib/utils/text';
import axios from 'axios';
import { siteConfig } from '@/config/site';
import { getAgentResponse } from '@/lib/actions/agent';

// Vercel 환경에 따른 콜백 URL 설정
const getCallbackUrl = () => {
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

const callbackBackgroundTaskUrl = getCallbackUrl();

export async function POST(request: NextRequest) {
  let kakaoRequestBody: KakaoRequestBody;

  // console.log('[INFO] kakao request:', request);
  try {
    kakaoRequestBody = await request.json();
  } catch (error: any) {
    console.error(`[${getKSTDateTime()}] [ERROR] Invalid Kakao request body:`, error.message);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // console.log('[INFO] kakao kakaoRequestBody:', kakaoRequestBody);

  const userUtterance = kakaoRequestBody.userRequest?.utterance;
  const userId = kakaoRequestBody.userRequest?.user?.id;
  const callbackUrlFromKakao = kakaoRequestBody.userRequest?.callbackUrl;

  // if (!callbackUrlFromKakao) {
  //   console.warn(`[${getKSTDateTime()}] [WARN] No callbackUrl from Kakao.`);
  //   return NextResponse.json(
  //     {
  //       version: '2.0',
  //       template: { outputs: [{ simpleText: { text: '콜백 URL이 없습니다.' } }] },
  //     },
  //     { status: 200 }
  //   );
  // }

  if (!userUtterance || userUtterance.trim() === '') {
    return NextResponse.json(
      {
        version: '2.0',
        template: { outputs: [{ simpleText: { text: '궁금한 내용을 입력해주세요.' } }] },
      },
      { status: 200 }
    );
  }

  console.log(`[${getKSTDateTime()}] [INFO] User Utterance: "${userUtterance}"`);

  const agentResponse = await getAgentResponse(userUtterance);
  // try {
  //   console.log(
  //     `[${getKSTDateTime()}] [INFO] Sending event: ${callbackUrlFromKakao}/ ${callbackBackgroundTaskUrl}`
  //   );
  //   await axios
  //     .post(
  //       callbackBackgroundTaskUrl,
  //       {
  //         originalCallbackUrl: callbackUrlFromKakao,
  //         userUtterance,
  //         userId,
  //       },
  //       { timeout: 2000 }
  //     )
  //     .catch(() => {});

  //   console.log(`[${getKSTDateTime()}] [INFO] Successfully sent event to Inngest`);
  // } catch (error: any) {
  //   console.error(
  //     `[${getKSTDateTime()}] [ERROR] Failed to send event to Inngest (User: ${userId}):`,
  //     error.message
  //   );
  // }

  const immediateCallbackResponse: KakaoSkillResponse = {
    version: '2.0',
    useCallback: false,
    template: {
      outputs: [
        {
          simpleText: {
            text: normalizeText(agentResponse),
          },
        },
      ],
    },
  };
  return NextResponse.json(immediateCallbackResponse, { status: 200 });
}
