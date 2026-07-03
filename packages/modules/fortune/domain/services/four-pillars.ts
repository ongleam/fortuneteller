/**
 * 사주 팔자 계산 모듈
 */

import { HEAVENLY_STEMS, EARTHLY_BRANCHES, SIXTY_GAPJA, getStemIndex } from "../enums";
import { lunarToSolar, getSajuYear, getSajuMonth, normalizeCalendarType } from "./calendar";
import { applyTimeCorrections } from "./time-correction";
import type { BirthInput, FourPillars } from "../value-objects";

/**
 * 메인 사주 팔자 계산 함수
 * @param birthInput 생년월일 정보
 * @returns 사주 팔자 정보
 */
export async function getFourPillars(birthInput: BirthInput): Promise<FourPillars> {
  // BirthInput 필드 매핑
  const year = parseInt(birthInput.year);
  const month = parseInt(birthInput.month);
  const day = parseInt(birthInput.day);
  const hour = parseInt(birthInput.hour, 10);
  const minute = birthInput.minute ? parseInt(birthInput.minute, 10) : 0;
  const calendar = normalizeCalendarType(birthInput.calendar);
  const isLeapMonth = birthInput.isLeapMonth || false;

  // 양력/음력 변환 처리 시 시간 정보 포함
  let solarDate: Date;
  if (calendar === "lunar") {
    const converted = lunarToSolar(year, month, day, isLeapMonth);
    if (converted) {
      solarDate = new Date(converted.year, converted.month - 1, converted.day, hour, minute);
    } else {
      throw new Error("Invalid lunar date");
    }
  } else {
    solarDate = new Date(year, month - 1, day, hour, minute);
  }

  // 사주 기준 년/월 계산 (절기 기준)
  // 년/월 절기 SSOT 는 KST 시계 기준으로 들어있으므로 보정 전 시각으로 비교한다.
  const sajuYear = await getSajuYear(solarDate);
  const sajuMonth = await getSajuMonth(solarDate);

  // 진태양시 보정: longitude offset + 한국 표준시 변경(1954-1961) + DST.
  // 일주(자정 경계)·시주(30분 시지 경계)에만 영향.
  const correctedDate = applyTimeCorrections(solarDate, birthInput.longitudeE);
  const correctedHour = correctedDate.getHours();
  const correctedMinute = correctedDate.getMinutes();

  // 일주 계산을 위한 날짜 결정 (야자시 고려)
  // 자시는 23:00 ~ 01:00 (정시 매핑). 23:00 이후는 다음 날 일주로 친다.
  let dayPillarDate = new Date(correctedDate);
  const totalMinutes = correctedHour * 60 + correctedMinute;
  if (totalMinutes >= 23 * 60) {
    dayPillarDate.setDate(dayPillarDate.getDate() + 1);
  }

  // 각 주 계산
  const yearPillar = getYearPillar(sajuYear);
  const monthPillar = getMonthPillar(sajuYear, sajuMonth);
  const dayPillar = getDayPillar(dayPillarDate);
  const timePillar = getTimePillar(dayPillar, String(correctedHour), String(correctedMinute));

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    time: timePillar,
  };
}

/**
 * 년주(Year Pillar) 계산
 * @param year 년도
 * @returns 년주 정보
 */
export function getYearPillar(year: number) {
  const baseYear = 1924;
  const yearOffset = (year - baseYear) % 60;
  const gapjaIndex = yearOffset < 0 ? yearOffset + 60 : yearOffset;
  const gapja = SIXTY_GAPJA[gapjaIndex];
  return { sky: gapja.charAt(0), ground: gapja.charAt(1) };
}

/**
 * 월주(Month Pillar) 계산
 * @param year 년도
 * @param month 월
 * @returns 월주 정보
 */
export function getMonthPillar(year: number, month: number): { sky: string; ground: string } {
  const yearPillar = getYearPillar(year);
  const yearSkyIndex = getStemIndex(yearPillar.sky);
  const firstMonthStemMap = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const firstMonthSkyIndex = firstMonthStemMap[yearSkyIndex];
  const monthOffset = month - 1;
  const monthSkyIndex = (firstMonthSkyIndex + monthOffset) % 10;
  const monthGroundIndex = (2 + monthOffset) % 12;

  return {
    sky: HEAVENLY_STEMS[monthSkyIndex].chinese,
    ground: EARTHLY_BRANCHES[monthGroundIndex].chinese,
  };
}

