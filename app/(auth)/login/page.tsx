"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { KakaoLoginButton } from "@/components/auth/kakao-login-button";

function LoginContent() {
  const searchParams = useSearchParams();

  // URL에서 error_code 파라미터 처리
  useEffect(() => {
    const errorCode = searchParams.get("error_code");

    if (errorCode === "identity_already_exists") {
      console.log("이미 등록된 계정입니다. 기존 계정으로 로그인을 시도합니다.");
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFEB3B]/10">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-100 bg-white p-10 shadow-lg">
        {/* 카카오 로고와 텍스트 */}
        <div className="flex flex-col items-center">
          <h1 className="mb-3 mt-1 text-2xl font-bold text-[#3C1E1E]">카카오계정으로 로그인</h1>
          <p className="mb-6 text-sm text-gray-500">반가워요! 카카오계정으로 로그인해주세요.</p>
        </div>
        <KakaoLoginButton />
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
