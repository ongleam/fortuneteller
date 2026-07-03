// 서버 어댑터 — 카카오 유저 조회(chat 모듈 handler 위임).
import type { KakaoUserProfile } from "@fortuneteller/shared/types/kakao";
import { getKakaoUserInfo as getKakaoUserInfoHandler } from "@fortuneteller/modules/chat/application/handlers";

export async function getKakaoUserInfo(accessToken: string): Promise<KakaoUserProfile> {
  return getKakaoUserInfoHandler(accessToken);
}
