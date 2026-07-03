// fortune use-cases (프레임워크 무관). 어댑터(apps/web/src/{tools,actions})가 호출한다.
// 사주 계산은 domain(saju 엔진)이 소유한다.
import { getSajuInfo } from "../domain/services/saju-info";
import { solarToLunar, lunarToSolar } from "../domain/services/calendar";
import { computeHarmony } from "../domain/services/harmony";
import type { BirthInput } from "../domain/value-objects";

export { computeHarmony } from "../domain/services/harmony";
export type { HarmonyResult } from "../domain/services/harmony";

/** 입력받은 생년월일시로 사주를 계산한다. */
export function computeSaju(input: BirthInput) {
  return getSajuInfo(input);
}

/** 궁합 계산 입력 — profiles 테이블의 사주 관련 컬럼(전부 nullable). */
export interface SajuProfileInput {
  gender: string | null;
  birth_type: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  birth_time: string | null;
}

/** profiles 행 → BirthInput 매핑. birth_time 결측 시 정오("12") 기본값. */
export function profileToBirthInput(p: SajuProfileInput): BirthInput {
  return {
    gender: p.gender ?? "남성",
    calendar: p.birth_type ?? "양력",
    year: String(p.birth_year ?? ""),
    month: String(p.birth_month ?? ""),
    day: String(p.birth_day ?? ""),
    hour: p.birth_time ?? "12",
  };
}

/** 두 사주 프로필의 궁합 점수를 계산한다(어댑터·infra 재사용). */
export function computeProfileHarmony(a: SajuProfileInput, b: SajuProfileInput) {
  return computeHarmony(profileToBirthInput(a), profileToBirthInput(b));
}

/** 양력 → 음력 변환. 실패 시 null. */
export function convertSolarToLunar(year: number, month: number, day: number) {
  const solarDate = new Date(year, month - 1, day);
  return solarToLunar(solarDate);
}

/** 음력 → 양력 변환. */
export function convertLunarToSolar(year: number, month: number, day: number, isLeapMonth = false) {
  return lunarToSolar(year, month, day, isLeapMonth);
}
