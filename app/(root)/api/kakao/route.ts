import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';
import { getKSTDateTime } from '@/lib/utils';
import { KakaoRequestBody, KakaoSkillResponse } from '@/lib/types/kakao';

export const runtime = 'edge';

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

  if (!callbackUrlFromKakao) {
    console.warn(`[${getKSTDateTime()}] [WARN] No callbackUrl from Kakao.`);
    return NextResponse.json(
      {
        version: '2.0',
        template: { outputs: [{ simpleText: { text: 'Callback URL is missing.' } }] },
      },
      { status: 200 }
    );
  }

  if (!userUtterance || userUtterance.trim() === '') {
    return NextResponse.json(
      {
        version: '2.0',
        template: { outputs: [{ simpleText: { text: 'Please enter your question.' } }] },
      },
      { status: 200 }
    );
  }

  console.log(`[${getKSTDateTime()}] [INFO] User Utterance: "${userUtterance}"`);

  try {
    console.log(`[${getKSTDateTime()}] [INFO] Sending event to Inngest`);
    await inngest.send({
      name: 'kakao/message.process.request',
      data: {
        originalCallbackUrl: callbackUrlFromKakao,
        userUtterance,
        userId,
      },
    });
    console.log(`[${getKSTDateTime()}] [INFO] Successfully sent event to Inngest`);
  } catch (error: any) {
    console.error(
      `[${getKSTDateTime()}] [ERROR] Failed to send event to Inngest (User: ${userId}):`,
      error.message
    );
  }

  const immediateCallbackResponse: KakaoSkillResponse = {
    version: '2.0',
    useCallback: true,
  };
  return NextResponse.json(immediateCallbackResponse, { status: 200 });
}
