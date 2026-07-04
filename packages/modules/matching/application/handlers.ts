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
  let matched = false; // 현재 두 사람이 매칭 상태인가(이번 요청 이후 기준)
  let newlyMatched = false; // 이번 좋아요로 새로 성립했는가(이벤트 발행 조건)

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

      // 양쪽 *_liked_at 이 모두 차면 매칭 상태. 아직 미성립이면 이번에 성립시킨다.
      const updated = await repos.matchRepo.getMatch({ userAId, userBId });
      const bothLiked = Boolean(updated?.a_liked_at && updated?.b_liked_at);
      if (bothLiked && updated && !updated.matched_at) {
        // 성립 시점에 점수를 (재)계산 — 최초 좋아요가 생년월일 미입력 상태(score=0)였어도 교정한다.
        let finalScore = updated.score;
        const { a, b } = await repos.matchRepo.getSajuProfiles({ userAId, userBId });
        if (a && b) {
          try {
            finalScore = (await computeProfileHarmony(a, b)).score;
          } catch {
            /* 계산 실패 시 기존 점수 유지 */
          }
        }
        await repos.matchRepo.updateMatchedAt({
          userAId,
          userBId,
          matchedAt: now,
          score: finalScore,
        });
        newlyMatched = true;
      }
      matched = bothLiked; // 재-좋아요 등으로 이미 성립돼 있어도 현재 상태를 반영
    });

    if (newlyMatched) uow.addEvent(MatchCreated({ userAId, userBId }));
    return { success: true, matched };
  } catch (error) {
    return { success: false, matched: false, error: (error as Error).message };
  }
}

/** matching 모듈 커맨드 핸들러 레지스트리 — bootstrap 이 bus 에 조립한다. */
export const matchingCommandHandlers = {
  [LikeUser.type]: createCommandEntry(matchingUowFactory, likeUserHandler),
};
