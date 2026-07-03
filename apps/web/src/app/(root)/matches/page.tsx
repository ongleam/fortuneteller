import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@fortuneteller/clients/supabase/server";
import { getMatchedPartners } from "@fortuneteller/modules/matching/infra/queries";
import { Button } from "@/components/ui/button";

export default async function MatchesPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const partners = await getMatchedPartners({ userId: user.id });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-800 to-black px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 flex max-w-4xl items-center justify-between">
        <h1 className="bg-gradient-to-r from-rose-200 to-rose-400 bg-clip-text text-3xl font-bold text-transparent">
          매칭 목록
        </h1>
        <Link href="/discover">
          <Button variant="outline" className="rounded-full border-rose-500 text-rose-200">
            상대 찾기
          </Button>
        </Link>
      </div>

      {partners.length === 0 ? (
        <div
          className="mx-auto max-w-md py-24 text-center text-slate-400"
          data-testid="matches-empty"
        >
          <div className="mb-4 text-5xl">💫</div>
          <p className="text-lg">아직 매칭된 상대가 없어요.</p>
          <p className="mt-2 text-sm">
            <Link href="/discover" className="text-rose-300 underline">
              추천 피드
            </Link>
            에서 마음에 드는 상대에게 좋아요를 눌러보세요.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2" data-testid="matches-list">
          {partners.map((p) => {
            const photo = p.photoUrls[0] ?? p.avatarUrl;
            return (
              <div
                key={p.userId}
                className="flex items-center gap-4 rounded-2xl border border-rose-700/30 bg-gradient-to-br from-slate-800/60 to-gray-900/60 p-4"
                data-testid="match-card"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-700">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl">🧑</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="truncate text-lg font-bold text-rose-100">{p.name}</h3>
                    <span className="shrink-0 text-sm text-rose-300">궁합 {p.score}</span>
                  </div>
                  {p.region && <p className="text-xs text-slate-400">{p.region}</p>}
                  {p.bio && <p className="mt-1 line-clamp-2 text-sm text-slate-300">{p.bio}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
