import axios from 'axios';
import { removeMarkdown } from '@/lib/shared/utils/text';
import {
  createKakaoRequestBody,
  createCallbackTaskBody,
  createPostRequest,
} from '@/tests/fixtures/kakao';

// ---------------------------------------------------------------------------
// 외부 의존성 모킹 — 실제 외부 응답을 받아오지 않고 빠르게 시뮬레이션한다.
// ---------------------------------------------------------------------------

// 1) 아웃바운드 HTTP: 백그라운드 디스패치(/api/kakao) + 카카오 콜백 전송(/callback)
jest.mock('axios', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

// 2) LLM(Google): baseAgent 가 돌려주는 모델을 mock 모델로 대체.
//    mockLLMText 를 테스트마다 바꿔 LLM 응답을 시뮬레이션한다.
let mockLLMText = '';
jest.mock('@/lib/interfaces/agents/base', () => ({
  baseAgent: jest.fn(async () => ({
    model: require('@/tests/fixtures/kakao').createMockLanguageModel(mockLLMText),
    system: 'test-system',
    messages: [{ role: 'user', content: 'test' }],
    tools: {},
  })),
}));

// 3) DB(dev/prod 공유 DB): 실제 쓰기를 막고 결정적 값으로 대체.
jest.mock('@/lib/infra/db/queries', () => ({
  getOrCreateProfileByUserKakaoId: jest.fn(async () => ({ user_id: 'test-user-id' })),
  getOrCreateKakaoChatByUserId: jest.fn(async () => ({ id: 'test-chat-id' })),
  getMessagesByChatId: jest.fn(async () => []),
  saveMessages: jest.fn(async () => undefined),
}));

import * as queries from '@/lib/infra/db/queries';
import { POST as kakaoPost } from '@/app/(root)/api/kakao/route';
import { POST as callbackPost } from '@/app/(root)/api/kakao/callback/route';

const mockedPost = (axios as unknown as { post: jest.Mock }).post;

beforeEach(() => {
  jest.clearAllMocks();
  mockedPost.mockResolvedValue({ data: {} });
  mockLLMText = '';
});

describe('POST /api/kakao (진입 라우트)', () => {
  it('유효한 발화 → useCallback 응답을 반환하고 콜백 라우트로 백그라운드 디스패치한다', async () => {
    const body = createKakaoRequestBody({ utterance: '안녕', userId: 'u1' });

    const res = await kakaoPost(createPostRequest('http://localhost:3000/api/kakao', body) as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.version).toBe('2.0');
    expect(json.useCallback).toBe(true);
    expect(json.data.message).toContain('답변');

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost).toHaveBeenCalledWith(
      'http://localhost:3000/api/kakao/callback',
      { callbackUrl: 'https://kakao.test/callback', userMessage: '안녕', userId: 'u1' },
      expect.objectContaining({ timeout: 1000 })
    );
  });

  it('필수 파라미터(utterance/callbackUrl) 누락 → 오류 안내 템플릿을 반환하고 디스패치하지 않는다', async () => {
    const body = createKakaoRequestBody();
    body.userRequest.utterance = '';

    const res = await kakaoPost(createPostRequest('http://localhost:3000/api/kakao', body) as any);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.template.outputs[0].simpleText.text).toContain('오류');
    expect(mockedPost).not.toHaveBeenCalled();
  });
});

describe('POST /api/kakao/callback (생성 라우트)', () => {
  it('LLM 응답을 마크다운 제거 후 카카오 콜백 URL로 전송하고 대화를 저장한다', async () => {
    mockLLMText = '## 안녕하세요 **점순이**입니다\n- 오늘의 운세를 알려드릴게요';
    const body = createCallbackTaskBody({ callbackUrl: 'https://kakao.test/callback' });

    const res = await callbackPost(
      createPostRequest('http://localhost:3000/api/kakao/callback', body)
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    // 카카오 콜백으로 전송된 스킬 응답 검증 (마크다운이 제거된 평문이어야 함)
    expect(mockedPost).toHaveBeenCalledTimes(1);
    const [calledUrl, payload] = mockedPost.mock.calls[0];
    expect(calledUrl).toBe('https://kakao.test/callback');
    expect(payload.version).toBe('2.0');
    expect(payload.template.outputs[0].simpleText.text).toBe(removeMarkdown(mockLLMText));
    expect(payload.template.outputs[0].simpleText.text).not.toContain('**');

    // user + assistant 메시지 저장 (총 2회)
    expect(queries.saveMessages).toHaveBeenCalledTimes(2);
  });

  it('처리 중 예외 발생 → 콜백을 전송하지 않고 500을 반환한다', async () => {
    (queries.getOrCreateProfileByUserKakaoId as jest.Mock).mockRejectedValueOnce(
      new Error('db down')
    );
    const body = createCallbackTaskBody();

    const res = await callbackPost(
      createPostRequest('http://localhost:3000/api/kakao/callback', body)
    );
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(mockedPost).not.toHaveBeenCalled();
  });
});
