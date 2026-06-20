import { KakaoUserProfile } from "@/lib/shared/types/kakao";

export async function getKakaoUserInfo(accessToken: string): Promise<KakaoUserProfile> {
  try {
    const response = await fetch("https://kapi.kakao.com/v2/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`카카오 API 오류: ${errorData.message || response.statusText}`);
    }

    const userProfile = await response.json();

    return userProfile as KakaoUserProfile;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
