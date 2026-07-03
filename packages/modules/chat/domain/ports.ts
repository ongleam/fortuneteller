// chat 도메인 포트 — 외부 I/O·영속성 계약. infra 가 구현한다.
import type { LanguageModel, ModelMessage, UIMessage } from "ai";
import type { z } from "zod";
import type { VisibilityType } from "@fortuneteller/shared/types/chat";
import type { KakaoUserProfile } from "@fortuneteller/shared/types/kakao";

/** 카카오 유저 API 클라이언트. */
export interface KakaoClient {
  getKakaoUserInfo(accessToken: string): Promise<KakaoUserProfile>;
}

/** LLM 실행 클라이언트(Vercel AI SDK 추상화). use-case 는 이 계약에만 의존하고
 *  구체 구현(infra/ai-client)은 어댑터가 주입한다 — application 은 프레임워크를 모른다. */
export interface AiClient {
  generateText(args: { model: LanguageModel; system: string; prompt: string }): Promise<string>;
  generateObjectArray<T>(args: {
    model: LanguageModel;
    system: string;
    prompt: string;
    schema: z.ZodType<T>;
  }): Promise<T[]>;
  toModelMessages(messages: UIMessage[]): Promise<ModelMessage[]>;
}

/** 저장할 메시지 (parts/attachments 구조). */
export interface NewMessage {
  id: string;
  chat_id: string;
  role: string;
  parts: unknown;
  attachments: unknown;
  created_at: Date;
}

/** 채팅·메시지 영속성 포트. */
export interface ChatRepository {
  createMessages(args: { messages: NewMessage[] }): Promise<void>;
  getMessageById(args: { id: string }): Promise<{ chat_id: string; created_at: Date }[]>;
  deleteMessagesByChatIdAfterTimestamp(args: { chatId: string; timestamp: Date }): Promise<void>;
  updateChatVisibility(args: { chatId: string; visibility: VisibilityType }): Promise<void>;
}

/** chat 모듈 UoW 가 제공하는 repo 번들. */
export interface ChatRepos {
  chatRepo: ChatRepository;
}
