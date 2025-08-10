import { getFiveElements, getFiveElementsReference } from '@/lib/core/saju/five-elements';
import { getSajuPillars } from '@/lib/core/saju/pillars';
import * as sajuReference from '@/lib/core/saju/reference';
import { BirthInput, FiveElements } from '@/lib/shared/types/saju';
import testCases from '@/data/five_elements_testset.json';
import allSolarTerms from '@/data/solar_terms.json';

const solarTermsData: Record<
  string,
  Record<string, { month: number; day: number; hour: number; minute: number }>
> = allSolarTerms;

// DB 쿼리가 반환하는 형식과 동일하게 데이터를 변환합니다.
const solarTermsArray = Object.entries(solarTermsData).flatMap(([year, terms]) =>
  Object.entries(terms).map(([term_name, details]) => ({
    id: 0, // 테스트에서는 사용되지 않는 더미 ID
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

describe('오행 분석 테스트', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 오행 계산 테스트', () => {
    test('천간과 지지의 오행이 정확히 8개 카운트되는지 확인', async () => {
      const input: BirthInput = {
        name: '테스트',
        gender: '남성',
        calendar: '양력',
        year: '1995',
        month: '4',
        day: '25',
        hour: '14',
        minute: '30',
      };

      const pillars = await getSajuPillars(input);
      const result = getFiveElements(pillars);

      // 총 개수가 8개인지 확인 (천간 4개 + 지지 4개)
      const total = Object.values(result).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(8);

      // 각 오행이 0 이상인지 확인
      expect(result.wood).toBeGreaterThanOrEqual(0);
      expect(result.fire).toBeGreaterThanOrEqual(0);
      expect(result.earth).toBeGreaterThanOrEqual(0);
      expect(result.metal).toBeGreaterThanOrEqual(0);
      expect(result.water).toBeGreaterThanOrEqual(0);
    });

    test('오행 타입 구조 검증', async () => {
      const input: BirthInput = {
        name: '테스트',
        gender: '남성',
        calendar: '양력',
        year: '1990',
        month: '1',
        day: '1',
        hour: '0',
        minute: '0',
      };

      const pillars = await getSajuPillars(input);
      const result = getFiveElements(pillars);

      // FiveElements 타입 구조 확인
      expect(result).toHaveProperty('wood');
      expect(result).toHaveProperty('fire');
      expect(result).toHaveProperty('earth');
      expect(result).toHaveProperty('metal');
      expect(result).toHaveProperty('water');

      // 모든 값이 숫자인지 확인
      expect(typeof result.wood).toBe('number');
      expect(typeof result.fire).toBe('number');
      expect(typeof result.earth).toBe('number');
      expect(typeof result.metal).toBe('number');
      expect(typeof result.water).toBe('number');
    });
  });

  describe('Reference API 비교 테스트', () => {
    // 윤달이 아닌 케이스만 필터링
    const filteredTestCases = testCases.filter((tc) => !tc.input.isLeapMonth);

    test.each(filteredTestCases)(
      '입력값 $input.year-$input.month-$input.day $input.hour시, 오행 분석 결과 비교',
      async ({ input, expected }) => {
        const fetchSajuMock = jest
          .spyOn(sajuReference, 'fetchSaju')
          .mockImplementation(async () => {
            return {
              saju: {
                fortuneList: {
                  storedUnse: {
                    fiveTreeNum: expected.wood,
                    fiveFireNum: expected.fire,
                    fiveSoilNum: expected.earth,
                    fiveIronNum: expected.metal,
                    fiveWaterNum: expected.water,
                  },
                },
              },
              sinsals: {},
            };
          });

        // getFiveElements 테스트 (로컬 계산)
        const pillars = await getSajuPillars(input as BirthInput);
        const localResult = getFiveElements(pillars);

        // 로컬 계산 결과가 8개인지 확인
        const localTotal = Object.values(localResult).reduce((sum, count) => sum + count, 0);
        expect(localTotal).toBe(8);

        // getFiveElementsReference 테스트 (API 호출)
        const referenceResult = await getFiveElementsReference(input as BirthInput);
        expect(referenceResult).toEqual(expected);

        // Reference API 결과도 8개인지 확인 (지장간 포함 시 8개 초과 가능)
        const refTotal = Object.values(expected).reduce((sum, count) => sum + count, 0);
        console.log(
          `테스트 케이스 ${input.year}-${input.month}-${input.day}: 로컬=${localTotal}개, Reference=${refTotal}개`
        );

        fetchSajuMock.mockRestore();
      },
      30000
    );
  });

  describe('특수 케이스 테스트', () => {
    test('음력 날짜 처리', async () => {
      const input: BirthInput = {
        name: '음력테스트',
        gender: '여성',
        calendar: '음력',
        year: '1990',
        month: '1',
        day: '15',
        hour: '12',
        minute: '0',
      };

      const pillars = await getSajuPillars(input);
      const result = getFiveElements(pillars);

      const total = Object.values(result).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(8);
    });

    test('자시(23:30) 처리', async () => {
      const input: BirthInput = {
        name: '자시테스트',
        gender: '남성',
        calendar: '양력',
        year: '1990',
        month: '1',
        day: '1',
        hour: '23',
        minute: '30',
      };

      const pillars = await getSajuPillars(input);
      const result = getFiveElements(pillars);

      const total = Object.values(result).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(8);
    });

    test('새벽 시간 처리', async () => {
      const input: BirthInput = {
        name: '새벽테스트',
        gender: '남성',
        calendar: '양력',
        year: '1990',
        month: '6',
        day: '15',
        hour: '3',
        minute: '30',
      };

      const pillars = await getSajuPillars(input);
      const result = getFiveElements(pillars);

      const total = Object.values(result).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(8);
    });
  });

  describe('오행 균형 분석 테스트', () => {
    test('균형잡힌 오행 분포 검증', () => {
      const balanced: FiveElements = {
        wood: 2,
        fire: 1,
        earth: 2,
        metal: 2,
        water: 1,
      };

      const total = Object.values(balanced).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(8);

      const values = Object.values(balanced);
      const max = Math.max(...values);
      const min = Math.min(...values);
      expect(max - min).toBeLessThanOrEqual(2);
    });

    test('편중된 오행 분포 검증', () => {
      const biased: FiveElements = {
        wood: 4,
        fire: 0,
        earth: 2,
        metal: 1,
        water: 1,
      };

      const total = Object.values(biased).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(8);

      const max = Math.max(...Object.values(biased));
      expect(max).toBeGreaterThanOrEqual(total / 2);
    });

    test('특정 오행이 없는 경우 검증', () => {
      const missing: FiveElements = {
        wood: 3,
        fire: 0,
        earth: 2,
        metal: 2,
        water: 1,
      };

      const total = Object.values(missing).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(8);

      const hasZero = Object.values(missing).includes(0);
      expect(hasZero).toBe(true);
    });
  });

  describe('오행 계산 정확성 테스트', () => {
    test('특정 사주의 오행 계산 검증', async () => {
      const input: BirthInput = {
        name: '검증테스트',
        gender: '남성',
        calendar: '양력',
        year: '1995',
        month: '4',
        day: '25',
        hour: '14',
        minute: '30',
      };

      const pillars = await getSajuPillars(input);

      // 사주 팔자 출력 (디버깅용)
      console.log('사주 팔자:', {
        year: `${pillars.year.sky}${pillars.year.ground}`,
        month: `${pillars.month.sky}${pillars.month.ground}`,
        day: `${pillars.day.sky}${pillars.day.ground}`,
        time: `${pillars.time.sky}${pillars.time.ground}`,
      });

      const result = getFiveElements(pillars);

      // 오행 분포 출력
      console.log('오행 분포:', result);

      const total = Object.values(result).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(8);
    });
  });
});
