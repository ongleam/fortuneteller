// matching 커맨드 핸들러 — bus 에 등록되어 UoW(트랜잭션)+repo 로 더블옵트인을 처리한다.
import { createCommandEntry } from "@fortuneteller/shared/application/message-bus";
import type { UnitOfWork } from "@fortuneteller/shared/application/unit-of-work";
import { computeProfileHarmony } from "@fortuneteller/modules/fortune/application/handlers";
import { LikeUser } from "@fortuneteller/modules/matching/domain/commands";
import { MatchCreated } from "@fortuneteller/modules/matching/domain/events";
import type { MatchingRepos } from "@fortuneteller/modules/matching/domain/ports";
import {
  toCanonicalPair,
  type LikeUserResult,
} from "@fortuneteller/modules/matching/domain/value-objects";
import { matchingUowFactory } from "@fortuneteller/modules/matching/infra/unit-of-work";

async function likeUserHandler(
  cmd: LikeUser,
  uow: UnitOfWork<MatchingRepos>,
): Promise<LikeUserResult> {
  const { actorId, targetId } = cmd;
  if (!actorId || !targetId) return { success: false, matched: false, error: "Invalid ids" };
  if (actorId === targetId) return { success: false, matched: false, error: "Cannot like self" };

  const { userAId, userBId, actorSide } = toCanonicalPair(actorId, targetId);
  const now = new Date();
  let matched = false;

  try {
    await uow(async (repos) => {
      const existing = await repos.matchRepo.getMatch({ userAId, userBId });

      // 최초 좋아요 시에만 궁합 점수를 계산해 고정한다.
      let score = existing?.score ?? 0;
      if (!existing) {
        const { a, b } = await repos.matchRepo.getSajuProfiles({ userAId, userBId });
        if (a && b) {
          try {
            score = (await computeProfileHarmony(a, b)).score;
          } catch {
            score = 0;
          }
        }
      }

      await repos.matchRepo.upsertLike({ userAId, userBId, side: actorSide, likedAt: now, score });

      // 양쪽 *_liked_at 이 모두 찼고 아직 미성립이면 매칭 성립.
      const updated = await repos.matchRepo.getMatch({ userAId, userBId });
      if (updated && updated.a_liked_at && updated.b_liked_at && !updated.matched_at) {
        await repos.matchRepo.setMatched({ userAId, userBId, matchedAt: now });
        matched = true;
      }
    });

    if (matched) uow.addEvent(MatchCreated({ userAId, userBId }));
    return { success: true, matched };
  } catch (error) {
    return { success: false, matched: false, error: (error as Error).message };
  }
}

/** matching 모듈 커맨드 핸들러 레지스트리 — bootstrap 이 bus 에 조립한다. */
export const matchingCommandHandlers = {
  [LikeUser.type]: createCommandEntry(matchingUowFactory, likeUserHandler),
};
