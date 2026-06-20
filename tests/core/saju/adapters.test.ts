/**
 * 사주 어댑터 모듈 테스트
 * 어댑터 형식 변환(Simple/FetchSaju/UI) 구조 검증
 */

import { toSimpleFormat, toFetchSajuFormat, toUiFormat } from '@/lib/core/saju/adapters';
import { TopThreeSinsals } from '@/lib/shared/types/saju';
import allSolarTerms from '@/data/solar_terms.json';

const solarTermsData: Record<
  string,
  Record<string, { month: number; day: number; hour: number; minute: number }>
> = allSolarTerms;

const solarTermsArray = Object.entries(solarTermsData).flatMap(([year, terms]) =>
  Object.entries(terms).map(([term_name, details]) => ({
    id: 0,
    year: parseInt(year),
    term_name,
    ...details,
  }))
);

jest.mock('@/lib/infra/db/queries', () => ({
  getSolarTermsByYear: jest.fn(async (year: number) => {
    return solarTermsArray.filter((term) => term.year === year);
  }),
  getSolarTermByYearAndName: jest.fn(async (year: number, name: string) => {
    return solarTermsArray.find((term) => term.year === year && term.term_name === name) || null;
  }),
}));

describe('SajuAdapters', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 어댑터 테스트', () => {
    // 테스트용 샘플 데이터
    const sampleData = {
      basic: {
        name: '홍길동',
        gender: '남성' as const,
        year: '1995',
        month: '4',
        day: '25',
        hour: '8',
        minute: '0',
        calendar: 'solar' as const,
      },
      pillars: {
        year: { sky: '乙', ground: '亥' },
        month: { sky: '辛', ground: '巳' },
        day: { sky: '乙', ground: '卯' },
        time: { sky: '庚', ground: '辰' },
      },
      tenStars: {
        yearSky: '비견',
        yearGround: '편인',
        monthSky: '편관',
        monthGround: '정재',
        daySky: '비견',
        dayGround: '비견',
        timeSky: '정관',
        timeGround: '정재',
      },
      elements: {
        wood: 3,
        fire: 1,
        earth: 1,
        metal: 2,
        water: 1,
      },
      fortune: {
        currentAge: 30,
        bigFortune: {
          current: {
            number: 2,
            stem: { chinese: '辛', korean: '신', fiveElement: '금', yangYin: '음' },
            branch: { chinese: '巳', korean: '사', fiveElement: '화', yangYin: '음' },
          },
          next: {
            number: 3,
            stem: { chinese: '임', korean: '임', fiveElement: '수', yangYin: '양' },
            branch: { chinese: '오', korean: '오', fiveElement: '화', yangYin: '양' },
          },
        },
        yearFortune: {
          year: 2025,
          stem: { chinese: '乙', korean: '을', fiveElement: '목' },
          branch: { chinese: '巳', korean: '사', fiveElement: '화' },
        },
      },
      sinsals: ['역마살', '화개살', '천을귀인'] as TopThreeSinsals,
    };

    describe('Simple 어댑터 테스트', () => {
      test('구조 검증', () => {
        const result = toSimpleFormat(sampleData);

        // 기본 구조 검증
        expect(result).toHaveProperty('basic');
        expect(result).toHaveProperty('pillars');
        expect(result).toHaveProperty('tenStars');
        expect(result).toHaveProperty('elements');
        expect(result).toHaveProperty('fortune');
        expect(result).toHaveProperty('sinsals');

        // 데이터 무결성 확인
        expect(result.basic.name).toBe('홍길동');
        expect(result.pillars.year.sky).toBe('乙');
        expect(result.elements.wood).toBe(3);
        expect(result.sinsals[0]).toBe('역마살');

        console.log('✅ Simple 어댑터 구조 검증 통과');
      });
    });

    describe('FetchSaju 호환 어댑터 테스트', () => {
      test('구조 검증', () => {
        const result = toFetchSajuFormat(sampleData);

        // fetchSaju 형식 구조 검증
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('gender');
        expect(result).toHaveProperty('birth');
        expect(result).toHaveProperty('saju');
        expect(result).toHaveProperty('tenStars');
        expect(result).toHaveProperty('elements');
        expect(result).toHaveProperty('sinsals');
        expect(result).toHaveProperty('fortune');

        // 데이터 일관성 확인
        expect(result.name).toBe('홍길동');
        expect(result.gender).toBe('남성');

        console.log('✅ FetchSaju 어댑터 구조 검증 통과');
      });
    });

    describe('UI 최적화 어댑터 테스트', () => {
      test('구조 검증', () => {
        const result = toUiFormat(sampleData);

        // UI 최적화 구조 검증
        expect(result).toHaveProperty('displayName');
        expect(result).toHaveProperty('pillarsDisplay');
        expect(result).toHaveProperty('elementsChart');

        console.log('✅ UI 어댑터 구조 검증 통과');
      });
    });
  });
});
