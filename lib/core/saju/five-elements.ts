/**
 * 오행 분석 모듈
 */

import { getStemInfo, getBranchInfo, JIJANG_GAN } from './constants';
import { fetchSaju } from './reference';
import type { SajuPillars, FiveElements, BirthInput } from '../../shared/types/saju';

/**
 * Reference API를 사용한 정확한 오행 분석
 * 사용자가 "reference가 무조건 맞는거야"라고 명시했으므로 이 함수를 우선 사용
 */
export async function calculateFiveElementsAccurate(birthInput: BirthInput): Promise<FiveElements> {
  try {
    const result = await fetchSaju(
      birthInput.name || '테스트',
      birthInput.gender,
      birthInput.calendar === '양력' ? 'solar' : 'lunar',
      birthInput.year.padStart(4, '20'),
      birthInput.month.padStart(2, '0'),
      birthInput.day.padStart(2, '0'),
      birthInput.hour.padStart(2, '0')
    );

    if (result.saju?.fortuneList?.storedUnse) {
      const unse = result.saju.fortuneList.storedUnse;
      return {
        wood: unse.fiveTreeNum || 0,
        fire: unse.fiveFireNum || 0,
        earth: unse.fiveSoilNum || 0,
        metal: unse.fiveIronNum || 0,
        water: unse.fiveWaterNum || 0
      };
    }
  } catch (error) {
    console.warn('Reference API 호출 실패, 백업 계산 사용:', error);
  }
  
  // 백업: 기존 로컬 계산 사용 (pillars 없이는 불가능하므로 기본값 반환)
  return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
}

/**
 * 로컬 계산 기반 오행 분석 (백업용)
 */
export function calculateFiveElementsLocal(pillars: SajuPillars): FiveElements {
  let elementCounts = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0
  };
  
  // 1. 천간 4개의 오행 카운트
  const stems = [
    pillars.year.stem,
    pillars.month.stem,
    pillars.day.stem,
    pillars.time.stem
  ];
  
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
    pillars.time.branch
  ];
  
  for (const branch of branches) {
    addBranchElements(elementCounts, branch);
  }
  
  return elementCounts;
}

/**
 * 메인 오행 분석 함수
 * 기존 코드 호환성을 위한 동기 함수
 */
export function calculateFiveElements(pillars: SajuPillars): FiveElements {
  // 동기 함수 유지를 위해 로컬 계산 사용
  // 정확한 계산이 필요한 경우 calculateFiveElementsAccurate() 사용
  return calculateFiveElementsLocal(pillars);
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
    if (stemInfo && jijang.rate >= 10) { // 비율이 10 이상인 것만 카운트
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
  
/**
 * 오행 분석 결과 해석
 */
export function analyzeElementBalance(elements: FiveElements): {
  strongest: string;
  weakest: string;
  total: number;
  balance: 'balanced' | 'imbalanced';
} {
  const elementMap = [
    { name: '목', count: elements.wood },
    { name: '화', count: elements.fire },
    { name: '토', count: elements.earth },
    { name: '금', count: elements.metal },
    { name: '수', count: elements.water }
  ];
  
  elementMap.sort((a, b) => b.count - a.count);
  
  const strongest = elementMap[0];
  const weakest = elementMap[elementMap.length - 1];
  const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
  
  // 균형 판단 (가장 많은 것과 가장 적은 것의 차이가 2 이하면 균형)
  const balance = (strongest.count - weakest.count) <= 2 ? 'balanced' : 'imbalanced';
  
  return {
    strongest: strongest.name,
    weakest: weakest.name,
    total,
    balance
  };
}

/**
 * 클래스 형태 호환성을 위한 래퍼 (기존 코드 호환성)
 */
export class SajuFiveElementsCalculator {
  static calculate(pillars: SajuPillars): FiveElements {
    return calculateFiveElements(pillars);
  }
  
  static analyzeBalance(elements: FiveElements): {
    strongest: string;
    weakest: string;
    total: number;
    balance: 'balanced' | 'imbalanced';
  } {
    return analyzeElementBalance(elements);
  }
}

/**
 * 오행 의미 설명 (참고용)
 */
export const FIVE_ELEMENTS_MEANINGS = {
  '목': '성장, 발전, 창의성, 유연성',
  '화': '열정, 활동성, 표현력, 명예',
  '토': '안정, 신뢰, 포용력, 중심',
  '금': '정확성, 원칙, 정의, 절제',
  '수': '지혜, 적응력, 유동성, 깊이'
} as const;