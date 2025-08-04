/**
 * 오행 분석 모듈
 */

import { getStemInfo, getBranchInfo, JIJANG_GAN } from './constants';
import { fetchSaju } from './reference';
import type { SajuPillars, FiveElements, BirthInput } from '../../shared/types/saju';
import { normalizeCalendarType } from './calendar';

/**
 * Reference API를 사용한 정확한 오행 분석
 * @param birthInput 생년월일 정보
 * @returns 오행 분석 결과
 */
export async function getFiveElementsReference(
  birthInput: BirthInput
): Promise<FiveElements | undefined> {
  try {
    const normalizedCalendar = normalizeCalendarType(birthInput.calendar);
    const koreanCalendar = normalizedCalendar === 'solar' ? '양력' : '음력';
    const result = await fetchSaju(
      birthInput.name || '테스트',
      birthInput.gender,
      koreanCalendar,
      birthInput.year.padStart(4, '20'),
      birthInput.month.padStart(2, '0'),
      birthInput.day.padStart(2, '0'),
      birthInput.hour.padStart(2, '0')
    );

    const unse = result.saju.fortuneList.storedUnse;
    return {
      wood: unse.fiveTreeNum || 0,
      fire: unse.fiveFireNum || 0,
      earth: unse.fiveSoilNum || 0,
      metal: unse.fiveIronNum || 0,
      water: unse.fiveWaterNum || 0,
    };
  } catch (error) {
    console.warn('Reference API 호출 실패, 백업 계산 사용:', error);
  }
}

/**
 * 메인 오행 분석 함수
 * @param pillars 사주 팔자 정보
 * @returns 오행 분석 결과
 */
export function getFiveElements(pillars: SajuPillars): FiveElements {
  let elementCounts = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 1. 천간 4개의 오행 카운트
  const stems = [pillars.year.stem, pillars.month.stem, pillars.day.stem, pillars.time.stem];

  for (const stem of stems) {
    const stemInfo = getStemInfo(stem);
    if (stemInfo) {
      addElementCount(elementCounts, stemInfo.fiveElement);
    }
  }

  // 2. 지지 4개의 지장간 오행 카운트
  const branches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.time.branch,
  ];

  for (const branch of branches) {
    addBranchElements(elementCounts, branch);
  }

  return elementCounts;
}

/**
 * 지지의 지장간을 분석하여 오행 카운트에 추가
 */
export function addBranchElements(elementCounts: FiveElements, branch: string): void {
  const jijangGan = JIJANG_GAN[branch as keyof typeof JIJANG_GAN];

  if (!jijangGan) return;

  // 지장간의 각 천간을 비율에 따라 계산
  // 간단화를 위해 주요 지장간만 1개씩 카운트
  for (const jijang of jijangGan) {
    const stemInfo = getStemInfo(jijang.stem);
    if (stemInfo && jijang.rate >= 10) {
      // 비율이 10 이상인 것만 카운트
      addElementCount(elementCounts, stemInfo.fiveElement);
    }
  }
}

/**
 * 오행별 카운트 증가
 */
export function addElementCount(elementCounts: FiveElements, element: string): void {
  switch (element) {
    case '목':
      elementCounts.wood += 1;
      break;
    case '화':
      elementCounts.fire += 1;
      break;
    case '토':
      elementCounts.earth += 1;
      break;
    case '금':
      elementCounts.metal += 1;
      break;
    case '수':
      elementCounts.water += 1;
      break;
  }
}
