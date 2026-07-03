// profile read 프로젝션 — 도메인 SajuProfile 을 어댑터 응답 shape 로 포맷한다.
import type { SajuProfile } from "@fortuneteller/modules/profile/domain/value-objects";

/** 프로필 갱신 결과 → AI tool 응답. */
export function updatedProfileView(updatedProfile: SajuProfile) {
  return {
    success: true,
    message: "사주 정보가 프로필에 저장되었습니다.",
    profile: {
      name: updatedProfile.name,
      gender: updatedProfile.gender,
      calendar: updatedProfile.birth_type,
      year: updatedProfile.birth_year,
      month: updatedProfile.birth_month,
      day: updatedProfile.birth_day,
      hour: updatedProfile.birth_time,
    },
  };
}
