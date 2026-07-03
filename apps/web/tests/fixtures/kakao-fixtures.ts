import { MockLanguageModelV3 } from "ai/test";
import type { KakaoRequestBody } from "@fortuneteller/shared/types/kakao";

/**
 * 카카오 스킬 서버가 `/api/kakao` 로 보내는 요청 본문을 생성한다.
 * (tests/test_curl_kakao.sh 의 실제 페이로드 형태를 그대로 따른다)
 */
export function createKakaoRequestBody(
  overrides: { utterance?: string; userId?: string; callbackUrl?: string } = {},
): KakaoRequestBody {
  const {
    utterance = "내 사주팔자를 봐줘",
    userId = "test_kakao_user_id",
    callbackUrl = "https://kakao.test/callback",
  } = overrides;

  return {
    userRequest: {
      timezone: "Asia/Seoul",
      callbackUrl,
      params: {},
      block: { id: "block-id", name: "챗봇 시작" },
      utterance,
      lang: "ko",
      user: {
        id: userId,
        type: "botUserKey",
        properties: { botUserKey: "bot_user_key_12345" },
      },
    },
    bot: { id: "bot-id", name: "점순이" },
    action: { name: "chatAction", params: {}, id: "action-id", detailParams: {} },
  };
}

/**
 * `/api/kakao` 가 백그라운드로 `/api/kakao/callback` 에 보내는 본문을 생성한다.
 */
export function createCallbackTaskBody(
  overrides: { userMessage?: string; userId?: string; callbackUrl?: string } = {},
) {
  const {
    userMessage = "내 사주팔자를 봐줘",
    userId = "test_kakao_user_id",
    callbackUrl = "https://kakao.test/callback",
  } = overrides;
  return { userMessage, userId, callbackUrl };
}

/**
 * LLM(Google) 의 실제 응답을 모킹한다. generateText 가 이 모델로 즉시 canned 텍스트를
 * 반환하므로, 외부 API 호출 없이 빠르게 시뮬레이션할 수 있다.
 */
export function createMockLanguageModel(text: string): MockLanguageModelV3 {
  return new MockLanguageModelV3({
    // Canned text response; usage shape is loosened since these tests only assert on text.
    doGenerate: async () =>
      ({
        content: [{ type: "text" as const, text }],
        finishReason: "stop" as const,
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        warnings: [],
      }) as any,
  });
}

/** POST 핸들러에 넘길 Request 객체를 만든다. */
export function createPostRequest(url: string, body: unknown): Request {
  const req = new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  // 라우트가 NextRequest.nextUrl.origin 을 읽으므로 테스트에서도 채워준다.
  (req as unknown as { nextUrl: URL }).nextUrl = new URL(url);
  return req;
}
