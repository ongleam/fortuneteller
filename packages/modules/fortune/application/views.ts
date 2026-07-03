// fortune read 프로젝션 — handler 결과를 어댑터가 반환할 응답 shape 로 포맷한다.
// 상태 변경 없음. 사주 계산/조회는 handlers.ts, 계산은 domain 이 소유.
import type { StoredSajuReading, HarmonyReading } from "./handlers";

/** 저장된 사주 조회 결과 → AI tool 응답. */
export function storedSajuReadingView(reading: StoredSajuReading, today: string) {
  if (!reading.hasStoredInfo) {
    return {
      success: false,
      message: "저장된 사주 정보가 없습니다.",
      hasStoredInfo: false,
      suggestion: '사주 정보를 먼저 입력해주세요. "내 사주 정보 등록하기"라고 말씀해주시면 됩니다.',
    };
  }

  const { profile, sajuResult } = reading;
  return {
    success: true,
    message: "저장된 정보로 사주를 조회했습니다.",
    hasStoredInfo: true,
    today,
    userInfo: {
      name: profile.name,
      gender: profile.gender,
      calendar: profile.birth_type,
      year: profile.birth_year,
      month: profile.birth_month,
      day: profile.birth_day,
      hour: profile.birth_time,
    },
    sajuResult,
  };
}

/** 궁합 계산 결과 → AI tool 응답. */
export function harmonyView(reading: HarmonyReading, partnerName: string) {
  const harmonyResult = {
    success: true,
    compatibility: "양호",
    analysis: `${reading.userProfile.name}님과 ${partnerName}님의 사주를 분석한 결과입니다.`,
    userSaju: reading.userSaju,
    partnerSaju: reading.partnerSaju,
  };

  return {
    success: true,
    message: "궁합 조회 완료",
    harmonyResult,
  };
}
