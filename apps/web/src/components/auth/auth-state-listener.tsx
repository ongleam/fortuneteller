// components/auth/auth-state-listener.tsx
"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@fortuneteller/clients/supabase/client";
import { upsertProfileFromSupabaseUser } from "@/actions/profile";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getKakaoUserInfo } from "@/actions/kakao";

// 프로필 업데이트가 필요한 이벤트 정의 - 우선순위가 높은 이벤트 추가
const PROFILE_UPDATE_EVENTS: AuthChangeEvent[] = [
  "SIGNED_IN",
  "USER_UPDATED",
  "TOKEN_REFRESHED", // 토큰 갱신 시에도 프로필 확인
];

export function AuthStateListener() {
  const supabase = createClient();
  const router = useRouter();
  const lastProfileUpdateRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const profileInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 현재 사용자 세션 확인하고 프로필 초기화
    const initializeProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // console.log('[AuthStateListener] Session: ', session);

        // const userInfo = await getKakaoUserProfile(session?.provider_token);
        // console.log('[AuthStateListener] userInfo: ', userInfo);

        if (session?.user && !profileInitializedRef.current) {
          // 즉시 프로필 생성/업데이트 (디바운싱 없이)
          const result = await upsertProfileFromSupabaseUser(session.user);
          if (result.success) {
            profileInitializedRef.current = true;
            lastProfileUpdateRef.current = `${session.user.id}-${session.user.updated_at || ""}`;
            // console.log('[AuthStateListener] Profile initialized on mount');
          } else if (!result.skipped) {
            console.error("[AuthStateListener] Failed to initialize profile:", result.error);
          }
        }
      } catch (error) {
        console.error("[AuthStateListener] Error initializing profile:", error);
      }
    };

    initializeProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      const user = session?.user;
      // console.log(
      //   '[AuthStateListener] Event:',
      //   event,
      //   'User:',
      //   user ? { id: user.id, email: user.email, is_anonymous: user.is_anonymous } : null
      // );

      if (user) {
        // 중요: SIGNED_IN 이벤트는 항상 즉시 처리 (디바운싱 없이)
        // console.log('[AuthStateListener] Event:', event);
        if (event === "SIGNED_IN") {
          const result = await upsertProfileFromSupabaseUser(user);
          if (result.success || result.skipped) {
            profileInitializedRef.current = true;
            lastProfileUpdateRef.current = `${user.id}-${user.updated_at || ""}`;
            // console.log('[AuthStateListener] Profile created/updated on SIGNED_IN');
          } else {
            console.error(
              "[AuthStateListener] Failed to create profile on SIGNED_IN:",
              result.error,
            );
          }

          // 로그인 후 리디렉션
          if (!user.is_anonymous && window.location.pathname === "/login") {
            router.replace("/");
          }
        }
        // 다른 업데이트 이벤트는 디바운싱 적용
        else if (PROFILE_UPDATE_EVENTS.includes(event)) {
          // 이전 타이머가 있으면 취소
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }

          // 마지막 업데이트와 사용자 정보가 동일하면 중복 방지
          const userKey = `${user.id}-${user.updated_at || ""}`;
          if (userKey !== lastProfileUpdateRef.current) {
            // 디바운싱 적용 (250ms)
            debounceTimerRef.current = setTimeout(async () => {
              try {
                const result = await upsertProfileFromSupabaseUser(user);
                if (!result.success && !result.skipped) {
                  console.error("[AuthStateListener] Failed to update profile:", result.error);
                } else if (result.success) {
                  // 성공적으로 프로필을 업데이트한 후 참조 업데이트
                  lastProfileUpdateRef.current = userKey;
                  // console.log('[AuthStateListener] Profile updated on', event);
                }
              } catch (err) {
                console.error("[AuthStateListener] Error updating profile:", err);
              } finally {
                debounceTimerRef.current = null;
              }
            }, 250);
          }
        }
      } else if (event === "SIGNED_OUT") {
        // 로그아웃 시 참조 초기화
        profileInitializedRef.current = false;
        lastProfileUpdateRef.current = null;

        // 로그아웃 페이지 처리 (필요시 활성화)
        // if (window.location.pathname !== '/login') {
        //   router.push('/login');
        // }
      }
    });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  return null;
}
