// profile 커맨드 핸들러 — bus 에 등록되어 UoW(트랜잭션)+repo 로 쓰기를 처리한다.
import { createCommandEntry } from "@fortuneteller/shared/application/message-bus";
import type { UnitOfWork } from "@fortuneteller/shared/application/unit-of-work";
import { UpsertProfileFromAuthUser } from "@fortuneteller/modules/profile/domain/commands";
import { ProfileUpserted } from "@fortuneteller/modules/profile/domain/events";
import type { AuthUser, ProfileRepos } from "@fortuneteller/modules/profile/domain/ports";
import type { UpsertProfileResult } from "@fortuneteller/modules/profile/domain/value-objects";
import { profileUowFactory } from "@fortuneteller/modules/profile/infra/unit-of-work";

// upsert 중복 요청 방지(in-flight 가드).
const processingProfiles = new Set<string>();

/** 인증 유저 → 프로필 표시 정보(이름·아바타) 유도. */
function deriveProfileIdentity(authUser: AuthUser): { name: string; avatarUrl: string | null } {
  if (authUser.is_anonymous) {
    const short = authUser.id.substring(0, 6);
    return { name: `게스트 ${short}`, avatarUrl: `https://avatar.vercel.sh/guest-${short}` };
  }
  const md = authUser.user_metadata ?? {};
  return {
    name:
      (md.name as string) ||
      (md.full_name as string) ||
      authUser.email ||
      `Guest-${authUser.id.substring(0, 6)}`,
    avatarUrl: (md.avatar_url as string) || (md.picture as string) || null,
  };
}

async function upsertProfileHandler(
  cmd: UpsertProfileFromAuthUser,
  uow: UnitOfWork<ProfileRepos>,
): Promise<UpsertProfileResult> {
  const { authUser } = cmd;
  if (!authUser.id) return { success: false, error: "Invalid user data" };
  if (processingProfiles.has(authUser.id)) return { success: true, skipped: true };
  processingProfiles.add(authUser.id);
  try {
    const identity = deriveProfileIdentity(authUser);
    await uow((repos) => repos.profileRepo.upsertProfile({ userId: authUser.id, ...identity }));
    uow.addEvent(ProfileUpserted({ userId: authUser.id }));
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  } finally {
    processingProfiles.delete(authUser.id);
  }
}

/** profile 모듈 커맨드 핸들러 레지스트리 — bootstrap 이 bus 에 조립한다. */
export const profileCommandHandlers = {
  [UpsertProfileFromAuthUser.type]: createCommandEntry(profileUowFactory, upsertProfileHandler),
};
