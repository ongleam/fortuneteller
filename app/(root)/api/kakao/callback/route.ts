import {
  appendClientMessage,
  appendResponseMessages,
  generateText,
  GenerateTextResult,
  Message,
  UIMessage,
} from 'ai';
import { baseAgent } from '@/lib/agents/base';
import { getKSTDateTime, measureExecutionTime, generateUUID } from '@/lib/utils';
import { normText } from '@/lib/utils/textPreprocess';
import { KakaoSkillResponse } from '@/lib/types/kakao';
import { getMessagesByChatId, getOrCreateKakaoChatByUserId, saveMessages } from '@/lib/db/queries';
import { getOrCreateProfileByUserKakaoId } from '@/lib/db/queries';
import { DBMessage } from '@/lib/db/schema';
import axios from 'axios';
import { getToday } from '@/lib/utils/saju';

// 상수 정의
const LLM_TIMEOUT = 50000;
const MAX_STEPS = 5;
const MAX_PREVIOUS_MESSAGES = 10;
const DEFAULT_QUICK_REPLIES = [
  {
    action: 'message' as const,
    label: '내 사주팔자를 봐줘',
    messageText: '내 사주팔자를 봐줘',
  },
  {
    action: 'message' as const,
    label: '오늘의 운세를 알려줘',
    messageText: '오늘의 운세를 알려줘',
  },
  {
    action: 'message' as const,
    label: '올해의 운세를 알려줘',
    messageText: '올해의 운세를 알려줘',
  },
  {
    action: 'message' as const,
    label: '연인과의 궁합을 봐줘',
    messageText: '연인과의 궁합을 봐줘',
  },
];

// 배열에서 랜덤으로 n개를 선택하는 함수
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 랜덤으로 3개의 퀵 리플라이를 선택하는 함수
function getRandomQuickReplies() {
  return getRandomItems(DEFAULT_QUICK_REPLIES, 3);
}

// DB 메시지를 UI 메시지로 변환하는 함수
function convertDBMessageToUIMessage(dbMessage: DBMessage): UIMessage {
  // parts 배열에서 텍스트 콘텐츠 추출
  let textContent = '';

  // parts가 배열인지 확인하고 안전하게 접근
  const parts = Array.isArray(dbMessage.parts) ? dbMessage.parts : [];

  if (parts.length > 0) {
    // 텍스트 타입의 parts만 content로 사용
    const textParts = parts.filter((part: any) => part.type === 'text');
    textContent = textParts.map((part: any) => part.text).join('');
  }

  // role 타입 검증 및 변환
  const validRoles = ['user', 'assistant', 'system', 'data'] as const;
  const role = validRoles.includes(dbMessage.role as any)
    ? (dbMessage.role as 'user' | 'assistant' | 'system' | 'data')
    : 'assistant'; // 기본값

  // attachments 안전하게 처리
  const attachments = Array.isArray(dbMessage.attachments) ? dbMessage.attachments : [];

  const uiMessage: UIMessage = {
    id: dbMessage.id,
    role: role,
    content: textContent,
    parts: parts,
    experimental_attachments: attachments,
    createdAt: dbMessage.created_at ? new Date(dbMessage.created_at) : new Date(),
  };

  // tool call이나 tool result가 있는 경우 content 필드를 제거하여 AI 라이브러리가 올바르게 처리하도록 함
  const hasToolParts = parts.some(
    (part: any) => part.type === 'tool-call' || part.type === 'tool-result'
  );

  if (hasToolParts && !textContent) {
    // tool-call/tool-result만 있고 텍스트가 없는 경우 content 필드 제거
    delete (uiMessage as any).content;
  }

  return uiMessage;
}

async function generateLLMResponse(
  messages: Message[],
  kakao_user_id: string
): Promise<GenerateTextResult<any, any>> {
  const startTime = Date.now();
  console.log(`[${getKSTDateTime()}] [API] LLM 처리 시작 -> id:${kakao_user_id}`);

  // 에이전트 설정
  const agentConfig = baseAgent({ model: 'chat-model', messages, kakao_user_id });

  // console.log(JSON.stringify(agentConfig, null, 2));
  try {
    // 타임아웃과 함께 텍스트 생성
    const result = await measureExecutionTime('Promise.race', async () => {
      return (await Promise.race([
        generateText({
          ...agentConfig,
          maxSteps: MAX_STEPS,
        }),
        createTimeoutPromise(),
      ])) as GenerateTextResult<any, any>;
    });

    const endTime = Date.now();
    console.log(`[${getKSTDateTime()}] [API] LLM 처리 완료 (${endTime - startTime}ms)`);

    return result;
  } catch (error) {
    console.error(`[${getKSTDateTime()}] [API] Promise.race 오류:`, error);
    throw error;
  }
}

function createTimeoutPromise(): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('LLM generation timeout')), LLM_TIMEOUT);
  });
}

