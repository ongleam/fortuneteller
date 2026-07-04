import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@fortuneteller/clients/supabase/server";
import { getRecommendations } from "@fortuneteller/modules/matching/infra/queries";
import { getProfileByUserId } from "@fortuneteller/modules/profile/infra/queries";
import { DiscoverFeed } from "@/components/matching/discover-feed";
import { Button } from "@/components/ui/button";
import { brandColors } from "@/components/brand/theme";
import { BrandMark, BrushRule, ParchmentShell, Seal } from "@/components/brand/elements";

const { ink: INK, seal: SEAL, sub: SUB } = brandColors;

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
    <ParchmentShell>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/">
          <BrandMark size={28} />
        </Link>
        <div className="flex gap-2">
          <Link href="/matches">
            <Button
              variant="outline"
              className="rounded-none border-2 bg-transparent"
              style={{ borderColor: INK, color: INK }}
            >
              매칭 목록
            </Button>
          </Link>
          <Link href="/profile/edit">
            <Button
              variant="outline"
              className="rounded-none border-2 bg-transparent"
              style={{ borderColor: INK, color: INK }}
            >
              프로필
            </Button>
          </Link>
        </div>
      </header>
      <div className="mx-auto h-px max-w-5xl" style={{ backgroundColor: brandColors.line }} />

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Seal char="緣" size={40} />
          <div>
            <p className="text-sm tracking-[0.3em]" style={{ color: SUB }}>
              宮合
            </p>
            <h1 className="text-3xl font-extrabold" style={{ color: INK }}>
              궁합 추천
            </h1>
          </div>
        </div>
        <div className="mb-8 h-3 w-40">
          <BrushRule color={INK} className="h-full w-full" />
        </div>

        {needsProfile && (
          <div
            className="mb-8 px-5 py-4"
            style={{
              border: `1px solid ${SEAL}`,
              backgroundColor: "rgba(156,43,31,0.06)",
              color: INK,
            }}
          >
            프로필을 완성하고 공개로 바꾸면, 다른 분의 추천에도 나와요.{" "}
            <Link href="/profile/edit" className="font-bold underline" style={{ color: SEAL }}>
              프로필 적기
            </Link>
          </div>
        )}

        <DiscoverFeed candidates={candidates} />
      </section>
    </ParchmentShell>
  );
}
