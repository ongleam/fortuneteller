// profile 조회/생성 쿼리 (비트랜잭션 standalone). ongleam infra 패턴 — 모듈이 SQL 소유.
import { eq } from "drizzle-orm";
import { db } from "@fortuneteller/db/client";
import { profile, type Profile } from "@fortuneteller/db/schema";
import { generateUUID } from "@fortuneteller/shared/utils";

export async function getProfileByUserId({ id }: { id: string }): Promise<Profile | null> {
  try {
    const [result] = await db.select().from(profile).where(eq(profile.user_id, id));
    return result ?? null;
  } catch (error) {
    console.error("Failed to get profile by user id from database");
    throw error;
  }
}

export async function createProfile({
  id,
  name,
  user_kakao_id,
  avatar_url,
}: {
  id: string;
  name: string;
  user_kakao_id?: string;
  avatar_url?: string;
}) {
  try {
    const avatarUrl = avatar_url || `https://avatar.vercel.sh/${id}.png`;
    const [newProfile] = await db
      .insert(profile)
      .values({ user_id: id, name, avatar_url: avatarUrl, user_kakao_id })
      .returning();
    return newProfile;
  } catch (error) {
    console.error("Failed to create profile in database");
    throw error;
  }
}

/** 소개팅 프로필 편집 필드 (전부 optional — 넘어온 것만 갱신). */
export interface DatingProfileFields {
  gender?: "남성" | "여성" | null;
  birth_type?: "양력" | "음력" | null;
  birth_year?: number | null;
  birth_month?: number | null;
  birth_day?: number | null;
  birth_time?: Profile["birth_time"];
  bio?: string | null;
  region?: string | null;
  photo_urls?: string[];
  pref_gender?: "남성" | "여성" | "무관";
  pref_age_min?: number | null;
  pref_age_max?: number | null;
  status?: "draft" | "active" | "hidden";
}

/** 세션 유저(userId)의 소개팅 프로필을 갱신한다. userId 는 어댑터가 세션에서 강제 주입. */
export async function updateDatingProfile({
  userId,
  data,
}: {
  userId: string;
  data: DatingProfileFields;
}): Promise<Profile | null> {
  try {
    // 허용 컬럼만 명시적으로 추린다 — mass-assignment 방지(RLS 꺼짐 보완).
    // 크래프트된 호출이 name·avatar_url·user_kakao_id·theme·user_id 등을 못 쓰게 한다.
    const allowed: (keyof DatingProfileFields)[] = [
      "gender",
      "birth_type",
      "birth_year",
      "birth_month",
      "birth_day",
      "birth_time",
      "bio",
      "region",
      "photo_urls",
      "pref_gender",
      "pref_age_min",
      "pref_age_max",
      "status",
    ];
    const patch: Partial<DatingProfileFields> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) (patch as Record<string, unknown>)[key] = data[key];
    }

    // 공개(active) 전환은 필수 필드(성별·생년월일)를 서버에서 강제한다 — 폼/UI 를 신뢰하지 않는다.
    // 미완성 프로필이 active 로 추천 피드에 노출(나이 없음·궁합 0)되는 것을 막는다.
    if (patch.status === "active") {
      const [current] = await db.select().from(profile).where(eq(profile.user_id, userId)).limit(1);
      const effective = { ...current, ...patch };
      if (
        !effective.gender ||
        !effective.birth_year ||
        !effective.birth_month ||
        !effective.birth_day
      ) {
        throw new Error("프로필 공개(active)에는 성별과 생년월일이 필요합니다.");
      }
    }

    const [updated] = await db
      .update(profile)
      .set({ ...patch, updated_at: new Date() })
      .where(eq(profile.user_id, userId))
      .returning();
    return updated ?? null;
  } catch (error) {
    console.error("Failed to update dating profile in database");
    throw error;
  }
}

export async function getOrCreateProfileByUserKakaoId({
  user_kakao_id,
}: {
  user_kakao_id: string;
}): Promise<Profile> {
  const existingProfile = await db
    .select()
    .from(profile)
    .where(eq(profile.user_kakao_id, user_kakao_id))
    .limit(1);

  if (existingProfile.length > 0) {
    return existingProfile[0];
  }

  try {
    return await createProfile({
      id: generateUUID(),
      name: `Kakao-${user_kakao_id.substring(0, 8)}`,
      user_kakao_id,
    });
  } catch (error) {
    console.error("Failed `getOrCreateProfileByUserKakaoId`: ", error);
    throw error;
  }
}
