// matching 조회 쿼리 (비트랜잭션 standalone). 추천 피드·매칭 목록 = SQL 필터 + computeHarmony 정렬.
// 세션 유저 기준 접근제어는 어댑터(actions)가 userId 를 강제 주입해 보장한다(RLS-off 보완).
import { and, eq, inArray, isNotNull, ne, or } from "drizzle-orm";
import { db } from "@fortuneteller/db/client";
import { match, profile } from "@fortuneteller/db/schema";
import { computeProfileHarmony } from "@fortuneteller/modules/fortune/application/handlers";

export interface DiscoverCandidate {
  userId: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  region: string | null;
  photoUrls: string[];
  gender: string | null;
  age: number | null;
  score: number;
  summary: string;
}

export interface MatchedPartner {
  userId: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  region: string | null;
  photoUrls: string[];
  score: number;
  matchedAt: Date | null;
}

function ageFromBirthYear(birthYear: number | null, currentYear: number): number | null {
  return birthYear ? currentYear - birthYear + 1 : null; // 세는나이 근사
}

function hasBirthData(p: {
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
}): boolean {
  return Boolean(p.birth_year && p.birth_month && p.birth_day);
}

/**
 * 궁합순 추천 피드. 본인 제외 + status='active' + 선호(성별/연령) 필터 +
 * 이미 내가 좋아요/매칭한 상대 제외 → computeHarmony 로 점수화·내림차순.
 */
export async function getRecommendations({
  userId,
}: {
  userId: string;
}): Promise<DiscoverCandidate[]> {
  const [me] = await db.select().from(profile).where(eq(profile.user_id, userId)).limit(1);
  if (!me) return [];

  // 이미 내가 좋아요했거나 매칭된 상대는 추천에서 제외한다.
  const myRows = await db
    .select()
    .from(match)
    .where(or(eq(match.user_a_id, userId), eq(match.user_b_id, userId)));
  const excluded = new Set<string>();
  for (const r of myRows) {
    const iAmA = r.user_a_id === userId;
    const iLiked = iAmA ? r.a_liked_at : r.b_liked_at;
    if (iLiked || r.matched_at) excluded.add(iAmA ? r.user_b_id : r.user_a_id);
  }

  const conds = [eq(profile.status, "active"), ne(profile.user_id, userId)];
  if (me.pref_gender && me.pref_gender !== "무관") {
    conds.push(eq(profile.gender, me.pref_gender as "남성" | "여성"));
  }
  const candidates = await db
    .select()
    .from(profile)
    .where(and(...conds));

  const currentYear = new Date().getFullYear();
  const out: DiscoverCandidate[] = [];
  for (const c of candidates) {
    if (excluded.has(c.user_id)) continue;
    const age = ageFromBirthYear(c.birth_year, currentYear);
    if (age != null) {
      if (me.pref_age_min != null && age < me.pref_age_min) continue;
      if (me.pref_age_max != null && age > me.pref_age_max) continue;
    }

    let score = 0;
    let summary = "";
    if (hasBirthData(me) && hasBirthData(c)) {
      try {
        const h = await computeProfileHarmony(me, c);
        score = h.score;
        summary = h.summary;
      } catch {
        score = 0;
      }
    }

    out.push({
      userId: c.user_id,
      name: c.name,
      avatarUrl: c.avatar_url,
      bio: c.bio,
      region: c.region,
      photoUrls: c.photo_urls ?? [],
      gender: c.gender,
      age,
      score,
      summary,
    });
  }

  out.sort((a, b) => b.score - a.score);
  return out;
}

/** 매칭 성립(matched_at IS NOT NULL)한 상대 목록. */
export async function getMatchedPartners({
  userId,
}: {
  userId: string;
}): Promise<MatchedPartner[]> {
  const rows = await db
    .select()
    .from(match)
    .where(
      and(
        isNotNull(match.matched_at),
        or(eq(match.user_a_id, userId), eq(match.user_b_id, userId)),
      ),
    );
  const otherIds = rows.map((r) => (r.user_a_id === userId ? r.user_b_id : r.user_a_id));
  if (otherIds.length === 0) return [];

  const profiles = await db.select().from(profile).where(inArray(profile.user_id, otherIds));
  const byId = new Map(profiles.map((p) => [p.user_id, p]));

  const out: MatchedPartner[] = [];
  for (const r of rows) {
    const otherId = r.user_a_id === userId ? r.user_b_id : r.user_a_id;
    const p = byId.get(otherId);
    if (!p) continue;
    out.push({
      userId: otherId,
      name: p.name,
      avatarUrl: p.avatar_url,
      bio: p.bio,
      region: p.region,
      photoUrls: p.photo_urls ?? [],
      score: r.score,
      matchedAt: r.matched_at,
    });
  }
  return out;
}
