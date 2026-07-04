import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@fortuneteller/clients/supabase/server";
import { getProfileByUserId } from "@fortuneteller/modules/profile/infra/queries";
import { ProfileEditForm } from "@/components/matching/profile-edit-form";
import { Button } from "@/components/ui/button";
import { brandColors } from "@/components/brand/theme";
import { BrandMark, BrushRule, ParchmentShell, Seal } from "@/components/brand/elements";

const { ink: INK, sub: SUB } = brandColors;

export default async function ProfileEditPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const me = await getProfileByUserId({ id: user.id });

  return (
    <ParchmentShell>
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link href="/">
          <BrandMark size={28} />
        </Link>
        <Link href="/discover">
          <Button
            variant="outline"
            className="rounded-none border-2 bg-transparent"
            style={{ borderColor: INK, color: INK }}
          >
            상대 찾기
          </Button>
        </Link>
      </header>
      <div className="mx-auto h-px max-w-2xl" style={{ backgroundColor: brandColors.line }} />

      <section className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Seal char="命" size={40} />
          <div>
            <p className="text-sm tracking-[0.3em]" style={{ color: SUB }}>
              命式
            </p>
            <h1 className="text-3xl font-extrabold" style={{ color: INK }}>
              프로필 적기
            </h1>
          </div>
        </div>
        <div className="mb-8 h-3 w-40">
          <BrushRule color={INK} className="h-full w-full" />
        </div>

        <ProfileEditForm
          initial={{
            gender: me?.gender ?? null,
            birth_type: me?.birth_type ?? null,
            birth_year: me?.birth_year ?? null,
            birth_month: me?.birth_month ?? null,
            birth_day: me?.birth_day ?? null,
            birth_time: me?.birth_time ?? null,
            bio: me?.bio ?? null,
            region: me?.region ?? null,
            photo_urls: me?.photo_urls ?? [],
            pref_gender: me?.pref_gender ?? null,
            pref_age_min: me?.pref_age_min ?? null,
            pref_age_max: me?.pref_age_max ?? null,
            status: me?.status ?? null,
          }}
        />
      </section>
    </ParchmentShell>
  );
}
