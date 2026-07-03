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
