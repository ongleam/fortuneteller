import { getFourPillars } from '@/lib/core/saju/four-pillars';
import { BirthInput } from '@/lib/shared/types/saju';
import Testset from '@/data/saju-testset.json';
import allSolarTerms from '@/data/solar_terms.json';

// 테스트 데이터 타입 정의
type TestCase = {
  input: any;
  description: string;
  referenceData: any;
};

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

describe('사주 팔자 계산 테스트', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test.each(Testset as TestCase[])(
    '$description - 사주 팔자 계산',
    async ({ input, description, referenceData }) => {
      // Reference 데이터에서 정답 추출
      const sajuData = referenceData.saju?.fortuneList?.saju;
      if (!sajuData) {
        throw new Error(`Reference 데이터에서 사주 정보를 찾을 수 없습니다: ${description}`);
      }

      const expected = {
        year: {
          sky: sajuData.yearSky?.chinese || '甲',
          ground: sajuData.yearGround?.chinese || '子',
        },
        month: {
          sky: sajuData.monthSky?.chinese || '甲',
          ground: sajuData.monthGround?.chinese || '子',
        },
        day: {
          sky: sajuData.daySky?.chinese || '甲',
          ground: sajuData.dayGround?.chinese || '子',
        },
        time: {
          sky: sajuData.timeSky?.chinese || '甲',
          ground: sajuData.timeGround?.chinese || '子',
        },
      };

      // 로컬 계산 결과와 Reference 정답 비교
      const localResult = await getFourPillars(input as BirthInput);
      expect(localResult).toEqual(expected);
    },
    30000
  );
});
