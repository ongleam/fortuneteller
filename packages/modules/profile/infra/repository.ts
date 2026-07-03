// profile 영속성 repository — 도메인 포트(ProfileRepository)를 tx 바인딩으로 구현한다.
import type { DbClient } from "@fortuneteller/db/client";
import { profile as profileTable } from "@fortuneteller/db/schema";
import { eq } from "drizzle-orm";
import type { ProfileRepository } from "@fortuneteller/modules/profile/domain/ports";
import type {
  SajuProfile,
  UpdateSajuProfileInput,
} from "@fortuneteller/modules/profile/domain/value-objects";

/** tx(트랜잭션)에 바인딩된 ProfileRepository 를 만든다. */
export function createProfileRepository(tx: DbClient): ProfileRepository {
  return {
    async updateSajuProfile(
      kakaoUserId: string,
      input: UpdateSajuProfileInput,
    ): Promise<SajuProfile> {
      const [updated] = await tx
        .update(profileTable)
        .set({
          name: input.name,
          gender: input.gender,
          birth_type: input.calendar,
          birth_year: parseInt(input.year),
          birth_month: parseInt(input.month),
          birth_day: parseInt(input.day),
          birth_time: input.hour || null,
        })
        .where(eq(profileTable.user_kakao_id, kakaoUserId))
        .returning();
      return updated as SajuProfile;
    },

    async upsertProfile(args): Promise<void> {
      const now = new Date();
      const existing = await tx
        .select()
        .from(profileTable)
        .where(eq(profileTable.user_id, args.userId))
        .limit(1);

      if (existing.length > 0) {
        await tx
          .update(profileTable)
          .set({ name: args.name, avatar_url: args.avatarUrl, updated_at: now })
          .where(eq(profileTable.user_id, args.userId));
      } else {
        await tx.insert(profileTable).values({
          user_id: args.userId,
          name: args.name,
          avatar_url: args.avatarUrl,
          updated_at: now,
          created_at: now,
        });
      }
    },
  };
}
