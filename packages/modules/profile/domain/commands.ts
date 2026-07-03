// profile 도메인 커맨드 (쓰기 의도). 어댑터가 bus.handle(Command) 로 디스패치한다.
import { createCommand } from "@fortuneteller/shared/domain/message";
import type { AuthUser } from "@fortuneteller/modules/profile/domain/ports";

export const UpsertProfileFromAuthUser = createCommand("profile.UpsertProfileFromAuthUser")<{
  authUser: AuthUser;
}>();
export type UpsertProfileFromAuthUser = ReturnType<typeof UpsertProfileFromAuthUser>;
