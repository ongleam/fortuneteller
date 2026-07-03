import { NextRequest, NextResponse } from "next/server";
import { getKSTDateTime } from "@fortuneteller/shared/utils";
import { KakaoRequestBody, KakaoSkillResponse } from "@fortuneteller/shared/types/kakao";

import axios from "axios";

const TIMEOUT_MS = 1000;

// self-call로 백그라운드 invocation을 띄운다. Vercel(서버리스)에선 자기 배포의 공개 URL이,
// 로컬 dev에선 루프백이 필요하다. request origin은 ngrok 뒤에서 https://localhost 로 깨지므로 쓰지 않는다.
const backgroundTaskUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}/api/kakao/callback`
  : `http://localhost:${process.env.PORT ?? 3000}/api/kakao/callback`;

export async function POST(request: NextRequest) {
  try {
    const body: KakaoRequestBody = await request.json();

    const userMessage = body.userRequest?.utterance;
    const userId = body.userRequest?.user?.id;
    const callbackUrl = body.userRequest?.callbackUrl;

    if (!callbackUrl || !userMessage) {
      console.warn(
        `[${getKSTDateTime()}:api/kakao] No Parameter: callbackUrl(${callbackUrl}) | userMessage(${userMessage})`,
      );
      throw new Error("필수 파라미터가 누락되었습니다.");
    }

    // throw new Error('test');
    console.log(
      `[${getKSTDateTime()}:api/kakao] Sending event: ${callbackUrl}/ ${backgroundTaskUrl}`,
    );
    await axios
      .post(
        backgroundTaskUrl,
        {
          callbackUrl,
          userMessage,
          userId,
        },
        { timeout: TIMEOUT_MS },
      )
      .catch(() => {});

    console.log(
      `[${getKSTDateTime()}:api/kakao] Successfully sent event to callback: ${backgroundTaskUrl}`,
    );

    const response: KakaoSkillResponse = {
      version: "2.0",
      useCallback: true,
      data: {
        message: "답변을 생성하고 있습니다. 잠시만 기다려주세요 ...",
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error(
      `[${getKSTDateTime()}:api/kakao] Failed to send event to callback: ${backgroundTaskUrl}`,
      error.message,
    );
    const failedResponse: KakaoSkillResponse = {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: "죄송합니다. 요청을 처리하는 중 오류가 발생했습니다.",
            },
          },
        ],
      },
    };

    return NextResponse.json(failedResponse, { status: 200 });
  }
}
