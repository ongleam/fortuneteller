// @/lib/inngest/kakao.ts
import { inngest } from './client';
import {
  appendClientMessage,
  appendResponseMessages,
  generateText,
  GenerateTextResult,
  Message,
  UIMessage,
} from 'ai';
import { kakaoKcAgent } from '@/lib/agents/kakao-kc-agent';
import {
  getKSTDateTime,
  measureExecutionTime,
  generateExecutionReport,
  generateUUID,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateRecommandQuestions } from '../actions/chat';
import { ResponseMessage } from '@/lib/types/ai';
import { KakaoQuickReply, KakaoSkillResponse } from '@/lib/types/kakao';
import { preprocessXmlText } from '@/lib/utils/textPreprocess';
import { getMessagesByChatId, getOrCreateKakaoChatByUserId, saveMessages } from '../db/queries';
import { getOrCreateProfileByUserKakaoId } from '../db/queries';
import { getCachedData, setCachedData } from '../actions/redis';
import { createCarouselItemsFromLlmResponse } from './carousel';
import { notifySlackOnError } from '@/lib/utils/errorHandler';
import * as Sentry from '@sentry/nextjs';

// 상수 정의
const LLM_TIMEOUT = 20000;
const MAX_STEPS = 5;
const MAX_RECOMMAND_QUESTIONS = 3;
const MAX_CAROUSEL_ITEMS = 4;
const MAX_PREVIOUS_MESSAGES = 0;
const DEFAULT_QUICK_REPLIES = [
  {
    action: 'message' as const,
    label: '🏠 홈으로',
    messageText: '🏠 홈으로',
  },
  {
    action: 'message' as const,
    label: '🚢 문의하기',
    messageText: '🚢 문의하기',
  },
];

interface CachedKakaoData {
  text: string;
  kakaoQuickReplies: KakaoQuickReply[];
  kakaoCarouselItems: any[];
  assistantMessage: {
    role: 'data' | 'system' | 'user' | 'assistant';
    parts: any[];
    experimental_attachments?: any[];
  };
  showCarousel: boolean;
}

const CACHE_KEY_PREFIX = 'kakao:chat:';

async function generateLLMResponse(messages: Message[]): Promise<GenerateTextResult<any, any>> {
  const startTime = Date.now();
  console.log(`[${getKSTDateTime()}] [Inngest] LLM 처리 시작`);

  // console.log('messages:', messages);

  // 에이전트 설정
  const agentConfig = kakaoKcAgent({ model: 'kakao-chat-model', messages });
  // console.log('agentConfig:', JSON.stringify(agentConfig, null, 2));
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
    console.log(`[${getKSTDateTime()}] [Inngest] LLM 처리 완료 (${endTime - startTime}ms)`);

    return result;
  } catch (error) {
    console.error(`[${getKSTDateTime()}] [Inngest] Promise.race 오류:`, error);
    throw error;
  }
}

function createTimeoutPromise(): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('LLM generation timeout')), LLM_TIMEOUT);
  });
}

const extractFaqQuestions = (responseMessages: ResponseMessage[]): string[] => {
  const faqAnswers: string[] = [];

  for (const message of responseMessages) {
    if (message.content) {
      for (const content of message.content) {
        if (content.type === 'tool-result' && content.toolName === 'searchFaq' && content.result) {
          const questions = (content.result as Array<{ question: string }>).map(
            (item) => item.question
          );
          faqAnswers.push(...questions);
        }
      }
    }
  }

  return faqAnswers;
};

