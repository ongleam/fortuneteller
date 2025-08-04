/**
 * 사주 출력 어댑터 모듈
 * 다양한 출력 형식을 지원하기 위한 어댑터 패턴 구현
 */

import type {
  SimplifiedSajuOutput,
  FetchSajuCompatibleOutput,
  UiOptimizedSajuOutput,
  SajuPillars,
  PillarsTenStar,
  FiveElements,
  FortuneInfo,
  TopThreeSinsals,
  BirthInput,
} from '../../shared/types/saju';

/**
 * 단순화된 출력 형식 변환
 */
export function toSimpleFormat(data: {
  basic: BirthInput;
  pillars: SajuPillars;
  tenStars: PillarsTenStar;
  elements: FiveElements;
  fortune: FortuneInfo;
  sinsals: TopThreeSinsals;
}): SimplifiedSajuOutput {
  return {
    basic: data.basic,
    pillars: data.pillars,
    tenStars: data.tenStars,
    elements: data.elements,
    fortune: data.fortune,
    sinsals: data.sinsals,
  };
}

/**
 * fetchSaju 호환 출력 형식 변환
 */
export function toFetchSajuFormat(data: {
  basic: BirthInput;
  pillars: SajuPillars;
  tenStars: PillarsTenStar;
  elements: FiveElements;
  fortune: FortuneInfo;
  sinsals: TopThreeSinsals;
}): FetchSajuCompatibleOutput {
  // fetchSaju와 동일한 복잡한 구조로 변환
  return {
    // 기본 정보
    name: data.basic.name || '',
    gender: data.basic.gender,
    birth: {
      type: data.basic.calendar,
      year: data.basic.year,
      month: data.basic.month,
      day: data.basic.day,
      hour: data.basic.hour,
    },

    // 사주 팔자 (fetchSaju 스타일)
    saju: {
      year: {
        stem: {
          korean: getKoreanStem(data.pillars.year.stem),
          chinese: data.pillars.year.stem,
          element: getStemElement(data.pillars.year.stem),
          yangyin: getStemYangYin(data.pillars.year.stem),
        },
        branch: {
          korean: getKoreanBranch(data.pillars.year.branch),
          chinese: data.pillars.year.branch,
          element: getBranchElement(data.pillars.year.branch),
          yangyin: getBranchYangYin(data.pillars.year.branch),
        },
      },
      month: {
        stem: {
          korean: getKoreanStem(data.pillars.month.stem),
          chinese: data.pillars.month.stem,
          element: getStemElement(data.pillars.month.stem),
          yangyin: getStemYangYin(data.pillars.month.stem),
        },
        branch: {
          korean: getKoreanBranch(data.pillars.month.branch),
          chinese: data.pillars.month.branch,
          element: getBranchElement(data.pillars.month.branch),
          yangyin: getBranchYangYin(data.pillars.month.branch),
        },
      },
      day: {
        stem: {
          korean: getKoreanStem(data.pillars.day.stem),
          chinese: data.pillars.day.stem,
          element: getStemElement(data.pillars.day.stem),
          yangyin: getStemYangYin(data.pillars.day.stem),
        },
        branch: {
          korean: getKoreanBranch(data.pillars.day.branch),
          chinese: data.pillars.day.branch,
          element: getBranchElement(data.pillars.day.branch),
          yangyin: getBranchYangYin(data.pillars.day.branch),
        },
      },
      time: {
        stem: {
          korean: getKoreanStem(data.pillars.time.stem),
          chinese: data.pillars.time.stem,
          element: getStemElement(data.pillars.time.stem),
          yangyin: getStemYangYin(data.pillars.time.stem),
        },
        branch: {
          korean: getKoreanBranch(data.pillars.time.branch),
          chinese: data.pillars.time.branch,
          element: getBranchElement(data.pillars.time.branch),
          yangyin: getBranchYangYin(data.pillars.time.branch),
        },
      },
    },

    // 십성 (fetchSaju 형식)
    tenStars: {
      year: {
        korean: data.tenStars.yearStem,
        chinese: '', // 임시
        meaning: getTenStarMeaning(data.tenStars.yearStem),
      },
      month: {
        korean: data.tenStars.monthStem,
        chinese: '', // 임시
        meaning: getTenStarMeaning(data.tenStars.monthStem),
      },
      day: {
        korean: data.tenStars.dayStem,
        chinese: '', // 임시
        meaning: getTenStarMeaning(data.tenStars.dayStem),
      },
      time: {
        korean: data.tenStars.timeStem,
        chinese: '', // 임시
        meaning: getTenStarMeaning(data.tenStars.timeStem),
      },
    },

    // 오행 분석 (fetchSaju 형식)
    elements: {
      distribution: {
        wood: data.elements.wood,
        fire: data.elements.fire,
        earth: data.elements.earth,
        metal: data.elements.metal,
        water: data.elements.water,
      },
      analysis: {
        total:
          data.elements.wood +
          data.elements.fire +
          data.elements.earth +
          data.elements.metal +
          data.elements.water,
        strongest: findStrongestElement(data.elements),
        weakest: findWeakestElement(data.elements),
        balance: getElementBalance(data.elements),
      },
    },

    // 신살 (fetchSaju 형식)
    sinsals: [data.sinsals[0] || '', data.sinsals[1] || '', data.sinsals[2] || ''],

    // 운세 정보 (fetchSaju 형식)
    fortune: {
      currentAge: data.fortune.currentAge,
      bigFortune: {
        current: {
          number: data.fortune.bigFortune.current.number,
          period: `${data.fortune.bigFortune.current.number * 10 + 1}세~${(data.fortune.bigFortune.current.number + 1) * 10}세`,
          stem: data.fortune.bigFortune.current.stem,
          branch: data.fortune.bigFortune.current.branch,
        },
        next: {
          number: data.fortune.bigFortune.next.number,
          period: `${data.fortune.bigFortune.next.number * 10 + 1}세~${(data.fortune.bigFortune.next.number + 1) * 10}세`,
          stem: data.fortune.bigFortune.next.stem,
          branch: data.fortune.bigFortune.next.branch,
        },
      },
      yearFortune: data.fortune.yearFortune,
    },
  };
}

