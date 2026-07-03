// fortune use-cases (프레임워크 무관). 어댑터(apps/web/src/{tools,actions})가 호출한다.
// 사주 계산은 domain(saju 엔진)이 소유한다.
import { getSajuInfo } from "../domain/services/saju-info";
import { solarToLunar, lunarToSolar } from "../domain/services/calendar";
import type { BirthInput } from "../domain/value-objects";

/** 입력받은 생년월일시로 사주를 계산한다. */
export function computeSaju(input: BirthInput) {
  return getSajuInfo(input);
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
