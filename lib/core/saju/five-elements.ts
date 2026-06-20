/**
 * 오행 분석 모듈
 */

import { getStemInfo as getSkyInfo, getGroundInfo, JIJANG_GAN } from './constants';
import type { FourPillars, FiveElements } from './types';

/**
 * 메인 오행 분석 함수 - UI 표시와 일치하도록 천간과 지지의 주된 오행만 카운트
 * @param pillars 사주 팔자 정보
 * @returns 오행 분석 결과
 */
export function getFiveElements(pillars: FourPillars): FiveElements {
  let elementCounts = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 1. 천간 4개의 오행 카운트
  const skies = [pillars.year.sky, pillars.month.sky, pillars.day.sky, pillars.time.sky];

  for (const sky of skies) {
    const skyInfo = getSkyInfo(sky);
    if (skyInfo) {
      addElementCount(elementCounts, skyInfo.fiveElement);
    }
  }

  // 2. 지지 4개의 주된 오행 카운트 (지장간이 아닌 지지 자체의 오행)
  const grounds = [
    pillars.year.ground,
    pillars.month.ground,
    pillars.day.ground,
    pillars.time.ground,
  ];

  for (const ground of grounds) {
    addMainGroundElement(elementCounts, ground);
  }

  return elementCounts;
}

/**
 * 지지의 주된 오행만 카운트 (UI 표시와 일치)
 */
export function addMainGroundElement(elementCounts: FiveElements, ground: string): void {
  // constants.ts의 EARTHLY_BRANCHES에서 지지의 주된 오행을 가져옴
  const groundInfo = getGroundInfo(ground);

  if (groundInfo) {
    addElementCount(elementCounts, groundInfo.fiveElement);
  }
}

/**
 * 지지의 지장간을 분석하여 오행 카운트에 추가 (기존 방식, 참조용)
 */
export function addGroundElements(elementCounts: FiveElements, ground: string): void {
  const jijangGan = JIJANG_GAN[ground as keyof typeof JIJANG_GAN];

  if (!jijangGan) return;

  // 지장간의 모든 천간을 카운트
  for (const jijang of jijangGan) {
    const skyInfo = getSkyInfo(jijang.stem);
    if (skyInfo) {
      addElementCount(elementCounts, skyInfo.fiveElement);
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

