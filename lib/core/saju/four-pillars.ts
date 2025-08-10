/**
 * 사주 팔자 계산 모듈
 */

import { HEAVENLY_STEMS, EARTHLY_BRANCHES, SIXTY_GAPJA, getStemIndex } from './constants';
import { lunarToSolar, getSajuYear, getSajuMonth, normalizeCalendarType } from './calendar';
import type { BirthInput, FourPillars } from '@/lib/shared/types/saju';

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
  if (calendar === 'lunar') {
    const converted = lunarToSolar(year, month, day, isLeapMonth);
    if (converted) {
      solarDate = new Date(converted.year, converted.month - 1, converted.day, hour, minute);
    } else {
      throw new Error('Invalid lunar date');
    }
  } else {
    solarDate = new Date(year, month - 1, day, hour, minute);
  }

  // 사주 기준 년/월 계산 (절기 기준)
  const sajuYear = await getSajuYear(solarDate);
  const sajuMonth = await getSajuMonth(solarDate);

  // 일주 계산을 위한 날짜 결정 (야자시 고려)
  let dayPillarDate = new Date(solarDate);
  const totalMinutes = hour * 60 + minute;
  if (totalMinutes >= 23 * 60 + 30) {
    dayPillarDate.setDate(dayPillarDate.getDate() + 1);
  }

  // 각 주 계산
  const yearPillar = getYearPillar(sajuYear);
  const monthPillar = getMonthPillar(sajuYear, sajuMonth);
  const dayPillar = getDayPillar(dayPillarDate);
  const timePillar = getTimePillar(dayPillar, birthInput.hour, birthInput.minute);

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
  const baseDate = new Date('1995-04-25T00:00:00');
  const baseGapja = '丙戌';

  // getTimezoneOffset()을 고려하여 UTC 자정 기준으로 계산
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  baseDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const baseGapjaIndex = SIXTY_GAPJA.findIndex((g) => g === baseGapja);
  if (baseGapjaIndex === -1) throw new Error(`기준 갑자를 찾을 수 없습니다: ${baseGapja}`);

  let gapjaIndex = (baseGapjaIndex + diffDays) % 60;
  if (gapjaIndex < 0) gapjaIndex += 60;

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
  minuteStr?: string
) {
  const daySkyIndex = getStemIndex(dayPillar.sky);
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ? parseInt(minuteStr, 10) : 0;
  const firstTimeSkyMap = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const firstTimeSky = firstTimeSkyMap[daySkyIndex];
  const totalMinutes = hour * 60 + minute;

  let timeGroundIndex;
  if (totalMinutes >= 23 * 60 + 30 || totalMinutes < 1 * 60 + 30) timeGroundIndex = 0;
  else if (totalMinutes < 3 * 60 + 30) timeGroundIndex = 1;
  else if (totalMinutes < 5 * 60 + 30) timeGroundIndex = 2;
  else if (totalMinutes < 7 * 60 + 30) timeGroundIndex = 3;
  else if (totalMinutes < 9 * 60 + 30) timeGroundIndex = 4;
  else if (totalMinutes < 11 * 60 + 30) timeGroundIndex = 5;
  else if (totalMinutes < 13 * 60 + 30) timeGroundIndex = 6;
  else if (totalMinutes < 15 * 60 + 30) timeGroundIndex = 7;
  else if (totalMinutes < 17 * 60 + 30) timeGroundIndex = 8;
  else if (totalMinutes < 19 * 60 + 30) timeGroundIndex = 9;
  else if (totalMinutes < 21 * 60 + 30) timeGroundIndex = 10;
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
