'use server';

import { db } from '@/lib/infra/db/queries';
import { profile as profileTable } from '@/lib/infra/db/schema';
import { User } from '@supabase/auth-js';
import { eq } from 'drizzle-orm';

// 중복 요청 방지를 위한 변수
const processingProfiles = new Set<string>();

export async function upsertProfileFromSupabaseUser(supabaseUser: User) {
  const userId = supabaseUser.id;

  // console.log(
  //   '[Action] upsertProfileFromSupabaseUser raw supabaseUser.user_metadata:',
  //   JSON.stringify(supabaseUser, null, 2)
  // );
  // console.log('[Action] upsertProfileFromSupabaseUser: Supabase user object:', supabaseUser);

  if (!userId) {
    // console.error('[Action] upsertProfileFromSupabaseUser: Invalid Supabase user object.');
    return { success: false, error: 'Invalid user data' };
  }

  // 이미 처리 중인 프로필인 경우 중복 요청 방지
  if (processingProfiles.has(userId)) {
    // console.log(`[Action] Profile update for user ${userId} already in progress, skipping`);
    return { success: true, skipped: true };
  }

  // 처리 중 표시
  processingProfiles.add(userId);

  let profileName: string;
  let profileAvatarUrl: string | null = null;

  if (supabaseUser.is_anonymous) {
    // 익명 사용자 처리
    profileName = `게스트 ${supabaseUser.id.substring(0, 6)}`;
    // 익명 사용자는 카카오 프로필 이미지가 없으므로 기본 아바타 또는 null
    profileAvatarUrl = `https://avatar.vercel.sh/guest-${supabaseUser.id.substring(0, 6)}`;
  } else {
    // 인증된 사용자 (카카오 등)
    profileName =
      supabaseUser.user_metadata?.name || // 카카오 닉네임
      supabaseUser.user_metadata?.full_name || // 다른 OAuth 제공자
      supabaseUser.email || // 이메일
      `Guest-${supabaseUser.id.substring(0, 6)}`; // 최후의 수단
    profileAvatarUrl =
      supabaseUser.user_metadata?.avatar_url || // 카카오 프로필 사진
      supabaseUser.user_metadata?.picture || // 다른 OAuth 제공자
      null;
  }

  try {
    const updateData = {
      name: profileName,
      avatar_url: profileAvatarUrl,
      updated_at: new Date(),
    };

    // 프로필 존재 여부 확인
    const existingProfile = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.user_id, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      // console.log(`[Action] Updating profile for user: ${supabaseUser.id}`);
      await db
        .update(profileTable)
        .set(updateData)
        .where(eq(profileTable.user_id, supabaseUser.id));
    } else {
      console.log(`[Action] Creating new profile for user: ${supabaseUser.id}`);
      await db.insert(profileTable).values({
        user_id: supabaseUser.id,
        ...updateData,
        created_at: new Date(), // 생성 시점 설정
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error upserting profile:', error);
    return { success: false, error: (error as Error).message };
  } finally {
    processingProfiles.delete(supabaseUser.id);
  }
}
