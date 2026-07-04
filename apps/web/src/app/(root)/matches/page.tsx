import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@fortuneteller/clients/supabase/server";
import { getMatchedPartners } from "@fortuneteller/modules/matching/infra/queries";
import { Button } from "@/components/ui/button";
import { brandColors } from "@/components/brand/theme";
import { BrandMark, BrushRule, ParchmentShell, Seal } from "@/components/brand/elements";

const { ink: INK, seal: SEAL, sub: SUB } = brandColors;

export default async function MatchesPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const partners = await getMatchedPartners({ userId: user.id });

  return (
    <ParchmentShell>
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
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
      <div className="mx-auto h-px max-w-4xl" style={{ backgroundColor: brandColors.line }} />

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Seal char="緣" size={40} />
          <div>
            <p className="text-sm tracking-[0.3em]" style={{ color: SUB }}>
              因緣
            </p>
            <h1 className="text-3xl font-extrabold" style={{ color: INK }}>
              매칭 목록
            </h1>
          </div>
        </div>
        <div className="mb-8 h-3 w-40">
          <BrushRule color={INK} className="h-full w-full" />
        </div>

        {partners.length === 0 ? (
          <div className="py-24 text-center" data-testid="matches-empty" style={{ color: SUB }}>
            <div className="mb-4 text-5xl">💫</div>
            <p className="text-lg">아직 이어진 상대가 없어요.</p>
            <p className="mt-2 text-sm">
              <Link href="/discover" className="font-bold underline" style={{ color: SEAL }}>
                궁합 추천
              </Link>
              에서 마음에 드는 상대에게 좋아요를 눌러 보세요.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2" data-testid="matches-list">
            {partners.map((p) => {
              const photo = p.photoUrls[0] ?? p.avatarUrl;
              return (
                <div
                  key={p.userId}
                  className="flex items-center gap-4 bg-[#f4ecd8] p-4"
                  data-testid="match-card"
                  style={{
                    border: `1px solid ${brandColors.line}`,
                    boxShadow: "3px 3px 0 rgba(60,40,20,0.12)",
                  }}
                >
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full"
                    style={{ backgroundColor: "#e5d8ba" }}
                  >
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl">🧑</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <h3 className="truncate text-lg font-bold" style={{ color: INK }}>
                        {p.name}
                      </h3>
                      <span className="shrink-0 text-sm font-bold" style={{ color: SEAL }}>
                        궁합 {p.score}
                      </span>
                    </div>
                    {p.region && (
                      <p className="text-xs" style={{ color: SUB }}>
                        {p.region}
                      </p>
                    )}
                    {p.bio && (
                      <p className="mt-1 line-clamp-2 text-sm" style={{ color: INK }}>
                        {p.bio}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </ParchmentShell>
  );
}
