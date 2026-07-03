import { describe, it, expect, beforeEach, mock } from "bun:test";
import { removeMarkdown } from "@fortuneteller/shared/utils/text";
import {
  createKakaoRequestBody,
  createCallbackTaskBody,
  createPostRequest,
  createMockLanguageModel,
} from "./fixtures/kakao-fixtures";

// ---------------------------------------------------------------------------
// 외부 의존성 모킹 (bun mock.module) — 실제 외부/DB/LLM 호출 없이 결정적으로 시뮬레이션.
// mock.module 은 이후 동적 import 되는 라우트에 적용된다.
// ---------------------------------------------------------------------------
let mockLLMText = "";
const mockPost = mock(async () => ({ data: {} }));
const mockCreateMessages = mock(async () => undefined);
const mockGetProfile = mock(async () => ({ user_id: "test-user-id" }));

mock.module("axios", () => ({ default: { post: mockPost }, post: mockPost }));
mock.module("@/agents/base", () => ({
  baseAgent: mock(async () => ({
    model: createMockLanguageModel(mockLLMText),
    system: "test-system",
    messages: [{ role: "user", content: "test" }],
    tools: {},
  })),
}));
mock.module("@fortuneteller/modules/chat/infra/queries", () => ({
  getOrCreateKakaoChatByUserId: mock(async () => ({ id: "test-chat-id" })),
  getMessagesByChatId: mock(async () => []),
  createMessages: mockCreateMessages,
}));
mock.module("@fortuneteller/modules/profile/infra/queries", () => ({
  getOrCreateProfileByUserKakaoId: mockGetProfile,
}));

const { POST: kakaoPost } = await import("@/app/api/kakao/route");
const { POST: callbackPost } = await import("@/app/api/kakao/callback/route");

beforeEach(() => {
  mockPost.mockClear();
  mockCreateMessages.mockClear();
  mockGetProfile.mockClear();
  mockPost.mockResolvedValue({ data: {} });
  mockGetProfile.mockResolvedValue({ user_id: "test-user-id" });
  mockLLMText = "";
});

describe("POST /api/kakao (진입 라우트)", () => {
  it("유효한 발화 → useCallback 응답을 반환하고 콜백 라우트로 백그라운드 디스패치한다", async () => {
    const body = createKakaoRequestBody({ utterance: "안녕", userId: "u1" });
    const res = await kakaoPost(
      createPostRequest("http://localhost:3000/api/kakao", body) as never,
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.version).toBe("2.0");
    expect(json.useCallback).toBe(true);
    expect(json.data.message).toContain("답변");

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith(
      "http://localhost:3000/api/kakao/callback",
      { callbackUrl: "https://kakao.test/callback", userMessage: "안녕", userId: "u1" },
      expect.objectContaining({ timeout: 1000 }),
    );
  });

  it("필수 파라미터(utterance/callbackUrl) 누락 → 오류 안내 템플릿을 반환하고 디스패치하지 않는다", async () => {
    const body = createKakaoRequestBody();
    body.userRequest.utterance = "";

    const res = await kakaoPost(
      createPostRequest("http://localhost:3000/api/kakao", body) as never,
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.template.outputs[0].simpleText.text).toContain("오류");
    expect(mockPost).not.toHaveBeenCalled();
  });
});

describe("POST /api/kakao/callback (생성 라우트)", () => {
  it("LLM 응답을 마크다운 제거 후 카카오 콜백 URL로 전송하고 대화를 저장한다", async () => {
    mockLLMText = "## 안녕하세요 **점순이**입니다\n- 오늘의 운세를 알려드릴게요";
    const body = createCallbackTaskBody({ callbackUrl: "https://kakao.test/callback" });

    const res = await callbackPost(
      createPostRequest("http://localhost:3000/api/kakao/callback", body),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    expect(mockPost).toHaveBeenCalledTimes(1);
    const [calledUrl, payload] = mockPost.mock.calls[0] as [string, any];
    expect(calledUrl).toBe("https://kakao.test/callback");
    expect(payload.version).toBe("2.0");
    expect(payload.template.outputs[0].simpleText.text).toBe(removeMarkdown(mockLLMText));
    expect(payload.template.outputs[0].simpleText.text).not.toContain("**");

    expect(mockCreateMessages).toHaveBeenCalledTimes(2);
  });

  it("처리 중 예외 발생 → 콜백을 전송하지 않고 500을 반환한다", async () => {
    mockGetProfile.mockRejectedValueOnce(new Error("db down"));
    const body = createCallbackTaskBody();

    const res = await callbackPost(
      createPostRequest("http://localhost:3000/api/kakao/callback", body),
    );
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(mockPost).not.toHaveBeenCalled();
  });
});
