import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@fortuneteller/clients/supabase/server";
import { getRecommendations } from "@fortuneteller/modules/matching/infra/queries";
import { getProfileByUserId } from "@fortuneteller/modules/profile/infra/queries";
import { DiscoverFeed } from "@/components/matching/discover-feed";
import { Button } from "@/components/ui/button";

export default async function DiscoverPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const me = await getProfileByUserId({ id: user.id });
  const needsProfile = !me || me.status !== "active" || !me.birth_year;
  const candidates = await getRecommendations({ userId: user.id });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 flex max-w-5xl items-center justify-between">
        <h1 className="bg-gradient-to-r from-rose-200 to-rose-400 bg-clip-text text-3xl font-bold text-transparent">
          궁합 추천
        </h1>
        <div className="flex gap-2">
          <Link href="/matches">
            <Button variant="outline" className="rounded-full border-rose-500 text-rose-200">
              매칭 목록
            </Button>
          </Link>
          <Link href="/profile/edit">
            <Button variant="outline" className="rounded-full border-slate-500 text-slate-200">
              프로필
            </Button>
          </Link>
        </div>
      </div>

      {needsProfile && (
        <div className="mx-auto mb-8 max-w-5xl rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-200">
          프로필을 완성하고 공개(active)로 설정하면 다른 사람의 추천에도 노출됩니다.{" "}
          <Link href="/profile/edit" className="underline">
            프로필 편집하기
          </Link>
        </div>
      )}

      <DiscoverFeed candidates={candidates} />
    </div>
  );
}
