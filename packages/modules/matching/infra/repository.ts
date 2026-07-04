// matching 영속성 repository — 도메인 포트(MatchRepository)를 tx 바인딩으로 구현한다.
import type { DbClient } from "@fortuneteller/db/client";
import { match as matchTable, profile as profileTable } from "@fortuneteller/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import type { MatchRepository, SajuProfile } from "@fortuneteller/modules/matching/domain/ports";

function selectSaju(row: {
  gender: string | null;
  birth_type: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  birth_time: string | null;
}): SajuProfile {
  return {
    gender: row.gender,
    birth_type: row.birth_type,
    birth_year: row.birth_year,
    birth_month: row.birth_month,
    birth_day: row.birth_day,
    birth_time: row.birth_time,
  };
}

/** tx(트랜잭션)에 바인딩된 MatchRepository 를 만든다. 모든 인자는 canonical 정렬 전제. */
export function createMatchRepository(tx: DbClient): MatchRepository {
  return {
    async getMatch({ userAId, userBId }) {
      const [row] = await tx
        .select()
        .from(matchTable)
        .where(and(eq(matchTable.user_a_id, userAId), eq(matchTable.user_b_id, userBId)))
        .limit(1);
      return row ?? null;
    },

    async getSajuProfiles({ userAId, userBId }) {
      const rows = await tx
        .select({
          user_id: profileTable.user_id,
          gender: profileTable.gender,
          birth_type: profileTable.birth_type,
          birth_year: profileTable.birth_year,
          birth_month: profileTable.birth_month,
          birth_day: profileTable.birth_day,
          birth_time: profileTable.birth_time,
        })
        .from(profileTable)
        .where(inArray(profileTable.user_id, [userAId, userBId]));
      const byId = new Map(rows.map((r) => [r.user_id, r]));
      const a = byId.get(userAId);
      const b = byId.get(userBId);
      return { a: a ? selectSaju(a) : null, b: b ? selectSaju(b) : null };
    },

    async upsertLike({ userAId, userBId, side, likedAt, score }) {
      // 원자적 upsert — 동시 상호 좋아요가 PK 를 경합해도 한쪽이 유실되지 않는다.
      // 최초 insert 만 score 를 기록하고, 충돌 시 해당 쪽 *_liked_at 만 갱신한다.
      await tx
        .insert(matchTable)
        .values({
          user_a_id: userAId,
          user_b_id: userBId,
          score,
          a_liked_at: side === "a" ? likedAt : null,
          b_liked_at: side === "b" ? likedAt : null,
        })
        .onConflictDoUpdate({
          target: [matchTable.user_a_id, matchTable.user_b_id],
          set: side === "a" ? { a_liked_at: likedAt } : { b_liked_at: likedAt },
        });
    },

    async updateMatchedAt({ userAId, userBId, matchedAt, score }) {
      await tx
        .update(matchTable)
        .set({ matched_at: matchedAt, score })
        .where(and(eq(matchTable.user_a_id, userAId), eq(matchTable.user_b_id, userBId)));
    },
  };
}