// 카카오 메시지 처리 함수
async function processKakaoMessage(
  userUtterance: string,
  userId: string
): Promise<KakaoSkillResponse> {
  console.log(
    `[${getKSTDateTime()}] [API] 요청 처리 시작 - "${userUtterance.substring(0, 30)}..."`
  );

  const profile = await getOrCreateProfileByUserKakaoId({ user_kakao_id: userId });
  const chat = await getOrCreateKakaoChatByUserId({
    userId: profile.user_id,
    title: 'Kakao Chat',
  });

  if (!chat || !('id' in chat)) {
    throw new Error('채팅방을 생성하거나 가져오는데 실패했습니다.');
  }
  const userProfile = {
    name: profile.name,
    gender: profile.gender,
    birthType: profile.birth_type,
    birthYear: profile.birth_year,
    birthMonth: profile.birth_month,
    birthDay: profile.birth_day,
    birthTime: profile.birth_time,
  };

  const processedUserUtterance = `오늘 날짜: ${getToday()}\n유저 정보: ${userProfile}\n<USER_INPUT>${userUtterance}</USER_INPUT>`;

  const userMessage: UIMessage = {
    id: generateUUID(),
    role: 'user',
    parts: [{ type: 'text', text: processedUserUtterance }],
    content: processedUserUtterance,
  };

  const dbMessages = await getMessagesByChatId({ id: chat.id, limit: MAX_PREVIOUS_MESSAGES });

  // DB 메시지를 UI 메시지로 변환
  const convertedMessages = dbMessages.map(convertDBMessageToUIMessage);

  const messages = appendClientMessage({
    messages: convertedMessages,
    message: userMessage,
  });

  await saveMessages({
    messages: [
      {
        chat_id: chat.id,
        id: userMessage.id,
        role: 'user',
        parts: userMessage.parts,
        attachments: [],
        created_at: new Date(),
      },
    ],
  });

  const llmResponse = await generateLLMResponse(messages, userId);

  // 어시스턴트 메시지 생성
  const [, assistantMessage] = appendResponseMessages({
    messages: [userMessage],
    responseMessages: llmResponse.response.messages,
  });

  // 어시스턴트 메시지 저장
  if (assistantMessage) {
    await saveMessages({
      messages: [
        {
          chat_id: chat.id,
          id: generateUUID(),
          role: assistantMessage.role,
          parts: assistantMessage.parts,
          attachments: assistantMessage.experimental_attachments ?? [],
          created_at: new Date(),
        },
      ],
    });
  }

  let processedResponse: KakaoSkillResponse = {
    version: '2.0',
    template: {
      outputs: [
        {
          simpleText: { text: normText(llmResponse.text) },
        },
      ],
      quickReplies: getRandomQuickReplies(),
    },
  };

  return processedResponse;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userUtterance, userId, originalCallbackUrl } = body;

    if (!userUtterance || !userId) {
      return Response.json({ error: 'userUtterance와 userId가 필요합니다.' }, { status: 400 });
    }

    const response = await processKakaoMessage(userUtterance, userId);

    console.log(
      `[${getKSTDateTime()}] [api/kakao/callback] 카카오 콜백 요청 시작 - URL: ${originalCallbackUrl}`
    );
    console.log(
      `[${getKSTDateTime()}] [api/kakao/callback] 전송할 응답 데이터:`,
      JSON.stringify(response, null, 2)
    );

    await axios.post(originalCallbackUrl, response);

    console.log(`[${getKSTDateTime()}] [api/kakao/callback] 카카오 콜백 요청 성공`);
    return Response.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error(`[${getKSTDateTime()}] [api/kakao/callback] 상세 오류 정보:`);
    console.error(`[${getKSTDateTime()}] [api/kakao/callback] 오류 메시지: ${error.message}`);
    console.error(`[${getKSTDateTime()}] [api/kakao/callback] 오류 스택: ${error.stack}`);

    // axios 에러의 경우 더 상세한 정보 출력
    if (error.response) {
      // 서버가 응답을 반환했지만 상태 코드가 2xx가 아닌 경우
      console.error(
        `[${getKSTDateTime()}] [api/kakao/callback] 응답 상태: ${error.response.status}`
      );
      console.error(
        `[${getKSTDateTime()}] [api/kakao/callback] 응답 상태 텍스트: ${error.response.statusText}`
      );
      console.error(
        `[${getKSTDateTime()}] [api/kakao/callback] 응답 헤더:`,
        JSON.stringify(error.response.headers, null, 2)
      );
      console.error(
        `[${getKSTDateTime()}] [api/kakao/callback] 응답 데이터:`,
        JSON.stringify(error.response.data, null, 2)
      );
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못한 경우
      console.error(
        `[${getKSTDateTime()}] [api/kakao/callback] 요청이 전송되었지만 응답을 받지 못함`
      );
      console.error(`[${getKSTDateTime()}] [api/kakao/callback] 요청 정보:`, error.request);
    } else {
      // 요청 설정 중에 오류가 발생한 경우
      console.error(`[${getKSTDateTime()}] [api/kakao/callback] 요청 설정 오류: ${error.message}`);
    }

    // axios 설정 정보도 출력
    if (error.config) {
      console.error(`[${getKSTDateTime()}] [api/kakao/callback] 요청 설정:`);
      console.error(`[${getKSTDateTime()}] [api/kakao/callback] URL: ${error.config.url}`);
      console.error(`[${getKSTDateTime()}] [api/kakao/callback] 메소드: ${error.config.method}`);
      console.error(
        `[${getKSTDateTime()}] [api/kakao/callback] 헤더:`,
        JSON.stringify(error.config.headers, null, 2)
      );
      console.error(
        `[${getKSTDateTime()}] [api/kakao/callback] 타임아웃: ${error.config.timeout}ms`
      );
    }

    // await notifySlackOnError(error, 'app/(chat)/api/callback/route.ts:POST');
    // Sentry.captureException(error);

    return Response.json({ success: false }, { status: 500 });
  }
}
