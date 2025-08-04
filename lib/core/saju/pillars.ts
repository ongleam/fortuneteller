/**
 * 사주 팔자 계산 모듈
 * Reference API를 기반으로 정확한 계산 제공
 */

import { HEAVENLY_STEMS, EARTHLY_BRANCHES, SIXTY_GAPJA, getStemIndex } from './constants';
import { lunarToSolar, getSajuYear, getSajuMonth } from './calendar';
import { fetchSaju } from './reference';
import type { BirthInput, SajuPillars } from '@/lib/shared/types/saju';

/**
 * 한글 달력 타입을 영어로 변환하는 유틸 함수
 * @param calendar 한글 또는 영어 달력 타입
 * @returns 영어 달력 타입 ('solar' | 'lunar')
 */
export function normalizeCalendarType(calendar: string): 'solar' | 'lunar' {
  const lowerCalendar = calendar.toLowerCase().trim();

  // 한글 → 영어 변환
  if (lowerCalendar === '양력' || lowerCalendar === 'solar') {
    return 'solar';
  }
  if (lowerCalendar === '음력' || lowerCalendar === 'lunar') {
    return 'lunar';
  }

  // 기본값: 양력
  console.warn(`알 수 없는 달력 타입: ${calendar}, 기본값 'solar' 사용`);
  return 'solar';
}

// reference api를 사용한 사주 팔자 계산
export async function getSajuPillarsReference(
  birthInput: BirthInput
): Promise<SajuPillars | undefined> {
  try {
    // Year padding 수정: 4자리로 정규화
    let normalizedYear = birthInput.year;
    if (normalizedYear.length <= 2) {
      const year = parseInt(normalizedYear);
      // 현재 연도 기준으로 세기 판단
      if (year <= 30) {
        normalizedYear = `20${normalizedYear.padStart(2, '0')}`;
      } else {
        normalizedYear = `19${normalizedYear.padStart(2, '0')}`;
      }
    }
    normalizedYear = normalizedYear.padStart(4, '0');

    const normalizedCalendar = normalizeCalendarType(birthInput.calendar);
    const koreanCalendar = normalizedCalendar === 'solar' ? '양력' : '음력';

    const result = await fetchSaju(
      birthInput.name || '테스트',
      birthInput.gender,
      koreanCalendar,
      normalizedYear,
      birthInput.month.padStart(2, '0'),
      birthInput.day.padStart(2, '0'),
      birthInput.hour.padStart(2, '0'),
      birthInput.minute?.padStart(2, '0')
    );

    const sajuData = result.saju.fortuneList.saju;

    return {
      year: {
        stem: sajuData.yearSky?.chinese || '甲',
        branch: sajuData.yearGround?.chinese || '子',
      },
      month: {
        stem: sajuData.monthSky?.chinese || '甲',
        branch: sajuData.monthGround?.chinese || '子',
      },
      day: {
        stem: sajuData.daySky?.chinese || '甲',
        branch: sajuData.dayGround?.chinese || '子',
      },
      time: {
        stem: sajuData.timeSky?.chinese || '甲',
        branch: sajuData.timeGround?.chinese || '子',
      },
    };
  } catch (error) {
    console.warn('Reference API 호출 실패, 백업 계산 사용:', error);
  }
}

export async function getSajuPillars(birthInput: BirthInput): Promise<SajuPillars> {
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

export function getYearPillar(year: number) {
  const baseYear = 1924;
  const yearOffset = (year - baseYear) % 60;
  const gapjaIndex = yearOffset < 0 ? yearOffset + 60 : yearOffset;
  const gapja = SIXTY_GAPJA[gapjaIndex];
  return { stem: gapja.charAt(0), branch: gapja.charAt(1) };
}

export function getMonthPillar(year: number, month: number): { stem: string; branch: string } {
  const yearPillar = getYearPillar(year);
  const yearStemIndex = getStemIndex(yearPillar.stem);
  const firstMonthStemMap = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0];
  const firstMonthStemIndex = firstMonthStemMap[yearStemIndex];
  const monthOffset = month - 1;
  const monthStemIndex = (firstMonthStemIndex + monthOffset) % 10;
  const monthBranchIndex = (2 + monthOffset) % 12;

  return {
    stem: HEAVENLY_STEMS[monthStemIndex].chinese,
    branch: EARTHLY_BRANCHES[monthBranchIndex].chinese,
  };
}

export function getDayPillar(date: Date): { stem: string; branch: string } {
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
  return { stem: gapja[0], branch: gapja[1] };
}

export function getTimePillar(
  dayPillar: { stem: string; branch: string },
  hourStr: string,
  minuteStr?: string
) {
  const dayStemIndex = getStemIndex(dayPillar.stem);
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ? parseInt(minuteStr, 10) : 0;
  const firstTimeStemMap = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8];
  const firstTimeStem = firstTimeStemMap[dayStemIndex];
  const totalMinutes = hour * 60 + minute;

  let timeBranchIndex;
  if (totalMinutes >= 23 * 60 + 30 || totalMinutes < 1 * 60 + 30) timeBranchIndex = 0;
  else if (totalMinutes < 3 * 60 + 30) timeBranchIndex = 1;
  else if (totalMinutes < 5 * 60 + 30) timeBranchIndex = 2;
  else if (totalMinutes < 7 * 60 + 30) timeBranchIndex = 3;
  else if (totalMinutes < 9 * 60 + 30) timeBranchIndex = 4;
  else if (totalMinutes < 11 * 60 + 30) timeBranchIndex = 5;
  else if (totalMinutes < 13 * 60 + 30) timeBranchIndex = 6;
  else if (totalMinutes < 15 * 60 + 30) timeBranchIndex = 7;
  else if (totalMinutes < 17 * 60 + 30) timeBranchIndex = 8;
  else if (totalMinutes < 19 * 60 + 30) timeBranchIndex = 9;
  else if (totalMinutes < 21 * 60 + 30) timeBranchIndex = 10;
  else timeBranchIndex = 11;

  const timeOffset = timeBranchIndex;
  const timeStemIndex = (firstTimeStem + timeOffset) % 10;

  return {
    stem: HEAVENLY_STEMS[timeStemIndex].chinese,
    branch: EARTHLY_BRANCHES[timeBranchIndex].chinese,
  };
}

export function validatePillars(pillars: SajuPillars): boolean {
  const isValidStem = (stem: string) => HEAVENLY_STEMS.some((s) => s.chinese === stem);
  const isValidBranch = (branch: string) => EARTHLY_BRANCHES.some((b) => b.chinese === branch);

  return (
    isValidStem(pillars.year.stem) &&
    isValidBranch(pillars.year.branch) &&
    isValidStem(pillars.month.stem) &&
    isValidBranch(pillars.month.branch) &&
    isValidStem(pillars.day.stem) &&
    isValidBranch(pillars.day.branch) &&
    isValidStem(pillars.time.stem) &&
    isValidBranch(pillars.time.branch)
  );
}
