"use server";

import type { User } from "@supabase/auth-js";
import { UpsertProfileFromAuthUser } from "@fortuneteller/modules/profile/domain/commands";
import type { UpsertProfileResult } from "@fortuneteller/modules/profile/domain/value-objects";
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