// 카카오 메시지 처리 함수
export const processKakaoMessage = inngest.createFunction(
  {
    id: 'process-kakao-message',
    name: 'Process Kakao Message Background',
    retries: 0,
  },
  { event: 'kakao/message.process.request' },
  async ({ event }) => {
    const { originalCallbackUrl, userUtterance, userId } = event.data;
    const cacheKey = `${CACHE_KEY_PREFIX}${userUtterance.toLowerCase().trim()}`;

    console.log(
      `[${getKSTDateTime()}] [Inngest] 요청 처리 시작 - "${userUtterance.substring(0, 30)}..."`
    );
    try {
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

      const previousMessages = await getMessagesByChatId({ id: chat.id });
      const messages = appendClientMessage({
        // @ts-ignore
        messages: previousMessages,
        message: userMessage,
      });

      // 캐시된 응답 확인
      const cachedData: CachedKakaoData | null = await getCachedData(cacheKey);
      let llmText: string;
      let carouselItems: any[];
      let kakaoQuickReplies: KakaoQuickReply[];
      let assistantMessage: Message | null = null;
      let showCarousel: boolean;

      if (cachedData) {
        llmText = cachedData.text;
        carouselItems = cachedData.kakaoCarouselItems;
        kakaoQuickReplies = cachedData.kakaoQuickReplies;
        showCarousel = cachedData.showCarousel;

        // 캐시된 어시스턴트 메시지 복원
        assistantMessage = {
          id: generateUUID(),
          role: cachedData.assistantMessage.role,
          parts: cachedData.assistantMessage.parts,
          experimental_attachments: cachedData.assistantMessage.experimental_attachments,
          content: llmText,
        };
      } else {
        console.log('[Cache miss] Generating new response');
        const llmResponse = await generateLLMResponse(messages.slice(-MAX_PREVIOUS_MESSAGES));
        const { items, showCarousel: newShowCarousel } =
          createCarouselItemsFromLlmResponse(llmResponse);
        carouselItems = items;
        showCarousel = newShowCarousel;
        // console.log('[Cache miss] carouselItems:', JSON.stringify(carouselItems, null, 2));
        const responseMessages = llmResponse.response.messages as ResponseMessage[];
        // console.log('[Cache miss] responseMessages:', JSON.stringify(responseMessages, null, 2));
        const faqQuestions = extractFaqQuestions(responseMessages);
        llmText = llmResponse.text;
        const genQuestions = await generateRecommandQuestions({
          userUtterance,
          questions: faqQuestions,
        });

        kakaoQuickReplies = genQuestions.map((question) => ({
          action: 'message' as const,
          label: question.messageText,
          messageText: question.messageText,
        }));

        // 어시스턴트 메시지 생성
        const [, newAssistantMessage] = appendResponseMessages({
          messages: [userMessage],
          responseMessages: llmResponse.response.messages,
        });
        assistantMessage = newAssistantMessage;

        // 응답 캐싱
        await setCachedData(cacheKey, {
          text: llmText,
          kakaoQuickReplies,
          kakaoCarouselItems: carouselItems,
          showCarousel,
          assistantMessage: {
            role: assistantMessage.role,
            parts: assistantMessage.parts,
            experimental_attachments: assistantMessage.experimental_attachments,
          },
        });
      }

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
              simpleText: { text: preprocessXmlText(llmText) },
            },
          ],
        },
      };

      if (showCarousel && carouselItems && carouselItems.length > 0) {
        processedResponse.template!.outputs.push({
          carousel: {
            type: 'textCard',
            items: carouselItems.slice(0, MAX_CAROUSEL_ITEMS),
          },
        });
      }

      if (kakaoQuickReplies) {
        processedResponse.template!.quickReplies = [
          ...DEFAULT_QUICK_REPLIES,
          ...kakaoQuickReplies.slice(0, MAX_RECOMMAND_QUESTIONS),
        ];
      }

      console.log('processedResponse:', JSON.stringify(processedResponse, null, 2));

      const response = await fetch(originalCallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedResponse),
      });

      if (!response.ok) {
        const resBody = await response.text();
        throw new Error(
          `[Inngest] 콜백 전송 실패 (${response.status}) \n responseText: ${resBody}`
        );
      }

      return { status: response.status };
    } catch (error: any) {
      console.error(`[${getKSTDateTime()}] [Inngest] 오류: ${error.message}`);
      // await notifySlackOnError(error, '@/lib/inngest/kakao.ts:processKakaoMessage');
      Sentry.captureException(error);
      return { success: false, error: error.message };
    }
  }
);