/**
 * UI 최적화 출력 형식 변환
 */
export function toUiFormat(data: {
  basic: BirthInput;
  pillars: SajuPillars;
  tenStars: PillarsTenStar;
  elements: FiveElements;
  fortune: FortuneInfo;
  sinsals: TopThreeSinsals;
}): UiOptimizedSajuOutput {
  return {
    // 사용자 표시용 요약 정보
    summary: {
      name: data.basic.name || '알 수 없음',
      birthInfo: `${data.basic.year}년 ${data.basic.month}월 ${data.basic.day}일 ${data.basic.hour}시`,
      calendar: data.basic.calendar === 'solar' ? '양력' : '음력',
      gender: data.basic.gender === '남성' ? '남' : '여',
      age: data.fortune.currentAge,
    },

    // 사주 팔자 (한글 표시)
    pillarsDisplay: {
      year: `${getKoreanStem(data.pillars.year.stem)}${getKoreanBranch(data.pillars.year.branch)}`,
      month: `${getKoreanStem(data.pillars.month.stem)}${getKoreanBranch(data.pillars.month.branch)}`,
      day: `${getKoreanStem(data.pillars.day.stem)}${getKoreanBranch(data.pillars.day.branch)}`,
      time: `${getKoreanStem(data.pillars.time.stem)}${getKoreanBranch(data.pillars.time.branch)}`,
    },

    // 십성 요약
    tenStarsDisplay: {
      year: data.tenStars.yearStem,
      month: data.tenStars.monthStem,
      day: data.tenStars.dayStem,
      time: data.tenStars.timeStem,
      summary: getTenStarsSummary(data.tenStars),
    },

    // 오행 차트용 데이터
    elementsChart: {
      labels: ['목', '화', '토', '금', '수'],
      values: [
        data.elements.wood,
        data.elements.fire,
        data.elements.earth,
        data.elements.metal,
        data.elements.water,
      ],
      colors: ['#28a745', '#dc3545', '#ffc107', '#6c757d', '#007bff'],
      total:
        data.elements.wood +
        data.elements.fire +
        data.elements.earth +
        data.elements.metal +
        data.elements.water,
    },

    // 신살 표시
    sinsalsDisplay: data.sinsals
      .filter((s) => s !== '')
      .map((sinsal) => ({
        name: sinsal,
        meaning: getSinsalMeaning(sinsal),
        type: getSinsalType(sinsal),
      })),

    // 운세 요약
    fortuneDisplay: {
      currentAge: data.fortune.currentAge,
      bigFortune: `${data.fortune.bigFortune.current.number}차 대운`,
      yearFortune: `${data.fortune.yearFortune.year}년`,
      summary: getFortuneSummary(data.fortune),
    },
  };
}

