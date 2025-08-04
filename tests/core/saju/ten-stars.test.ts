import { getPillarsTenStar, getPillarsTenStarReference } from '@/lib/core/saju/ten-stars';
import { getSajuPillars } from '@/lib/core/saju/pillars';
import * as sajuReference from '@/lib/core/saju/reference';
import { BirthInput } from '@/lib/shared/types/saju';
import testCases from '@/data/ten_stars_testset.json';
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

describe('십성 계산 비교 테스트', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test.each(testCases)(
    '입력값 $input.year-$input.month-$input.day $input.hour 시, getPillarsTenStar와 getTenStarsForPillarsReference 결과 비교',
    async ({ input, expected }) => {
      const fetchSajuMock = jest.spyOn(sajuReference, 'fetchSaju').mockImplementation(async () => {
        return {
          saju: {
            fortuneList: {
              storedUnse: {
                manseYearSkyRelation: expected.yearStem,
                manseYearGroundRelation: expected.yearBranch,
                manseMonthSkyRelation: expected.monthStem,
                manseMonthGroundRelation: expected.monthBranch,
                manseDaySkyRelation: expected.dayStem,
                manseDayGroundRelation: expected.dayBranch,
                manseTimeSkyRelation: expected.timeStem,
                manseTimeGroundRelation: expected.timeBranch,
              },
            },
          },
          sinsals: {},
        };
      });

      // getPillarsTenStar 테스트
      const pillars = await getSajuPillars(input as BirthInput);
      const localResult = getPillarsTenStar(pillars);
      expect(localResult).toEqual(expected);

      // getTenStarsForPillarsReference 테스트
      const referenceResult = await getPillarsTenStarReference(input as BirthInput);
      expect(referenceResult).toEqual(expected);

      // 두 결과 비교
      expect(localResult).toEqual(referenceResult);

      fetchSajuMock.mockRestore();
    },
    30000
  );
});
