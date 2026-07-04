// matching 도메인 커맨드 (쓰기 의도). 어댑터가 bus.handle(Command) 로 디스패치한다.
import { createCommand } from "@fortuneteller/shared/domain/message";

export const LikeUser = createCommand("matching.LikeUser")<{
  actorId: string; // 좋아요를 누른 세션 유저
  targetId: string; // 좋아요 대상
}>();
export type LikeUser = ReturnType<typeof LikeUser>;
