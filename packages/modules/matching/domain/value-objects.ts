// matching 도메인 값 객체 — 좋아요/매칭 결과의 원시 타입.

export interface LikeUserResult {
  success: boolean;
  matched: boolean; // 이번 좋아요로 매칭이 성립했는가
  error?: string;
}

/** canonical 정렬 결과 — user_a_id < user_b_id, actor 의 쪽(side). */
export interface CanonicalPair {
  userAId: string;
  userBId: string;
  actorSide: "a" | "b";
}

/** 두 유저 id 를 canonical(문자열 오름차순) 정렬하고 actor 의 쪽을 판정한다. */
export function toCanonicalPair(actorId: string, targetId: string): CanonicalPair {
  const [userAId, userBId] = [actorId, targetId].sort();
  return { userAId, userBId, actorSide: actorId === userAId ? "a" : "b" };
}
