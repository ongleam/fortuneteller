// profile 도메인 이벤트 (일어난 사실). 커맨드 핸들러가 uow.addEvent 로 발행하고,
// bus 가 등록된 이벤트 핸들러로 cascade 한다(구독자는 필요 시 bootstrap 에서 등록).
import { createEvent } from "@fortuneteller/shared/domain/message";

export const SajuProfileUpdated = createEvent("profile.SajuProfileUpdated")<{
  kakaoUserId: string;
}>();
export type SajuProfileUpdated = ReturnType<typeof SajuProfileUpdated>;

export const ProfileUpserted = createEvent("profile.ProfileUpserted")<{
  userId: string;
}>();
export type ProfileUpserted = ReturnType<typeof ProfileUpserted>;