// 헬퍼 함수들
export function getKoreanStem(chinese: string): string {
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

export function getKoreanBranch(chinese: string): string {
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

export function getStemElement(chinese: string): string {
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

export function getBranchElement(chinese: string): string {
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

export function getStemYangYin(chinese: string): string {
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

export function getBranchYangYin(chinese: string): string {
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

export function getTenStarMeaning(korean: string): string {
  const meanings: { [key: string]: string } = {
    비견: '자아, 독립성, 경쟁심',
    겁재: '협력, 도전, 변화',
    식신: '표현력, 창의성, 여유',
    상관: '재능, 개성, 자유분방',
    편재: '활동적 재물, 사업',
    정재: '안정적 재물, 절약',
    편관: '도전, 변화, 권위',
    정관: '명예, 지위, 질서',
    편인: '직감, 학문, 종교',
    정인: '학습, 보호, 전통',
  };
  return meanings[korean] || korean;
}

export function findStrongestElement(elements: FiveElements): string {
  const elementMap = { wood: '목', fire: '화', earth: '토', metal: '금', water: '수' };
  let maxKey = 'wood';
  let maxValue = elements.wood;

  Object.entries(elements).forEach(([key, value]) => {
    if (value > maxValue) {
      maxValue = value;
      maxKey = key;
    }
  });

  return elementMap[maxKey as keyof typeof elementMap];
}

export function findWeakestElement(elements: FiveElements): string {
  const elementMap = { wood: '목', fire: '화', earth: '토', metal: '금', water: '수' };
  let minKey = 'wood';
  let minValue = elements.wood;

  Object.entries(elements).forEach(([key, value]) => {
    if (value < minValue) {
      minValue = value;
      minKey = key;
    }
  });

  return elementMap[minKey as keyof typeof elementMap];
}

export function getElementBalance(elements: FiveElements): string {
  const total = elements.wood + elements.fire + elements.earth + elements.metal + elements.water;
  const avg = total / 5;
  const variance =
    Object.values(elements).reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / 5;

  return variance < 1 ? 'balanced' : 'imbalanced';
}

export function getTenStarsSummary(tenStars: PillarsTenStar): string {
  const stars = [tenStars.yearStem, tenStars.monthStem, tenStars.dayStem, tenStars.timeStem];
  const uniqueStars = [...new Set(stars)];
  return `${uniqueStars.length}개 십성 (${uniqueStars.join(', ')})`;
}

export function getSinsalMeaning(sinsal: string): string {
  const meanings: { [key: string]: string } = {
    역마살: '이동, 변화, 활동성',
    화개살: '예술성, 종교성, 고독함',
    천을귀인: '귀인의 도움, 좋은 인연',
    도화살: '이성운, 인기, 매력',
    월살: '장애, 방해',
    겁살: '재물 손실, 도적',
    장성살: '성격의 강함, 고집',
    반안살: '불안정, 변동',
    육해살: '대인관계의 갈등',
    망신살: '체면 손상, 명예 실추',
  };
  return meanings[sinsal] || sinsal;
}

export function getSinsalType(sinsal: string): 'good' | 'bad' | 'neutral' {
  const goodSinsals = ['천을귀인', '도화살'];
  const badSinsals = ['월살', '겁살', '육해살', '망신살'];

  if (goodSinsals.includes(sinsal)) return 'good';
  if (badSinsals.includes(sinsal)) return 'bad';
  return 'neutral';
}

export function getFortuneSummary(fortune: FortuneInfo): string {
  return `현재 ${fortune.currentAge}세, ${fortune.bigFortune.current.number}차 대운 중`;
}

/**
 * 클래스 형태 호환성을 위한 래퍼 (기존 코드 호환성)
 */
export class SajuAdapters {
  static toSimple(data: {
    basic: BirthInput;
    pillars: SajuPillars;
    tenStars: PillarsTenStar;
    elements: FiveElements;
    fortune: FortuneInfo;
    sinsals: TopThreeSinsals;
  }): SimplifiedSajuOutput {
    return toSimpleFormat(data);
  }

  static toFetchSaju(data: {
    basic: BirthInput;
    pillars: SajuPillars;
    tenStars: PillarsTenStar;
    elements: FiveElements;
    fortune: FortuneInfo;
    sinsals: TopThreeSinsals;
  }): FetchSajuCompatibleOutput {
    return toFetchSajuFormat(data);
  }

  static toUi(data: {
    basic: BirthInput;
    pillars: SajuPillars;
    tenStars: PillarsTenStar;
    elements: FiveElements;
    fortune: FortuneInfo;
    sinsals: TopThreeSinsals;
  }): UiOptimizedSajuOutput {
    return toUiFormat(data);
  }
}
