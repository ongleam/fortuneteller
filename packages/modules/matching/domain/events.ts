// matching 도메인 이벤트 (일어난 사실). 커맨드 핸들러가 uow.addEvent 로 발행한다.
import { createEvent } from "@fortuneteller/shared/domain/message";

export const MatchCreated = createEvent("matching.MatchCreated")<{
  userAId: string; // canonical min
  userBId: string; // canonical max
}>();
export type MatchCreated = ReturnType<typeof MatchCreated>;
