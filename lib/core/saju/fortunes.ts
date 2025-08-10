/**
 * 운세 계산 모듈
 */

import { SIXTY_GAPJA, getStemIndex, getGroundIndex } from './constants';
import type { FourPillars, FortuneInfo } from '../../shared/types/saju';

/**
 * 운세 정보 계산
 */
export function calculateFortunes(pillars: FourPillars, targetYear?: number): FortuneInfo {
  const currentYear = targetYear || new Date().getFullYear();

  // 간단한 운세 정보 구조 (추후 확장)
  return {
    currentAge: calculateAge(1995, currentYear), // 임시로 1995년 기준
    bigFortune: {
      current: calculateCurrentBigFortune(pillars, currentYear),
      next: calculateNextBigFortune(pillars, currentYear),
    },
    yearFortune: calculateYearFortune(currentYear),
  };
}

/**
 * 나이 계산
 */
export function calculateAge(birthYear: number, currentYear: number): number {
  return currentYear - birthYear + 1; // 한국식 나이
}

/**
 * 현재 대운 계산
 */
export function calculateCurrentBigFortune(pillars: FourPillars, currentYear: number): any {
  // 대운은 월주에서 시작하여 순행 또는 역행
  // 간단한 구현 (추후 정확한 공식으로 교체)

  const monthSkyIndex = getStemIndex(pillars.month.sky);
  const monthGroundIndex = getGroundIndex(pillars.month.ground);

  // 10년 단위 대운 계산 (임시)
  const age = calculateAge(1995, currentYear);
  const fortuneNumber = Math.floor((age - 1) / 10);

  // 순행/역행 결정 (성별과 년도의 음양에 따라)
  const isForward = true; // 임시로 순행

  const offset = isForward ? fortuneNumber : -fortuneNumber;
  const newSkyIndex = (monthSkyIndex + offset) % 10;
  const newGroundIndex = (monthGroundIndex + offset) % 12;

  return {
    number: fortuneNumber,
    sky: {
      chinese: pillars.month.sky, // 임시
      korean: getKoreanSky(pillars.month.sky),
      fiveElement: getSkyElement(pillars.month.sky),
      yangYin: getSkyYangYin(pillars.month.sky),
    },
    ground: {
      chinese: pillars.month.ground, // 임시
      korean: getKoreanGround(pillars.month.ground),
      fiveElement: getGroundElement(pillars.month.ground),
      yangYin: getGroundYangYin(pillars.month.ground),
    },
  };
}

/**
 * 다음 대운 계산
 */
export function calculateNextBigFortune(pillars: FourPillars, currentYear: number): any {
  const current = calculateCurrentBigFortune(pillars, currentYear);

  // 다음 대운은 현재 대운에서 1단계 진행
  return {
    ...current,
    number: current.number + 1,
  };
}

/**
 * 년운 계산
 */
export function calculateYearFortune(year: number): any {
  // 해당 년도의 간지 계산
  const baseYear = 1924; // 갑자년
  const yearOffset = (year - baseYear) % 60;
  const gapjaIndex = yearOffset < 0 ? yearOffset + 60 : yearOffset;
  const gapja = SIXTY_GAPJA[gapjaIndex];

  return {
    year,
    sky: {
      chinese: gapja[0],
      korean: getKoreanSky(gapja[0]),
      fiveElement: getSkyElement(gapja[0]),
    },
    ground: {
      chinese: gapja[1],
      korean: getKoreanGround(gapja[1]),
      fiveElement: getGroundElement(gapja[1]),
    },
  };
}

/**
 * 대운 순행/역행 판단
 */
export function determineBigFortuneDirection(
  gender: string,
  birthYear: number
): 'forward' | 'backward' {
  const isYangYear = birthYear % 2 === 0; // 짝수년은 양년
  const isMale = gender === '남성';

  // 남성: 양년생은 순행, 음년생은 역행
  // 여성: 음년생은 순행, 양년생은 역행
  if (isMale) {
    return isYangYear ? 'forward' : 'backward';
  } else {
    return isYangYear ? 'backward' : 'forward';
  }
}

/**
 * 대운 시작 나이 계산
 */
export function calculateBigFortuneStartAge(
  pillars: FourPillars,
  gender: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number
): number {
  // 복잡한 계산이 필요하므로 간단화
  // 실제로는 출생일로부터 다음 절기까지의 일수를 계산

  const direction = determineBigFortuneDirection(gender, birthYear);

  // 기본적으로 3-10세 사이에서 시작 (간단한 근사치)
  const baseAge = 5; // 평균 시작 나이
  const monthOffset = direction === 'forward' ? birthMonth * 0.1 : (12 - birthMonth) * 0.1;

  return Math.round(baseAge + monthOffset);
}

/**
 * 특정 나이의 대운 계산
 */
