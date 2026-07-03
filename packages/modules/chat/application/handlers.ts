// chat use-cases (프레임워크 무관). 어댑터(apps/web/src/{actions,lib})가 호출한다.
// 읽기·LLM 은 query 함수, 쓰기는 command 핸들러(chatCommandHandlers)로 분리한다.
import type { LanguageModel, ToolSet, UIMessage } from "ai";
import { z } from "zod";
import { systemPrompts } from "@fortuneteller/config/prompts";
import { createCommandEntry } from "@fortuneteller/shared/application/message-bus";
import type { UnitOfWork } from "@fortuneteller/shared/application/unit-of-work";
import type { KakaoUserProfile } from "@fortuneteller/shared/types/kakao";
import {
  UpdateChatVisibility,
  DeleteTrailingMessages,
  SaveMessages,
} from "@fortuneteller/modules/chat/domain/commands";
import type { AiClient, ChatRepos } from "@fortuneteller/modules/chat/domain/ports";
import {
  ChatVisibilityUpdated,
  TrailingMessagesDeleted,
  MessagesSaved,
} from "@fortuneteller/modules/chat/domain/events";
import { chatUowFactory } from "@fortuneteller/modules/chat/infra/unit-of-work";

/** 카카오 access token 으로 유저 프로필을 조회한다. */
export async function getKakaoUserInfo(accessToken: string): Promise<KakaoUserProfile> {
  const response = await fetch("https://kapi.kakao.com/v2/user/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`카카오 API 오류: ${errorData.message || response.statusText}`);
  }

  return (await response.json()) as KakaoUserProfile;
}

/** 유저의 첫 메시지로 대화 제목(40자 이내, 한국어)을 생성한다. */
export async function generateTitleFromUserMessage({
  message,
  model,
  aiClient,
}: {
  message: UIMessage;
  model: LanguageModel;
  aiClient: AiClient;
}) {
  return aiClient.generateText({
    model,
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 40 characters long and written in Korean
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });
}

/** FAQ 기반 추천 질문(최대 3개)을 생성한다. */
export async function generateRecommandQuestions({
  userUtterance: _userUtterance,
  questions,
  model,
  aiClient,
}: {
  userUtterance: string;
  questions: string[];
  model: LanguageModel;
  aiClient: AiClient;
}) {
  return aiClient.generateObjectArray({
    model,
    system: `
    # Core Identity:
    당신은 질문 생성 어시스턴트입니다.
    # Output:
    - 최대 3개의 질문을 생성합니다.
    - 질문은 핵심만 요약해서 최대한 간결하게 작성합니다. (최대 30자 이내)
    - 주어진 FAQ 질문을 참고하여 질문을 생성합니다.
    - 만약 주어진 FAQ 질문이 없다면, empty array를 반환합니다.
    `,
    prompt: `
    - FAQ 질문: ${questions.length > 0 ? questions.join(", ") : "없음"}
    `,
    schema: z.object({
      messageText: z.string(),
    }),
  });
}

export interface BaseAgentInput {
  messages: UIMessage[];
  model: LanguageModel;
  tools: ToolSet;
  aiClient: AiClient;
  maxOutputTokens?: number;
  temperature?: number;
}

/** 채팅 base agent 설정을 조립한다(streamText/generateText 에 spread). system prompt(=chat
 *  컨텍스트 정체성)는 chat 이 소유하고, model·tools 는 어댑터(app)가 주입한다. */
export async function baseAgent({
  messages,
  model,
  tools,
  aiClient,
  maxOutputTokens,
  temperature,
}: BaseAgentInput) {
  return {
    model,
    maxOutputTokens,
    temperature,
    system: systemPrompts.BASE_AGENT,
    messages: await aiClient.toModelMessages(messages),
    tools,
  };
}

// ==================== Command Handlers (쓰기) ====================

async function updateChatVisibilityHandler(
  cmd: UpdateChatVisibility,
  uow: UnitOfWork<ChatRepos>,
): Promise<void> {
  await uow((repos) =>
    repos.chatRepo.updateChatVisibility({ chatId: cmd.chatId, visibility: cmd.visibility }),
  );
  uow.addEvent(ChatVisibilityUpdated({ chatId: cmd.chatId, visibility: cmd.visibility }));
}

async function deleteTrailingMessagesHandler(
  cmd: DeleteTrailingMessages,
  uow: UnitOfWork<ChatRepos>,
): Promise<void> {
  await uow(async (repos) => {
    const [message] = await repos.chatRepo.getMessageById({ id: cmd.id });
    if (!message) return;
    await repos.chatRepo.deleteMessagesByChatIdAfterTimestamp({
      chatId: message.chat_id,
      timestamp: message.created_at,
    });
    uow.addEvent(TrailingMessagesDeleted({ chatId: message.chat_id }));
  });
}

async function saveMessagesHandler(cmd: SaveMessages, uow: UnitOfWork<ChatRepos>): Promise<void> {
  await uow((repos) => repos.chatRepo.createMessages({ messages: cmd.messages }));
  const chatId = cmd.messages[0]?.chat_id ?? "";
  uow.addEvent(MessagesSaved({ chatId, count: cmd.messages.length }));
}

/** chat 모듈 커맨드 핸들러 레지스트리 — bootstrap 이 bus 에 조립한다. */
export const chatCommandHandlers = {
  [UpdateChatVisibility.type]: createCommandEntry(chatUowFactory, updateChatVisibilityHandler),
  [DeleteTrailingMessages.type]: createCommandEntry(chatUowFactory, deleteTrailingMessagesHandler),
  [SaveMessages.type]: createCommandEntry(chatUowFactory, saveMessagesHandler),
};
