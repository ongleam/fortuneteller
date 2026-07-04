"use server";

import { createServerClient } from "@fortuneteller/clients/supabase/server";
import { bus } from "@/bootstrap/bus";
import { LikeUser } from "@fortuneteller/modules/matching/domain/commands";
import type { LikeUserResult } from "@fortuneteller/modules/matching/domain/value-objects";
import {
  getRecommendations as getRecommendationsQuery,
  getMatchedPartners,
  type DiscoverCandidate,
  type MatchedPartner,
} from "@fortuneteller/modules/matching/infra/queries";
import { getProfileByUserId } from "@fortuneteller/modules/profile/infra/queries";

/** 세션 유저를 강제로 해석한다(클라 전달 id 신뢰 금지 = RLS-off 보완). */
async function requireUserId(): Promise<string> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");
  return user.id;
}

/** 세션 유저가 상대(likedId)에게 좋아요. 양방 좋아요면 매칭 성립. */
export async function likeUser(likedId: string): Promise<LikeUserResult> {
  const actorId = await requireUserId();
  // 대상 적격성 검증 — 서버 액션 직접 호출로 draft/hidden(비노출) 프로필에
  // 좋아요/매칭을 만드는 것을 막는다(추천 피드 제외 대상과 일관).
  const target = await getProfileByUserId({ id: likedId });
  if (!target || target.status !== "active") {
    return { success: false, matched: false, error: "좋아요할 수 없는 상대입니다." };
  }
  return bus.handle<LikeUserResult>(LikeUser({ actorId, targetId: likedId }));
}

/** 세션 유저 기준 궁합순 추천 피드. */
export async function getRecommendations(): Promise<DiscoverCandidate[]> {
  const userId = await requireUserId();
  return getRecommendationsQuery({ userId });
}

/** 세션 유저 기준 매칭 성립 상대 목록. */
export async function getMatches(): Promise<MatchedPartner[]> {
  const userId = await requireUserId();
  return getMatchedPartners({ userId });
}
