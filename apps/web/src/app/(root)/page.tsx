import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createServerClient } from "@fortuneteller/clients/supabase/server";
import { siteConfig } from "@fortuneteller/config/site";
import { KakaoLoginButton } from "@/components/auth/kakao-login-button";

const SELLING_POINTS = [
  {
    icon: "💞",
    title: "사주 궁합 추천",
    desc: "오행 상생·상극과 지지 합충, 일간 궁합을 규칙으로 계산한 0–100 궁합 점수로, 나와 잘 맞는 상대를 궁합 순서대로 추천합니다.",
  },
  {
    icon: "🤝",
    title: "더블 옵트인 매칭",
    desc: "서로 좋아요를 누른 두 사람만 매칭됩니다. 일방적인 관심 노출 없이, 양쪽 마음이 맞았을 때만 연결돼요.",
  },
  {
    icon: "🗂️",
    title: "간편한 프로필",
    desc: "생년월일과 소개, 지역·선호만 등록하면 끝. 사주는 점순이가 알아서 풀어 궁합에 반영합니다.",
  },
] as const;

const HOW_IT_WORKS = [
  { step: "1", title: "프로필 등록", desc: "생년월일·소개·선호 입력" },
  { step: "2", title: "궁합 추천", desc: "궁합 점수 높은 순으로 노출" },
  { step: "3", title: "좋아요", desc: "마음에 드는 상대에게 좋아요" },
  { step: "4", title: "매칭 성립", desc: "서로 좋아요하면 매칭" },
] as const;

export default async function LandingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-rose-600">
              <span className="text-sm font-bold text-black">점</span>
            </div>
            <h1 className="bg-gradient-to-r from-rose-200 to-rose-400 bg-clip-text text-2xl font-bold text-transparent">
              점순이
            </h1>
          </div>

          {user ? (
            <Link href="/discover">
              <Button className="rounded-full border border-rose-500 bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-2 text-white hover:from-rose-700 hover:to-rose-800">
                상대 찾기
              </Button>
            </Link>
          ) : (
            <KakaoLoginButton variant="landing" className="px-6 py-2 text-sm">
              로그인
            </KakaoLoginButton>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="absolute left-10 top-10 h-20 w-20 opacity-20">
          <div className="h-full w-full animate-pulse rounded-full border-2 border-rose-400"></div>
        </div>
        <div className="absolute right-20 top-20 h-16 w-16 opacity-30">
          <div className="h-full w-full animate-bounce rounded-full bg-gradient-to-br from-rose-400 to-pink-600"></div>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="mb-4 text-6xl sm:text-8xl">💘</div>
            <h2 className="mb-6 bg-gradient-to-r from-rose-200 via-pink-300 to-rose-500 bg-clip-text text-5xl font-bold text-transparent sm:text-7xl">
              사주로 만나는 인연
            </h2>
            <p className="mb-4 text-xl text-slate-200 sm:text-2xl">
              나와 궁합이 잘 맞는 사람부터 먼저 만나보세요
            </p>
            <p className="mb-8 text-lg text-gray-400">
              점순이가 사주팔자 궁합을 계산해 인연을 이어드립니다
            </p>
          </div>

          <div className="space-y-4 sm:flex sm:justify-center sm:space-x-4 sm:space-y-0">
            {user ? (
              <Link href="/discover">
                <Button className="w-full transform rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-10 py-4 text-xl font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-rose-600 hover:to-pink-700 sm:w-auto">
                  💘 궁합 상대 만나러 가기
                </Button>
              </Link>
            ) : (
              <KakaoLoginButton variant="landing" className="w-full sm:w-auto">
                💘 카카오로 무료 시작하기 💘
              </KakaoLoginButton>
            )}
          </div>
        </div>
      </section>

      {/* Selling Points */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-16 bg-gradient-to-r from-rose-200 to-rose-400 bg-clip-text text-center text-4xl font-bold text-transparent">
            점순이 소개팅의 특별함
          </h3>

          <div className="grid gap-8 md:grid-cols-3">
            {SELLING_POINTS.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-rose-700/40 bg-gradient-to-br from-slate-800/50 to-gray-800/50 p-8 text-center backdrop-blur-sm"
              >
                <div className="mb-4 text-5xl">{point.icon}</div>
                <h4 className="mb-4 text-2xl font-bold text-rose-200">{point.title}</h4>
                <p className="text-slate-300">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative bg-gradient-to-r from-slate-900/80 to-gray-900/80 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h3 className="mb-16 bg-gradient-to-r from-rose-200 to-rose-400 bg-clip-text text-center text-4xl font-bold text-transparent">
            이렇게 진행돼요
          </h3>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-rose-600/30 bg-gradient-to-br from-black/40 to-slate-800/40 p-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-600 text-lg font-bold text-black">
                  {item.step}
                </div>
                <h4 className="mb-2 text-lg font-bold text-rose-200">{item.title}</h4>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h3 className="mb-6 bg-gradient-to-r from-rose-200 to-rose-400 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
            지금 바로 인연을 찾아보세요
          </h3>
          <p className="mb-8 text-xl text-gray-400">점순이와 함께 사주로 맞는 사람을 만나보세요</p>

          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
            {user ? (
              <>
                <Link href="/discover">
                  <Button className="w-full transform rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-10 py-4 text-xl font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-rose-600 hover:to-pink-700 sm:w-auto">
                    💘 상대 찾으러 가기
                  </Button>
                </Link>
                <Link href="/profile/edit">
                  <Button className="w-full transform rounded-full bg-gradient-to-r from-slate-500 to-slate-700 px-10 py-4 text-xl font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-slate-600 hover:to-slate-800 sm:w-auto">
                    🗂️ 프로필 등록하기
                  </Button>
                </Link>
              </>
            ) : (
              <KakaoLoginButton variant="landing" className="w-full px-10 py-4 text-xl sm:w-auto">
                💘 카카오로 무료 시작하기
              </KakaoLoginButton>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-700/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-rose-600">
                <span className="text-xs font-bold text-black">점</span>
              </div>
              <h1 className="bg-gradient-to-r from-rose-200 to-rose-400 bg-clip-text text-xl font-bold text-transparent">
                점순이
              </h1>
            </div>
            <p className="mb-6 text-slate-400">사주 궁합으로 인연을 이어드립니다</p>
          </div>

          <div className="mb-6 space-y-2 text-center text-sm text-slate-500">
            <p>상호명: 주식회사 온글림</p>
            <p>대표자: 허빈</p>
            <p>사업자등록번호: 325-81-03598</p>
            <p>통신판매업신고번호: 제 2025-서울서대문-0486 호</p>
            <p>주소: 서울 서대문구 이화여대길 52, 이화 스타트업 오픈 스페이스 1층</p>
            <p>문의: contact@ongleam.site</p>
          </div>

          <div className="text-center">
            <div className="mb-4 flex justify-center space-x-6 text-sm">
              <Link
                href={siteConfig.privacyPolicy.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 underline hover:text-slate-300"
              >
                개인정보처리방침
              </Link>
              <Link
                href={siteConfig.termsOfService.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 underline hover:text-slate-300"
              >
                이용약관
              </Link>
            </div>
            <p className="text-sm text-gray-500">© 2025 Ongleam Inc. All rights reserved.</p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-rose-500 via-pink-400 to-rose-600 opacity-50"></div>
      </footer>
    </div>
  );
}
