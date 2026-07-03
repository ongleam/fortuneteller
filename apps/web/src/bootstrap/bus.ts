// 메시지 버스 조립 — 모듈별 커맨드/이벤트 핸들러를 등록한다.
// 어댑터(actions/tools/routes)는 이 bus 로 커맨드를 디스패치한다: bus.handle(SomeCommand({...})).
import {
  createMessageBus,
  type CommandHandlers,
  type EventHandlers,
} from "@fortuneteller/shared/application/message-bus";
import { profileCommandHandlers } from "@fortuneteller/modules/profile/application/handlers";
import { chatCommandHandlers } from "@fortuneteller/modules/chat/application/handlers";

const commandHandlers: CommandHandlers = {
  ...profileCommandHandlers,
  ...chatCommandHandlers,
};

const eventHandlers: EventHandlers = {};

export const bus = createMessageBus(commandHandlers, eventHandlers, {
  error: (message, error) => console.error(message, error),
});
