"use server";

import type { User } from "@supabase/auth-js";
import { UpsertProfileFromAuthUser } from "@fortuneteller/modules/profile/domain/commands";
import type { UpsertProfileResult } from "@fortuneteller/modules/profile/domain/value-objects";
import {
  updateDatingProfile as updateDatingProfileQuery,
  type DatingProfileFields,
} from "@fortuneteller/modules/profile/infra/queries";
import { createServerClient } from "@fortuneteller/clients/supabase/server";
import { bus } from "@/bootstrap/bus";

export async function upsertProfileFromSupabaseUser(supabaseUser: User) {
  return bus.handle<UpsertProfileResult>(
    UpsertProfileFromAuthUser({
      authUser: {
        id: supabaseUser.id,
        is_anonymous: supabaseUser.is_anonymous,
        email: supabaseUser.email,
        user_metadata: supabaseUser.user_metadata,
      },
    }),
  );
}

/** 세션 유저의 소개팅 프로필을 갱신한다. userId 는 세션에서 강제 주입(RLS-off 보완). */
export async function updateDatingProfile(data: DatingProfileFields) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "로그인이 필요합니다." };
  try {
    const updated = await updateDatingProfileQuery({ userId: user.id, data });
    return { success: true, profile: updated };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
