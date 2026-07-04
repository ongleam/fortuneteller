import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerClient } from "@fortuneteller/clients/supabase/server";
import { siteConfig } from "@fortuneteller/config/site";
import { KakaoLoginButton } from "@/components/auth/kakao-login-button";
import { brandColors, brandFont } from "@/components/brand/theme";
import {
  BrandMark,
  BrushRule,
  OhaengRow,
  ParchmentShell,
  Seal,
  SectionTitle,
} from "@/components/brand/elements";

const { ink: INK, seal: SEAL, gold: GOLD, sub: SUB } = brandColors;

const POINTS = [
  { han: "宮合", title: "궁합으로 추천", desc: "나와 잘 맞는 사람부터 보여드려요." },
  { han: "因緣", title: "서로 좋아요", desc: "둘 다 좋아하면 인연이 돼요." },
  { han: "命式", title: "간단한 시작", desc: "생년월일만 있으면 충분해요." },
] as const;

const STEPS = [
  { no: "一", label: "하나", desc: "생년월일을 적어요" },
  { no: "二", label: "둘", desc: "궁합순으로 상대를 봐요" },
  { no: "三", label: "셋", desc: "서로 좋아하면 이어져요" },
] as const;

export default async function LandingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ParchmentShell>
      {/* 머리말 */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <BrandMark size={34} />
        {user ? (
          <Link href="/discover">
            <Button
              className="rounded-none border px-5 py-2 text-base"
              style={{ backgroundColor: INK, color: "#f3ead4", borderColor: INK }}
            >
              상대 찾기
            </Button>
          </Link>
        ) : (
          <KakaoLoginButton variant="landing" className="px-5 py-2 text-sm">
            로그인
          </KakaoLoginButton>
        )}
      </header>

      <div className="mx-auto h-px max-w-5xl" style={{ backgroundColor: brandColors.line }} />

      {/* 첫 화면 */}
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center">
        <div className="mb-6 flex justify-center">
          <Seal char="緣" size={64} />
        </div>
        <p className="mb-3 tracking-[0.4em]" style={{ color: SUB, fontSize: 15 }}>
          四柱 · 因緣
        </p>
        <h1
          className="mb-2"
          style={{ fontFamily: brandFont.brush, fontSize: 76, lineHeight: 1.05, color: INK }}
        >
          사주로 인연을 잇다
        </h1>
        <div className="mx-auto mb-8 h-3 w-56">
          <BrushRule color={SEAL} className="h-full w-full" />
        </div>
        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed" style={{ color: SUB }}>
          생년월일로 궁합을 보고, 잘 맞는 사람을 먼저 만나요.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {user ? (
            <>
              <Link href="/discover">
                <Button
                  className="rounded-none px-8 py-6 text-lg"
                  style={{ backgroundColor: SEAL, color: "#f7ecd6" }}
                >
                  상대 찾으러 가기
                </Button>
              </Link>
              <Link href="/profile/edit">
                <Button
                  variant="outline"
                  className="rounded-none border-2 bg-transparent px-8 py-6 text-lg"
                  style={{ borderColor: INK, color: INK }}
                >
                  프로필 적기
                </Button>
              </Link>
            </>
          ) : (
            <KakaoLoginButton variant="landing" className="px-8 py-4 text-lg">
              카카오로 시작하기
            </KakaoLoginButton>
          )}
        </div>
      </section>

      {/* 오행 장식 띠 */}
      <div className="mb-4 px-6">
        <OhaengRow />
      </div>

      {/* 핵심 세 가지 */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <SectionTitle className="mb-10">점순이의 세 가지 약속</SectionTitle>
        <div className="grid gap-6 md:grid-cols-3">
          {POINTS.map((p) => (
            <div
              key={p.han}
              className="bg-[#f4ecd8] p-7 text-center"
              style={{
                border: `1px solid ${brandColors.line}`,
                boxShadow: "3px 3px 0 rgba(60,40,20,0.12)",
              }}
            >
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-xl font-bold"
                style={{ border: `2px solid ${GOLD}`, color: SEAL }}
              >
                {p.han}
              </div>
              <h3 className="mb-2 text-xl font-bold" style={{ color: INK }}>
                {p.title}
              </h3>
              <p className="leading-relaxed" style={{ color: SUB }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 진행 순서 */}
      <section className="px-6 py-14" style={{ backgroundColor: "rgba(60,40,20,0.06)" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold" style={{ color: INK }}>
            이렇게 이어집니다
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.no} className="text-center">
                <div
                  className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold"
                  style={{ border: `2px solid ${INK}`, color: INK }}
                >
                  {s.no}
                </div>
                <p className="mb-1 text-sm" style={{ color: SEAL }}>
                  {s.label}
                </p>
                <p className="text-lg" style={{ color: INK }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 마무리 CTA */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2
          className="mb-3"
          style={{ fontFamily: brandFont.brush, fontSize: 52, lineHeight: 1.1, color: INK }}
        >
          오늘, 좋은 인연을 만나요
        </h2>
        <p className="mb-10 text-lg" style={{ color: SUB }}>
          점순이가 사주로 두 사람을 이어드립니다.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {user ? (
            <Link href="/discover">
              <Button
                className="rounded-none px-10 py-6 text-lg"
                style={{ backgroundColor: SEAL, color: "#f7ecd6" }}
              >
                상대 찾으러 가기
              </Button>
            </Link>
          ) : (
            <KakaoLoginButton variant="landing" className="px-10 py-4 text-lg">
              카카오로 시작하기
            </KakaoLoginButton>
          )}
        </div>
      </section>

      {/* 꼬리말 */}
      <footer
        className="px-6 py-12"
        style={{ borderTop: `1px solid ${brandColors.line}`, color: SUB }}
      >
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex items-center justify-center">
            <BrandMark size={26} />
          </div>
          <div className="mb-6 space-y-1 text-sm">
            <p>상호명: 주식회사 온글림</p>
            <p>대표자: 허빈</p>
            <p>사업자등록번호: 325-81-03598</p>
            <p>통신판매업신고번호: 제 2025-서울서대문-0486 호</p>
            <p>주소: 서울특별시 동작구 상도로55길 6 (상도동) 테크 스테이션</p>
            <p>문의: contact@ongleam.com</p>
          </div>
          <div className="mb-3 flex justify-center gap-6 text-sm">
            <Link
              href={siteConfig.privacyPolicy.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: SUB }}
            >
              개인정보처리방침
            </Link>
            <Link
              href={siteConfig.termsOfService.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: SUB }}
            >
              이용약관
            </Link>
          </div>
          <p className="text-sm" style={{ color: SUB }}>
            © 2025 Ongleam Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </ParchmentShell>
  );
}