/**
 * 일주(Day Pillar) 계산
 * @param date 날짜
 * @returns 일주 정보
 */
export function getDayPillar(date: Date): { sky: string; ground: string } {
  // 일주는 율리우스 적일수(JDN)로 직접 계산한다. 60갑자 일주는 기원전부터
  // 끊김 없이 이어진 연속 일수 카운트이므로, JDN + 사이클 위상 상수 하나로 결정된다.
  //   - 위상 상수 49: 한국 사주 SSOT(forceteller)와 일치하도록 조정된 값.
  //     기준 검증: 1995-04-25(양력) = 丙戌(60갑자 22). N=100 회귀 데이터셋
  //     (src/skills/saju/benchmark/forceteller) 양력 86건의 일주에서 100% 일치.
  //   - 정수 연산만 사용 → 타임존/밀리초 오차 없음.
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  const jdn =
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045;

  const gapjaIndex = (((jdn + 49) % 60) + 60) % 60;
  const gapja = SIXTY_GAPJA[gapjaIndex];
  return { sky: gapja[0], ground: gapja[1] };
}

/**
 * 시주(Time Pillar) 계산
 * @param dayPillar 일주 정보
 * @param hourStr 시간
 * @param minuteStr 분
 * @returns 시주 정보
 */
export function getTimePillar(
  dayPillar: { sky: string; ground: string },
  hourStr: string,
  minuteStr?: string,
) {
  const daySkyIndex = getStemIndex(dayPillar.sky);
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ? parseInt(minuteStr, 10) : 0;
  const firstTimeSkyMap = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const firstTimeSky = firstTimeSkyMap[daySkyIndex];
  const totalMinutes = hour * 60 + minute;

  // 시지 매핑: 정시(2시간) 경계. 입력 시각은 진태양시 보정(longitude+KST+DST) 후 값.
  // forceteller SSOT 알고리즘과 호환. 사용자 UI 의 30분 경계 표는 평상시(KST,no-DST)
  // 한국 longitude 가정에서 정시 매핑+−23분 보정과 동등하도록 미리 더해진 표시용.
  let timeGroundIndex;
  if (totalMinutes >= 23 * 60 || totalMinutes < 1 * 60) timeGroundIndex = 0;
  else if (totalMinutes < 3 * 60) timeGroundIndex = 1;
  else if (totalMinutes < 5 * 60) timeGroundIndex = 2;
  else if (totalMinutes < 7 * 60) timeGroundIndex = 3;
  else if (totalMinutes < 9 * 60) timeGroundIndex = 4;
  else if (totalMinutes < 11 * 60) timeGroundIndex = 5;
  else if (totalMinutes < 13 * 60) timeGroundIndex = 6;
  else if (totalMinutes < 15 * 60) timeGroundIndex = 7;
  else if (totalMinutes < 17 * 60) timeGroundIndex = 8;
  else if (totalMinutes < 19 * 60) timeGroundIndex = 9;
  else if (totalMinutes < 21 * 60) timeGroundIndex = 10;
  else timeGroundIndex = 11;

  const timeOffset = timeGroundIndex;
  const timeSkyIndex = (firstTimeSky + timeOffset) % 10;

  return {
    sky: HEAVENLY_STEMS[timeSkyIndex].chinese,
    ground: EARTHLY_BRANCHES[timeGroundIndex].chinese,
  };
}

/**
 * 사주 팔자 유효성 검사
 * @param pillars 사주 팔자 정보
 * @returns 유효성 여부
 */
export function validatePillars(pillars: FourPillars): boolean {
  const isValidSky = (sky: string) => HEAVENLY_STEMS.some((s) => s.chinese === sky);
  const isValidGround = (ground: string) => EARTHLY_BRANCHES.some((b) => b.chinese === ground);

  return (
    isValidSky(pillars.year.sky) &&
    isValidGround(pillars.year.ground) &&
    isValidSky(pillars.month.sky) &&
    isValidGround(pillars.month.ground) &&
    isValidSky(pillars.day.sky) &&
    isValidGround(pillars.day.ground) &&
    isValidSky(pillars.time.sky) &&
    isValidGround(pillars.time.ground)
  );
}
