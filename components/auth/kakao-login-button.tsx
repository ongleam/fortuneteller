'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { SignInWithOAuthCredentials } from '@supabase/supabase-js';
import { useCallback } from 'react';

interface KakaoLoginButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'landing';
}

export function KakaoLoginButton({
  className,
  children,
  variant = 'default',
}: KakaoLoginButtonProps) {
  const supabase = createClient();

  // authOptions를 useCallback 내에서 생성하여 window 객체 접근 문제 해결
  const getAuthOptions = useCallback((): SignInWithOAuthCredentials => {
    return {
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/api/auth/kakao`,
        scopes:
          // 'profile_nickname profile_image account_email name gender birthyear phone_number openid',
          'profile_nickname',
      },
    };
  }, []);

  // 새 계정 연결 시도
  const handleKakaoLogin = useCallback(async () => {
    try {
      const authOptions = getAuthOptions();
      const { error } = await supabase.auth.linkIdentity(authOptions);

      if (error) {
        // identity_already_exists 에러가 발생한 경우 signInWithOAuth 사용
        if (error.message.includes('identity_already_exists')) {
          handleSignInWithKakao();
        } else if (error.message.includes('provider is not enabled')) {
          console.error(
            '카카오 로그인 설정 오류: Supabase에서 카카오 프로바이더가 활성화되지 않았습니다.'
          );
          alert('카카오 로그인이 현재 이용할 수 없습니다. 관리자에게 문의해주세요.');
        } else {
          console.error('카카오 로그인 오류:', error);
          alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
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
      const { error } = await supabase.auth.signInWithOAuth(authOptions);

      if (error) {
        if (error.message.includes('provider is not enabled')) {
          console.error(
            '카카오 로그인 설정 오류: Supabase에서 카카오 프로바이더가 활성화되지 않았습니다.'
          );
          alert('카카오 로그인이 현재 이용할 수 없습니다. 관리자에게 문의해주세요.');
        } else {
          console.error('카카오 로그인 오류:', error);
          alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      }
    } catch (err) {
      console.error('카카오 로그인 오류:', err);
    }
  }, [supabase, getAuthOptions]);

  if (variant === 'landing') {
    return (
      <Button
        onClick={handleKakaoLogin}
        className={`transform rounded-full bg-[#FEE500] px-8 py-4 text-lg font-bold text-[#3C1E1E] shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#FFEB3B] ${className}`}
      >
        <div className="flex items-center justify-center">
          <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C5.9 3 1 6.9 1 11.7c0 3.3 2.2 6.3 5.6 7.8-.2.9-.9 3.3-1 3.8-.2.5.2.5.4.4.2-.1 2.6-1.8 3.7-2.5 1 .2 2.1.3 3.3.3 6.1 0 11-3.9 11-8.7 0-4.8-4.9-8.8-11-8.8z" />
          </svg>
          {children || '카카오로 시작하기'}
        </div>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleKakaoLogin}
      className={`w-full rounded-xl border-none bg-[#FEE500] py-6 text-lg font-semibold text-[#3C1E1E] shadow-md transition-all hover:bg-[#FFEB3B] hover:shadow-lg ${className}`}
    >
      <div className="flex items-center justify-center">
        <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C5.9 3 1 6.9 1 11.7c0 3.3 2.2 6.3 5.6 7.8-.2.9-.9 3.3-1 3.8-.2.5.2.5.4.4.2-.1 2.6-1.8 3.7-2.5 1 .2 2.1.3 3.3.3 6.1 0 11-3.9 11-8.7 0-4.8-4.9-8.8-11-8.8z" />
        </svg>
        {children || '카카오 로그인'}
      </div>
    </Button>
  );
}
