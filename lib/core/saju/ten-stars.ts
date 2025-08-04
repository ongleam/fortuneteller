/**
 * 십성 계산 모듈
 */

import { getStemInfo } from './constants';
import type { SajuPillars, TenStars } from '../../shared/types/saju';

/**
 * 사주 팔자 전체(천간, 지지)에 대한 십성 분석
 */
export function getTenStars(pillars: SajuPillars): TenStars {
  const dayStem = pillars.day.stem; // 일간이 기준

  return {
    yearStem: getTenStar(dayStem, pillars.year.stem),
    yearBranch: getTenStar(dayStem, getMainStem(pillars.year.branch)),
    monthStem: getTenStar(dayStem, pillars.month.stem),
    monthBranch: getTenStar(dayStem, getMainStem(pillars.month.branch)),
    dayStem: '비견', // 일간은 항상 자기 자신이므로 비견
    dayBranch: getTenStar(dayStem, getMainStem(pillars.day.branch)),
    timeStem: getTenStar(dayStem, pillars.time.stem),
    timeBranch: getTenStar(dayStem, getMainStem(pillars.time.branch)),
  };
}

/**
 * 사주 각 기둥의 천간에 대한 십성 분석
 * @param pillars 사주 팔자 정보
 * @returns 각 기둥 천간의 십성 정보
 */
export function getTenStarsForPillars(pillars: SajuPillars) {
  const dayStem = pillars.day.stem; // 일간(日干)이 기준

  return {
    year: getTenStar(dayStem, pillars.year.stem),
    month: getTenStar(dayStem, pillars.month.stem),
    day: '일원', // 일주 천간은 항상 '일원'
    time: getTenStar(dayStem, pillars.time.stem),
  };
}

/**
 * 두 천간 간의 십성 관계 계산
 * @param baseStem 기준 천간 (일간)
 * @param targetStem 대상 천간
 */
export function getTenStar(baseStem: string, targetStem: string): string {
  const baseInfo = getStemInfo(baseStem);
  const targetInfo = getStemInfo(targetStem);

  if (!baseInfo || !targetInfo) {
    return ''; // 오류 시 빈 문자열
  }

  const baseElement = baseInfo.fiveElement;
  const baseYangYin = baseInfo.yangYin;
  const targetElement = targetInfo.fiveElement;
  const targetYangYin = targetInfo.yangYin;

  // 같은 오행인 경우
  if (baseElement === targetElement) {
    if (baseYangYin === targetYangYin) {
      return '비견'; // 같은 음양
    } else {
      return '겁재'; // 다른 음양
    }
  }

  // 일간이 생하는 오행 (식상)
  if (isGenerating(baseElement, targetElement)) {
    return targetYangYin === baseYangYin ? '식신' : '상관';
  }

  // 일간이 극하는 오행 (재성)
  if (isOvercoming(baseElement, targetElement)) {
    return targetYangYin === baseYangYin ? '편재' : '정재';
  }

  // 일간을 극하는 오행 (관성)
  if (isOvercoming(targetElement, baseElement)) {
    return targetYangYin === baseYangYin ? '편관' : '정관';
  }

  // 일간을 생하는 오행 (인성)
  if (isGenerating(targetElement, baseElement)) {
    return targetYangYin === baseYangYin ? '편인' : '정인';
  }

  return ''; // 이론상 여기까지 오면 안됨
}

/**
 * 지지의 주기(지장간 중 가장 강한 천간) 추출
 */
export function getMainStem(branch: string): string {
  // 지장간에서 가장 강한 천간을 반환
  // 간단한 매핑으로 구현 (실제로는 지장간 비율 고려)
  const branchToMainStem: { [key: string]: string } = {
    子: '癸', // 자 -> 계수
    丑: '己', // 축 -> 기토
    寅: '甲', // 인 -> 갑목
    卯: '乙', // 묘 -> 을목
    辰: '戊', // 진 -> 무토
    巳: '丙', // 사 -> 병화
    午: '丁', // 오 -> 정화
    未: '己', // 미 -> 기토
    申: '庚', // 신 -> 경금
    酉: '辛', // 유 -> 신금
    戌: '戊', // 술 -> 무토
    亥: '壬', // 해 -> 임수
  };

  return branchToMainStem[branch] || branch;
}

/**
 * 오행 상생 관계 확인
 */
export function isGenerating(from: string, to: string): boolean {
  const generateMap: { [key: string]: string } = {
    목: '화',
    화: '토',
    토: '금',
    금: '수',
    수: '목',
  };

  return generateMap[from] === to;
}

/**
 * 오행 상극 관계 확인
 */
export function isOvercoming(from: string, to: string): boolean {
  const overcomeMap: { [key: string]: string } = {
    목: '토',
    화: '금',
    토: '수',
    금: '목',
    수: '화',
  };

  return overcomeMap[from] === to;
}

/**
 * 십성 의미 설명 (참고용)
 */
export const TEN_STARS_MEANINGS = {
  비견: '자신과 같은 성질. 형제, 친구, 동료',
  겁재: '자신과 비슷하지만 경쟁 관계. 라이벌',
  식신: '자신이 낳는 양의 기운. 표현력, 재능',
  상관: '자신이 낳는 음의 기운. 창의성, 예술',
  편재: '자신이 극하는 같은 성질. 유동적 재물',
  정재: '자신이 극하는 다른 성질. 안정적 재물',
  편관: '자신을 극하는 같은 성질. 권력, 압박',
  정관: '자신을 극하는 다른 성질. 명예, 지위',
  편인: '자신을 생하는 같은 성질. 비전통적 학습',
  정인: '자신을 생하는 다른 성질. 전통적 학습, 모성',
} as const;
