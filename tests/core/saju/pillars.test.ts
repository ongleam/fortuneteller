import { getSajuPillars, getSajuPillarsReference } from '@/lib/core/saju/pillars';
import * as sajuReference from '@/lib/core/saju/reference';
import { BirthInput } from '@/lib/shared/types/saju';
import testCases from '@/data/pillars_testset.json';
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

describe('사주 팔자 계산 비교 테스트', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 윤달이 아닌 케이스만 필터링
  const filteredTestCases = testCases.filter((tc) => !tc.input.isLeapMonth);

  test.each(filteredTestCases)(
    '입력값 $input.year-$input.month-$input.day $input.hour 시, getSajuPillars와 getSajuPillarsReference 결과 비교',
    async ({ input, expected }) => {
      const fetchSajuMock = jest.spyOn(sajuReference, 'fetchSaju').mockImplementation(async () => {
        return {
          saju: {
            fortuneList: {
              saju: {
                yearSky: { chinese: expected.year.sky },
                yearGround: { chinese: expected.year.ground },
                monthSky: { chinese: expected.month.sky },
                monthGround: { chinese: expected.month.ground },
                daySky: { chinese: expected.day.sky },
                dayGround: { chinese: expected.day.ground },
                timeSky: { chinese: expected.time.sky },
                timeGround: { chinese: expected.time.ground },
              },
            },
          },
          sinsals: {},
        };
      });

      // getSajuPillars 테스트
      const localResult = await getSajuPillars(input as BirthInput);
      expect(localResult).toEqual(expected);

      // getSajuPillarsReference 테스트
      const referenceResult = await getSajuPillarsReference(input as BirthInput);
      expect(referenceResult).toEqual(expected);

      // 두 결과 비교
      expect(localResult).toEqual(referenceResult);

      fetchSajuMock.mockRestore();
    },
    30000
  );
});
