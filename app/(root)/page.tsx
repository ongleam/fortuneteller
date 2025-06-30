import { cookies, headers } from 'next/headers';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';

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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-600">
              <span className="text-sm font-bold text-black">점</span>
            </div>
            <h1 className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-2xl font-bold text-transparent">
              점순이
            </h1>
          </div>

          {user ? (
            <Link href="/chat">
              <Button className="rounded-full border border-slate-500 bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-2 text-white hover:from-slate-700 hover:to-slate-800">
                운세보기
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button className="rounded-full border border-slate-500 bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-2 text-white hover:from-slate-700 hover:to-slate-800">
                로그인
              </Button>
            </Link>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 text-center sm:px-6 lg:px-8">
        {/* Decorative Elements */}
        <div className="absolute left-10 top-10 h-20 w-20 opacity-20">
          <div className="h-full w-full animate-pulse rounded-full border-2 border-slate-400"></div>
        </div>
        <div className="absolute right-20 top-20 h-16 w-16 opacity-30">
          <div className="h-full w-full animate-bounce rounded-full bg-gradient-to-br from-slate-400 to-slate-600"></div>
        </div>
        <div className="absolute bottom-20 left-20 h-12 w-12 opacity-25">
          <div className="h-full w-full rotate-45 transform border border-slate-300"></div>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="mb-4 text-6xl sm:text-8xl">🔮</div>
            <h2 className="mb-6 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-500 bg-clip-text text-5xl font-bold text-transparent sm:text-7xl">
              점순이
            </h2>
            <p className="mb-4 text-xl text-slate-300 sm:text-2xl">
              당신의 운명을 알려드리는 신비로운 점술사
            </p>
            <p className="mb-8 text-lg text-gray-400">
              천년의 지혜로 오늘의 운세와 내일의 길을 제시합니다
            </p>
          </div>

          <div className="space-y-4 sm:flex sm:justify-center sm:space-x-4 sm:space-y-0">
            {user ? (
              <Link href="/chat">
                <Button className="w-full transform rounded-full bg-gradient-to-r from-slate-400 to-slate-600 px-8 py-4 text-lg font-bold text-black shadow-lg transition-all duration-200 hover:scale-105 hover:from-slate-500 hover:to-slate-700 sm:w-auto">
                  ✨ 지금 운세보기 ✨
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="w-full transform rounded-full bg-gradient-to-r from-slate-400 to-slate-600 px-8 py-4 text-lg font-bold text-black shadow-lg transition-all duration-200 hover:scale-105 hover:from-slate-500 hover:to-slate-700 sm:w-auto">
                  ✨ 무료로 시작하기 ✨
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-16 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-center text-4xl font-bold text-transparent">
            점순이만의 특별함
          </h3>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-gray-800/50 p-8 text-center backdrop-blur-sm">
              <div className="mb-4 text-5xl">🌙</div>
              <h4 className="mb-4 text-2xl font-bold text-slate-300">오늘의 운세</h4>
              <p className="text-slate-400">
                매일 새로운 운세를 통해 하루를 더욱 의미있게 시작하세요. 사랑, 직업, 건강,
                재물운까지 모든 것을 알려드립니다.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-slate-800/50 p-8 text-center backdrop-blur-sm">
              <div className="mb-4 text-5xl">⭐</div>
              <h4 className="mb-4 text-2xl font-bold text-slate-300">맞춤형 조언</h4>
              <p className="text-gray-400">
                당신의 생년월일과 관심사를 바탕으로 개인화된 운세와 조언을 제공합니다. 더 정확하고
                의미있는 메시지를 받아보세요.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-gray-800/50 p-8 text-center backdrop-blur-sm">
              <div className="mb-4 text-5xl">🎋</div>
              <h4 className="mb-4 text-2xl font-bold text-slate-300">전통 점술</h4>
              <p className="text-slate-400">
                동양의 전통 점술 방식을 AI와 결합하여 현대적이면서도 깊이있는 해석을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fortune Categories */}
      <section className="relative bg-gradient-to-r from-slate-900/80 to-gray-900/80 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h3 className="mb-16 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-center text-4xl font-bold text-transparent">
            다양한 운세 분야
          </h3>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '💕', title: '사랑운', desc: '연인과의 관계, 새로운 만남' },
              { icon: '💰', title: '재물운', desc: '금전운, 투자, 사업운' },
              { icon: '🏢', title: '직업운', desc: '승진, 이직, 새로운 기회' },
              { icon: '🌿', title: '건강운', desc: '몸과 마음의 건강' },
              { icon: '👨‍👩‍👧‍👦', title: '가족운', desc: '가족관계, 화목' },
              { icon: '🎓', title: '학업운', desc: '시험, 학습, 성장' },
              { icon: '🌈', title: '종합운', desc: '전반적인 운세' },
              { icon: '🔯', title: '특별운', desc: '특별한 날의 운세' },
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-600/30 bg-gradient-to-br from-black/40 to-slate-800/40 p-6 text-center transition-all duration-200 hover:scale-105 hover:transform hover:border-slate-400/40"
              >
                <div className="mb-3 text-3xl">{item.icon}</div>
                <h4 className="mb-2 text-lg font-bold text-slate-300">{item.title}</h4>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h3 className="mb-6 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
            지금 바로 운세를 확인해보세요
          </h3>
          <p className="mb-8 text-xl text-gray-400">점순이와 함께 더 나은 내일을 준비하세요</p>

          <div className="space-y-4 sm:flex sm:justify-center sm:space-x-4 sm:space-y-0">
            {user ? (
              <Link href="/chat">
                <Button className="w-full transform rounded-full bg-gradient-to-r from-slate-400 to-slate-600 px-10 py-4 text-xl font-bold text-black shadow-lg transition-all duration-200 hover:scale-105 hover:from-slate-500 hover:to-slate-700 sm:w-auto">
                  🔮 운세 보러가기
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="w-full transform rounded-full bg-gradient-to-r from-slate-400 to-slate-600 px-10 py-4 text-xl font-bold text-black shadow-lg transition-all duration-200 hover:scale-105 hover:from-slate-500 hover:to-slate-700 sm:w-auto">
                  🔮 무료로 시작하기
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-700/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-4 flex items-center justify-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-600">
              <span className="text-xs font-bold text-black">점</span>
            </div>
            <h1 className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-xl font-bold text-transparent">
              점순이
            </h1>
          </div>
          <p className="mb-4 text-slate-400">신비로운 운세의 세계로 여러분을 안내합니다</p>
          <p className="text-sm text-gray-500">© 2024 점순이. 모든 권리 보유.</p>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-slate-500 via-slate-400 to-slate-600 opacity-50"></div>
      </footer>
    </div>
  );
}