export function getBigFortuneAtAge(
  pillars: FourPillars,
  gender: string,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  targetAge: number
): any {
  const startAge = calculateBigFortuneStartAge(pillars, gender, birthYear, birthMonth, birthDay);
  const fortuneAge = targetAge - startAge;
  const fortuneNumber = Math.max(0, Math.floor(fortuneAge / 10));

  const direction = determineBigFortuneDirection(gender, birthYear);
  const monthSkyIndex = getStemIndex(pillars.month.sky);
  const monthGroundIndex = getGroundIndex(pillars.month.ground);

  const offset = direction === 'forward' ? fortuneNumber : -fortuneNumber;
  const skyIndex = (monthSkyIndex + offset + 10) % 10;
  const groundIndex = (monthGroundIndex + offset + 12) % 12;

  const skyChinese = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][skyIndex];
  const groundChinese = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][
    groundIndex
  ];

  return {
    number: fortuneNumber + 1,
    startAge: startAge + fortuneNumber * 10,
    endAge: startAge + (fortuneNumber + 1) * 10 - 1,
    sky: {
      chinese: skyChinese,
      korean: getKoreanSky(skyChinese),
      fiveElement: getSkyElement(skyChinese),
      yangYin: getSkyYangYin(skyChinese),
    },
    ground: {
      chinese: groundChinese,
      korean: getKoreanGround(groundChinese),
      fiveElement: getGroundElement(groundChinese),
      yangYin: getGroundYangYin(groundChinese),
    },
  };
}

/**
 * 년운과 월운 분석
 */
export function analyzeYearlyFortune(
  year: number,
  month?: number
): {
  yearFortune: any;
  monthFortune?: any;
  analysis: string;
} {
  const yearFortune = calculateYearFortune(year);
  let monthFortune;

  if (month) {
    // 월운 계산 (년간을 기준으로)
    const yearSkyIndex = getStemIndex(yearFortune.sky.chinese);
    const monthSkyIndex = (yearSkyIndex * 2 + month - 1) % 10; // 간단한 공식
    const monthGroundIndex = (month + 1) % 12; // 인월부터 시작

    const monthSkyChinese = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][
      monthSkyIndex
    ];
    const monthGroundChinese = [
      '寅',
      '卯',
      '辰',
      '巳',
      '午',
      '未',
      '申',
      '酉',
      '戌',
      '亥',
      '子',
      '丑',
    ][monthGroundIndex];

    monthFortune = {
      month,
      sky: {
        chinese: monthSkyChinese,
        korean: getKoreanSky(monthSkyChinese),
        fiveElement: getSkyElement(monthSkyChinese),
      },
      ground: {
        chinese: monthGroundChinese,
        korean: getKoreanGround(monthGroundChinese),
        fiveElement: getGroundElement(monthGroundChinese),
      },
    };
  }

  const analysis = `${year}년은 ${yearFortune.sky.korean}${yearFortune.ground.korean}년입니다.`;

  return { yearFortune, monthFortune, analysis };
}

// 헬퍼 함수들
export function getKoreanSky(chinese: string): string {
  const map: { [key: string]: string } = {
    甲: '갑',
    乙: '을',
    丙: '병',
    丁: '정',
    戊: '무',
    己: '기',
    庚: '경',
    辛: '신',
    壬: '임',
    癸: '계',
  };
  return map[chinese] || chinese;
}

export function getKoreanGround(chinese: string): string {
  const map: { [key: string]: string } = {
    子: '자',
    丑: '축',
    寅: '인',
    卯: '묘',
    辰: '진',
    巳: '사',
    午: '오',
    未: '미',
    申: '신',
    酉: '유',
    戌: '술',
    亥: '해',
  };
  return map[chinese] || chinese;
}

export function getSkyElement(chinese: string): string {
  const map: { [key: string]: string } = {
    甲: '목',
    乙: '목',
    丙: '화',
    丁: '화',
    戊: '토',
    己: '토',
    庚: '금',
    辛: '금',
    壬: '수',
    癸: '수',
  };
  return map[chinese] || '';
}

export function getGroundElement(chinese: string): string {
  const map: { [key: string]: string } = {
    子: '수',
    丑: '토',
    寅: '목',
    卯: '목',
    辰: '토',
    巳: '화',
    午: '화',
    未: '토',
    申: '금',
    酉: '금',
    戌: '토',
    亥: '수',
  };
  return map[chinese] || '';
}

export function getSkyYangYin(chinese: string): string {
  const map: { [key: string]: string } = {
    甲: '양',
    乙: '음',
    丙: '양',
    丁: '음',
    戊: '양',
    己: '음',
    庚: '양',
    辛: '음',
    壬: '양',
    癸: '음',
  };
  return map[chinese] || '';
}

export function getGroundYangYin(chinese: string): string {
  const map: { [key: string]: string } = {
    子: '양',
    丑: '음',
    寅: '양',
    卯: '음',
    辰: '양',
    巳: '음',
    午: '양',
    未: '음',
    申: '양',
    酉: '음',
    戌: '양',
    亥: '음',
  };
  return map[chinese] || '';
}

/**
 * 클래스 형태 호환성을 위한 래퍼 (기존 코드 호환성)
 */
export class SajuFortunesCalculator {
  static calculate(pillars: FourPillars, targetYear?: number): FortuneInfo {
    return calculateFortunes(pillars, targetYear);
  }
}

/**
 * 대운의 의미 (참고용)
 */
export const BIG_FORTUNE_MEANINGS = {
  description: '10년 단위로 변화하는 인생의 큰 흐름',
  calculation: '월주를 기준으로 성별과 년도의 음양에 따라 순행 또는 역행',
  influence: '전반적인 운세의 방향성과 인생의 변화 시기를 나타냄',
} as const;
