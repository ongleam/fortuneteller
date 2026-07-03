// chat 도메인 커맨드 (쓰기 의도). 어댑터가 bus.handle(Command) 로 디스패치한다.
import { createCommand } from "@fortuneteller/shared/domain/message";
import type { VisibilityType } from "@fortuneteller/shared/types/chat";
import type { NewMessage } from "@fortuneteller/modules/chat/domain/ports";

export const UpdateChatVisibility = createCommand("chat.UpdateChatVisibility")<{
  chatId: string;
  visibility: VisibilityType;
}>();
export type UpdateChatVisibility = ReturnType<typeof UpdateChatVisibility>;

export const DeleteTrailingMessages = createCommand("chat.DeleteTrailingMessages")<{
  id: string;
}>();
export type DeleteTrailingMessages = ReturnType<typeof DeleteTrailingMessages>;

export const SaveMessages = createCommand("chat.SaveMessages")<{
  messages: NewMessage[];
}>();
export type SaveMessages = ReturnType<typeof SaveMessages>;
