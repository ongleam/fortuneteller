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
import axios from 'axios';

// 상수 정의
const LLM_TIMEOUT = 50000;
const MAX_STEPS = 5;
const MAX_PREVIOUS_MESSAGES = 10;

async function generateLLMResponse(messages: Message[]): Promise<GenerateTextResult<any, any>> {
  const startTime = Date.now();
  console.log(`[${getKSTDateTime()}] [API] LLM 처리 시작`);

  // 에이전트 설정
  const agentConfig = baseAgent({ model: 'chat-model', messages });

  console.log(JSON.stringify(agentConfig, null, 2));
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

  const userMessage: UIMessage = {
    id: generateUUID(),
    role: 'user',
    parts: [{ type: 'text', text: userUtterance }],
    content: userUtterance,
  };

  const previousMessages = await getMessagesByChatId({ id: chat.id, limit: MAX_PREVIOUS_MESSAGES });
  const messages = appendClientMessage({
    // @ts-ignore
    messages: previousMessages,
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

  const llmResponse = await generateLLMResponse(messages);

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

    console.log(`[${getKSTDateTime()}] [API] 카카오 콜백 요청 시작 - URL: ${originalCallbackUrl}`);
    console.log(
      `[${getKSTDateTime()}] [API] 전송할 응답 데이터:`,
      JSON.stringify(response, null, 2)
    );

    await axios.post(originalCallbackUrl, response);

    console.log(`[${getKSTDateTime()}] [API] 카카오 콜백 요청 성공`);
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
