import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@fortuneteller/clients/supabase/server";
import { getProfileByUserId } from "@fortuneteller/modules/profile/infra/queries";
import { ProfileEditForm } from "@/components/matching/profile-edit-form";
import { Button } from "@/components/ui/button";

export default async function ProfileEditPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const me = await getProfileByUserId({ id: user.id });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 flex max-w-2xl items-center justify-between">
        <h1 className="bg-gradient-to-r from-rose-200 to-rose-400 bg-clip-text text-3xl font-bold text-transparent">
          프로필 편집
        </h1>
        <Link href="/discover">
          <Button variant="outline" className="rounded-full border-rose-500 text-rose-200">
            상대 찾기
          </Button>
        </Link>
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
    </div>
  );
}
