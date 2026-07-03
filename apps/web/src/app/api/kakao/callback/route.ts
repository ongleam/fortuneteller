import { generateText, GenerateTextResult, stepCountIs, UIMessage } from "ai";
import { baseAgent } from "@/agents/base";
import { getKSTDateTime, measureExecutionTime, generateUUID } from "@fortuneteller/shared/utils";
// import { normText } from '@fortuneteller/shared/utils/textPreprocess';
import { KakaoSkillResponse } from "@fortuneteller/shared/types/kakao";
import {
  getMessagesByChatId,
  getOrCreateKakaoChatByUserId,
  createMessages,
} from "@fortuneteller/modules/chat/infra/queries";
import { getOrCreateProfileByUserKakaoId } from "@fortuneteller/modules/profile/infra/queries";
import { DBMessage } from "@fortuneteller/db/schema";
import axios from "axios";
// Local getToday function
function getToday() {
  return new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
import { removeMarkdown } from "@fortuneteller/shared/utils/text";

// 상수 정의
const LLM_TIMEOUT = 50000;
const MAX_STEPS = 5;
const MAX_PREVIOUS_MESSAGES = 10;
const DEFAULT_QUICK_REPLIES = [
  {
    action: "message" as const,
    label: "내 사주팔자를 봐줘",
    messageText: "내 사주팔자를 봐줘",
  },
  {
    action: "message" as const,
    label: "오늘의 운세를 알려줘",
    messageText: "오늘의 운세를 알려줘",
  },
  {
    action: "message" as const,
    label: "올해의 운세를 알려줘",
    messageText: "올해의 운세를 알려줘",
  },
  {
    action: "message" as const,
    label: "연인과의 궁합을 봐줘",
    messageText: "연인과의 궁합을 봐줘",
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

// DB 메시지를 v6 UI 메시지로 변환하는 함수 (모델 입력용, text/file parts만 유지)
function convertDBMessageToUIMessage(dbMessage: DBMessage): UIMessage {
  const parts = Array.isArray(dbMessage.parts) ? dbMessage.parts : [];
  const safeParts = parts.filter(
    (part: any) => part?.type === "text" || part?.type === "file",
  ) as UIMessage["parts"];

  // role 타입 검증 및 변환
  const validRoles = ["user", "assistant", "system"] as const;
  const role = (validRoles as readonly string[]).includes(dbMessage.role)
    ? (dbMessage.role as UIMessage["role"])
    : "assistant"; // 기본값

  return {
    id: dbMessage.id,
    role,
    parts: safeParts,
  };
}

async function generateLLMResponse(
  messages: UIMessage[],
  kakao_user_id: string,
): Promise<GenerateTextResult<any, any>> {
  const startTime = Date.now();
  console.log(`[${getKSTDateTime()}] [API] LLM 처리 시작 -> id:${kakao_user_id}`);

  // 에이전트 설정
  const agentConfig = await baseAgent({ model: "chat-model", messages, kakao_user_id });

  // console.log(JSON.stringify(agentConfig, null, 2));
  try {
    // 타임아웃과 함께 텍스트 생성
    const result = await measureExecutionTime("Promise.race", async () => {
      return (await Promise.race([
        generateText({
          ...agentConfig,
          stopWhen: stepCountIs(MAX_STEPS),
        }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("LLM generation timeout")), LLM_TIMEOUT);
        }),
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userMessage, userId, callbackUrl } = body;

    const profile = await getOrCreateProfileByUserKakaoId({ user_kakao_id: userId });
    const chat = await getOrCreateKakaoChatByUserId({
      userId: profile.user_id,
      title: "Kakao Chat",
    });

    if (!chat || !("id" in chat)) {
      throw new Error("채팅방을 생성하거나 가져오는데 실패했습니다.");
    }

    const userInput = `오늘 날짜: ${getToday()}\n<USER_INPUT>${userMessage}</USER_INPUT>`;

    const userDBMessage: UIMessage = {
      id: generateUUID(),
      role: "user",
      parts: [{ type: "text", text: userInput }],
    };

    const dbMessages = await getMessagesByChatId({ id: chat.id, limit: MAX_PREVIOUS_MESSAGES });

    // DB 메시지를 UI 메시지로 변환
    const previousMessages = dbMessages.map(convertDBMessageToUIMessage);

    const messages: UIMessage[] = [...previousMessages, userDBMessage];

    await createMessages({
      messages: [
        {
          chat_id: chat.id,
          id: userDBMessage.id,
          role: "user",
          parts: userDBMessage.parts,
          attachments: [],
          created_at: new Date(),
        },
      ],
    });

    const llmResponse = await generateLLMResponse(messages, userId);

    // 어시스턴트 메시지 저장 (텍스트 응답을 text part로 보존)
    if (llmResponse.text) {
      await createMessages({
        messages: [
          {
            chat_id: chat.id,
            id: generateUUID(),
            role: "assistant",
            parts: [{ type: "text", text: llmResponse.text }],
            attachments: [],
            created_at: new Date(),
          },
        ],
      });
    }

    let response: KakaoSkillResponse = {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: { text: removeMarkdown(llmResponse.text) },
          },
        ],
        // quickReplies: getRandomQuickReplies(),
      },
    };

    console.log(
      `[${getKSTDateTime()}] [api/kakao/callback] 카카오 콜백 요청 시작 - URL: ${callbackUrl}`,
    );
    console.log(
      `[${getKSTDateTime()}] [api/kakao/callback] 전송할 응답 데이터:`,
      JSON.stringify(response, null, 2),
    );

    await axios.post(callbackUrl, response);

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
        `[${getKSTDateTime()}] [api/kakao/callback] 응답 상태: ${error.response.status}`,
      );
      console.error(
        `[${getKSTDateTime()}] [api/kakao/callback] 응답 상태 텍스트: ${error.response.statusText}`,
      );
      console.error(
        `[${getKSTDateTime()}] [api/kakao/callback] 응답 헤더:`,
        JSON.stringify(error.response.headers, null, 2),
      );
      console.error(
        `[${getKSTDateTime()}] [api/kakao/callback] 응답 데이터:`,
        JSON.stringify(error.response.data, null, 2),
      );
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못한 경우
      console.error(
        `[${getKSTDateTime()}] [api/kakao/callback] 요청이 전송되었지만 응답을 받지 못함`,
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
        JSON.stringify(error.config.headers, null, 2),
      );
      console.error(
        `[${getKSTDateTime()}] [api/kakao/callback] 타임아웃: ${error.config.timeout}ms`,
      );
    }

    // await notifySlackOnError(error, 'app/(chat)/api/callback/route.ts:POST');
    // Sentry.captureException(error);

    return Response.json({ success: false }, { status: 500 });
  }
}
