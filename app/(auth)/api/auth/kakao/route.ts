import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getKakaoUserInfo } from '@/lib/actions/kakao';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  const error_code = searchParams.get('error_code');
  const next = searchParams.get('next') ?? '/'; // 로그인 후 리디렉션 될 경로

  // console.log('[INFO LOGIN] code: ', request);

  // 에러가 있는 경우 에러 정보를 포함하여 리디렉션
  if (error) {
    // identity_already_exists 에러 확인
    const isIdentityExists =
      error_code === 'identity_already_exists' ||
      (error_description && error_description.includes('identity_already_exists'));

    if (isIdentityExists) {
      return NextResponse.redirect(`${origin}/login?error_code=${error_code}`);
    }

    // 그 외 에러
    return NextResponse.redirect(`${origin}/login?error_code=${error_code || 'unknown_error'}`);
  }

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.provider_token && session) {
        const userInfo = await getKakaoUserInfo(session?.provider_token ?? '');
        // console.log('[INFO LOGIN] userInfo: ', userInfo);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        // console.log('[INFO LOGIN] user: ', user);

        if (user) {
          const updateData: { [key: string]: any } = {
            phone_number: userInfo.kakao_account.phone_number,
            gender: userInfo.kakao_account.gender,
            birthyear: userInfo.kakao_account.birthyear,
            name: userInfo.kakao_account.name,
          };

          const { error: updateError } = await supabase.auth.updateUser({
            data: updateData,
          });

          if (updateError) {
            console.error('[ERROR] Failed to update user metadata:', updateError);
          } else {
            console.log('[INFO] Updated user metadata with Kakao information');
          }
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      // 세션 교환 과정에서 에러 발생 시 에러 코드로 리디렉션
      let errorCode = 'session_exchange_error';

      // 특정 에러 유형 식별
      if (error.message?.includes('identity_already_exists')) {
        errorCode = 'identity_already_exists';
      }

      return NextResponse.redirect(`${origin}/login?error_code=${errorCode}`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
