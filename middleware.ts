import { NextResponse, type NextRequest, userAgent } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // CookieOptions 추가

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({
    request,
  });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /** Start middleware Definitions **/

  // console.log(
  //   '[Middleware] User from Supabase Auth:',
  //   user ? { id: user.id, is_anonymous: user.is_anonymous, pathname } : null
  // );

  // 봇 요청은 바로 통과 (Supabase 세션 처리가 필요 없을 수 있음)
  const { isBot } = userAgent(request);
  if (isBot) {
    console.log('[Middleware] Bot detected, passing through.');
    return NextResponse.next();
  }

  // API 라우트 및 정적 파일 등은 미들웨어 로직에서 제외
  if (
    pathname.startsWith('/api/inngest') ||
    pathname.startsWith('/api/kakao') ||
    pathname.startsWith('/api/test-chat') ||
    pathname.startsWith('/api/queries/embedding') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') // 정적 파일 (이미지, CSS 등)
  ) {
    return supabaseResponse;
  }

  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  // 사용자가 없는 경우 (인증된 세션 또는 기존 익명 세션 없음)
  if (!user) {
    // 로그인, 회원가입, 카카오 OAuth 콜백 경로는 익명 세션 생성 로직을 건너뜁니다.
    // 카카오 콜백은 인증 코드를 교환해야 하므로 세션이 없어도 접근 가능해야 합니다.
    if (
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/api/auth/kakao') // 카카오 콜백 경로 추가
    ) {
      console.log(`[Middleware] Allowing access to auth path ${pathname} without user session.`);
      return supabaseResponse;
    }

    console.log(
      '[Middleware] No active user session. Attempting anonymous sign-in for path:',
      pathname
    );
    const {
      data: { session: anonSession },
      error: anonymousError,
    } = await supabase.auth.signInAnonymously();

    if (anonymousError) {
      console.error('[Middleware] Error during anonymous sign-in:', anonymousError.message);
      if (anonymousError.message.includes('rate limit')) {
        // 쿠키를 설정하여 일정 시간 동안 익명 로그인 시도를 건너뛰기
        const cooldownCookie = 'auth_cooldown=true; max-age=30; path=/';
        supabaseResponse.headers.append('Set-Cookie', cooldownCookie);

        // 그냥 현재 페이지 표시 (리다이렉션 없음)
        return supabaseResponse;
      }

      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'anonymous_signin_failed');
      url.searchParams.set('error_description', anonymousError.message);
      return NextResponse.redirect(url);
    }

    if (anonSession) {
      console.log('[Middleware] Anonymous session created:', anonSession.user.id);
      // 익명 세션 생성 후, 업데이트된 쿠키를 포함한 응답을 반환해야 합니다.
      // supabaseResponse는 signInAnonymously 호출 시 setAll을 통해 쿠키가 설정되었어야 합니다.
      // 확실하게 하기 위해, 여기서 요청을 다시 전달하여 미들웨어를 재실행하도록 할 수 있습니다.
      // 또는, 변경된 쿠키가 적용된 supabaseResponse를 반환합니다.
      // 중요: signInAnonymously는 내부적으로 쿠키를 설정하려고 시도하며, 이는 setAll 콜백을 트리거합니다.
      // 따라서 별도의 NextResponse.redirect 없이 supabaseResponse를 반환하면 됩니다.
      return supabaseResponse;
    } else {
      console.error('[Middleware] Failed to create anonymous session despite no error.');
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'anonymous_session_failed');
      return NextResponse.redirect(url);
    }
  }

  // 사용자가 있고 (익명 또는 영구 사용자)
  // 해당 사용자가 "영구 사용자" 이면서 "/login" 또는 "/register" 경로에 접근하려 할 때
  if (
    user &&
    !user.is_anonymous &&
    (pathname.startsWith('/login') || pathname.startsWith('/register'))
  ) {
    console.log(
      `[Middleware] Authenticated (non-anonymous) user (ID: ${user.id}) attempting to access ${pathname}. Redirecting to /.`
    );
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // 카카오 인증 콜백은 이미 위에서 처리되었거나, 세션이 있는 상태로 여기 도달하면 그대로 통과
  if (pathname.startsWith('/api/auth/kakao')) {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
