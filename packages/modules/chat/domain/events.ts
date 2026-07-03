// chat 도메인 이벤트 (일어난 사실). 커맨드 핸들러가 uow.addEvent 로 발행한다.
import { createEvent } from "@fortuneteller/shared/domain/message";

export const ChatVisibilityUpdated = createEvent("chat.ChatVisibilityUpdated")<{
  chatId: string;
  visibility: "private" | "public";
}>();
export type ChatVisibilityUpdated = ReturnType<typeof ChatVisibilityUpdated>;

export const TrailingMessagesDeleted = createEvent("chat.TrailingMessagesDeleted")<{
  chatId: string;
}>();
export type TrailingMessagesDeleted = ReturnType<typeof TrailingMessagesDeleted>;

export const MessagesSaved = createEvent("chat.MessagesSaved")<{
  chatId: string;
  count: number;
}>();
export type MessagesSaved = ReturnType<typeof MessagesSaved>;
