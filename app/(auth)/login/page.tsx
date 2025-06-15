'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignInWithOAuthCredentials } from '@supabase/supabase-js';
import { useEffect, useCallback, Suspense } from 'react';
import { getKakaoUserInfo } from '@/lib/actions/kakao';

function LoginContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  // authOptions를 useCallback 내에서 생성하여 window 객체 접근 문제 해결
  const getAuthOptions = useCallback((): SignInWithOAuthCredentials => {
    return {
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/api/auth/kakao`,
        scopes:
          'profile_nickname profile_image account_email name gender birthyear phone_number openid',
      },
    };
  }, []);

  // 새 계정 연결 시도
  const handleKakaoLogin = useCallback(async () => {
    try {
      const authOptions = getAuthOptions();
      const { data, error } = await supabase.auth.linkIdentity(authOptions);
      // console.log('[INFO LOGIN] data of linkIdentity: ', data);
      if (error) {
        // identity_already_exists 에러가 발생한 경우 signInWithOAuth 사용
        if (error.message.includes('identity_already_exists')) {
          handleSignInWithKakao();
        } else {
          console.error('카카오 로그인 오류:', error);
        }
      }
    } catch (err) {
      console.error('카카오 로그인 오류:', err);
    }
  }, [supabase, getAuthOptions]);

  // 기존 계정으로 로그인
  const handleSignInWithKakao = useCallback(async () => {
    try {
      const authOptions = getAuthOptions();
      const { data, error } = await supabase.auth.signInWithOAuth(authOptions);
      // console.log('[INFO LOGIN] data of signInWithOAuth: ', data);

      if (error) {
        console.error('카카오 로그인 오류:', error);
      }
    } catch (err) {
      console.error('카카오 로그인 오류:', err);
    }
  }, [supabase, getAuthOptions]);

  // URL에서 error_code 파라미터 처리
  useEffect(() => {
    const errorCode = searchParams.get('error_code');

    if (errorCode === 'identity_already_exists') {
      // console.error('인증 오류: 이미 등록된 계정입니다');
      handleSignInWithKakao();
    }
  }, [searchParams, handleSignInWithKakao]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFEB3B]/10">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-10 shadow-lg">
        {/* 카카오 로고와 텍스트 */}
        <div className="flex flex-col items-center">
          <h1 className="mb-3 mt-1 text-2xl font-bold text-[#3C1E1E]">카카오계정으로 로그인</h1>
          <p className="mb-6 text-sm text-gray-500">반가워요! 카카오계정으로 로그인해주세요.</p>
        </div>
        <Button
          onClick={handleKakaoLogin}
          className="w-full rounded-xl border-none bg-[#FEE500] py-6 text-lg font-semibold text-[#3C1E1E] shadow-md transition-all hover:bg-[#FFEB3B] hover:shadow-lg"
        >
          <div className="flex items-center justify-center">
            <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C5.9 3 1 6.9 1 11.7c0 3.3 2.2 6.3 5.6 7.8-.2.9-.9 3.3-1 3.8-.2.5.2.5.4.4.2-.1 2.6-1.8 3.7-2.5 1 .2 2.1.3 3.3.3 6.1 0 11-3.9 11-8.7 0-4.8-4.9-8.8-11-8.8z" />
            </svg>
            카카오 로그인
          </div>
        </Button>
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트 - Suspense로 감싸기
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FFEB3B]/10">
          <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-10 shadow-lg">
            <div className="flex flex-col items-center">
              <h1 className="mb-3 mt-1 text-2xl font-bold text-[#3C1E1E]">로딩 중...</h1>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
