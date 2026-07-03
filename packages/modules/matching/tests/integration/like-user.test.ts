// matching 더블옵트인 통합 테스트 (High Gear) — 인메모리 fake repo 로 상태 전이를 검증한다.
// 실 DB 없이 likeUserHandler 의 좋아요→성립 로직·궁합 점수 고정을 결정적으로 확인한다.
import { describe, expect, it, mock } from "bun:test";
import { withEventBuffer, type UnitOfWork } from "@fortuneteller/shared/application/unit-of-work";
import type { MatchRepository, MatchRow, MatchingRepos, SajuProfile } from "../../domain/ports";
import type { LikeUserResult } from "../../domain/value-objects";

// db/client 는 `server-only` 를 import 한다(RSC 밖에서 throw). handler 는 결코 실 DB 를
// 건드리지 않으므로(fake uow 주입), 테스트에서는 server-only 가드만 무력화한다.
mock.module("server-only", () => ({}));
const { matchingCommandHandlers } = await import("../../application/handlers");
const { LikeUser } = await import("../../domain/commands");
const { MatchCreated } = await import("../../domain/events");

// canonical 정렬: 문자열 오름차순. USER_A < USER_B.
const USER_A = "00000000-0000-0000-0000-00000000000a";
const USER_B = "00000000-0000-0000-0000-00000000000b";

const PROFILE_A: SajuProfile = {
  gender: "남성",
  birth_type: "양력",
  birth_year: 1990,
  birth_month: 5,
  birth_day: 15,
  birth_time: "10",
};
const PROFILE_B: SajuProfile = {
  gender: "여성",
  birth_type: "양력",
  birth_year: 1992,
  birth_month: 8,
  birth_day: 23,
  birth_time: "16",
};

function keyOf(a: string, b: string) {
  return `${a}|${b}`;
}

/** store(Map)를 공유하는 fake MatchRepository + UoW 를 만든다. */
function makeFakeUow(store: Map<string, MatchRow>): UnitOfWork<MatchingRepos> {
  const repo: MatchRepository = {
    async getMatch({ userAId, userBId }) {
      return store.get(keyOf(userAId, userBId)) ?? null;
    },
    async getSajuProfiles({ userAId }) {
      // canonical 상 A/B 를 프로필로 매핑(테스트 고정).
      return userAId === USER_A ? { a: PROFILE_A, b: PROFILE_B } : { a: PROFILE_B, b: PROFILE_A };
    },
    async upsertLike({ userAId, userBId, side, likedAt, score }) {
      const k = keyOf(userAId, userBId);
      const existing = store.get(k);
      if (!existing) {
        store.set(k, {
          user_a_id: userAId,
          user_b_id: userBId,
          a_liked_at: side === "a" ? likedAt : null,
          b_liked_at: side === "b" ? likedAt : null,
          matched_at: null,
          score,
        });
        return;
      }
      store.set(k, {
        ...existing,
        a_liked_at: side === "a" ? likedAt : existing.a_liked_at,
        b_liked_at: side === "b" ? likedAt : existing.b_liked_at,
      });
    },
    async setMatched({ userAId, userBId, matchedAt }) {
      const k = keyOf(userAId, userBId);
      const existing = store.get(k);
      if (existing) store.set(k, { ...existing, matched_at: matchedAt });
    },
  };
  return withEventBuffer<MatchingRepos>((fn) => fn({ matchRepo: repo }));
}

const entry = matchingCommandHandlers[LikeUser.type];

async function like(store: Map<string, MatchRow>, actorId: string, targetId: string) {
  const uow = makeFakeUow(store);
  const result = (await entry.handle(LikeUser({ actorId, targetId }), uow)) as LikeUserResult;
  return { result, events: uow.collectNewEvents() };
}

describe("likeUserHandler — 더블옵트인", () => {
  it("A→B 단방향 좋아요는 pending(matched_at null)이다", async () => {
    const store = new Map<string, MatchRow>();
    const { result } = await like(store, USER_A, USER_B);

    expect(result.success).toBe(true);
    expect(result.matched).toBe(false);
    const row = store.get(keyOf(USER_A, USER_B))!;
    expect(row.a_liked_at).not.toBeNull();
    expect(row.b_liked_at).toBeNull();
    expect(row.matched_at).toBeNull();
    expect(row.score).toBeGreaterThanOrEqual(0);
    expect(row.score).toBeLessThanOrEqual(100);
  });

  it("A→B 후 B→A 면 matched_at 이 세팅되고 MatchCreated 이벤트가 발행된다", async () => {
    const store = new Map<string, MatchRow>();
    await like(store, USER_A, USER_B);
    const scoreAfterFirst = store.get(keyOf(USER_A, USER_B))!.score;

    const { result, events } = await like(store, USER_B, USER_A);

    expect(result.matched).toBe(true);
    const row = store.get(keyOf(USER_A, USER_B))!;
    expect(row.a_liked_at).not.toBeNull();
    expect(row.b_liked_at).not.toBeNull();
    expect(row.matched_at).not.toBeNull();
    // 점수는 최초 생성 시 고정 — 이후 좋아요로 바뀌지 않는다.
    expect(row.score).toBe(scoreAfterFirst);
    expect(events.some((e) => e.type === MatchCreated.type)).toBe(true);
  });

  it("canonical 정렬로 방향(B→A 먼저)이 달라도 같은 행을 공유한다", async () => {
    const store = new Map<string, MatchRow>();
    await like(store, USER_B, USER_A); // b_liked_at
    const { result } = await like(store, USER_A, USER_B); // a_liked_at → 성립

    expect(store.size).toBe(1);
    expect(result.matched).toBe(true);
  });

  it("자기 자신 좋아요는 거부된다", async () => {
    const store = new Map<string, MatchRow>();
    const { result } = await like(store, USER_A, USER_A);
    expect(result.success).toBe(false);
    expect(store.size).toBe(0);
  });
});
