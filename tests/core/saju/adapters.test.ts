/**
 * 사주 어댑터 모듈 테스트
 * Reference API 데이터와 비교하여 정확성 검증
 */

import { toSimpleFormat, toFetchSajuFormat, toUiFormat } from '@/lib/core/saju/adapters';
import { getSajuPillarsReference } from '@/lib/core/saju/pillars';
import { getFiveElementsReference } from '@/lib/core/saju/five-elements';
import { TopThreeSinsals } from '@/lib/shared/types/saju';
import fs from 'fs';
import path from 'path';

// Reference 데이터 로드
let referenceData: any[] = [];
try {
  const dataPath = path.join(__dirname, '../../fixtures/data/reference-data.json');
  if (fs.existsSync(dataPath)) {
    referenceData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      .filter((data: any) => data.reference !== null)
      .slice(0, 3); // 처음 3개 케이스만 사용
  }
} catch (error) {
  console.warn('Reference 데이터 로드 실패:', error);
}

describe('SajuAdapters', () => {
  describe('Reference API 데이터와의 정확성 비교', () => {
    if (referenceData.length === 0) {
      test.skip('Reference 데이터가 없어 테스트를 건너뜁니다', () => {});
      return;
    }

    referenceData.forEach((testData, index) => {
      test(`케이스 ${index + 1}: ${testData.input.name} - Reference 어댑터 비교`, async () => {
        const birthInput = {
          name: testData.input.name,
          gender: testData.input.gender,
          calendar: testData.input.birthType === 'solar' ? '양력' : '음력',
          year: testData.input.birthYear,
          month: testData.input.birthMonth,
          day: testData.input.birthDay,
          hour: testData.input.birthTime,
        };

        // Reference API를 통해 정확한 데이터 수집
        const pillars = await getSajuPillarsReference(birthInput);
        const elements = await getFiveElementsReference(birthInput);

        const mockData = {
          basic: birthInput,
          pillars,
          elements,
          tenStars: {
            yearStem: '비견',
            yearBranch: '편인',
            monthStem: '편관',
            monthBranch: '정재',
            dayStem: '비견',
            dayBranch: '비견',
            timeStem: '정관',
            timeBranch: '정재',
          },
          fortune: {
            currentAge: 30,
            bigFortune: {
              current: {
                number: 1,
                stem: { chinese: '甲', korean: '갑', fiveElement: '목', yangYin: '양' },
                branch: { chinese: '子', korean: '자', fiveElement: '수', yangYin: '양' },
              },
              next: {
                number: 2,
                stem: { chinese: '乙', korean: '을', fiveElement: '목', yangYin: '음' },
                branch: { chinese: '丑', korean: '축', fiveElement: '토', yangYin: '음' },
              },
            },
            yearFortune: {
              year: 2025,
              stem: { chinese: '乙', korean: '을', fiveElement: '목' },
              branch: { chinese: '巳', korean: '사', fiveElement: '화' },
            },
          },
          sinsals: testData.reference.sinsals.slice(0, 3) as TopThreeSinsals,
        };

        console.log(`\n🔍 케이스 ${index + 1}: ${testData.input.name}`);

        // Simple 형식 변환 테스트
        const simpleResult = toSimpleFormat(mockData);
        expect(simpleResult).toHaveProperty('basic');
        expect(simpleResult).toHaveProperty('pillars');
        expect(simpleResult).toHaveProperty('elements');
        expect(simpleResult.basic.name).toBe(testData.input.name);
        expect(simpleResult.pillars.year.stem).toBe(testData.reference.saju.year.stem.chinese);

        // FetchSaju 호환 형식 변환 테스트
        const fetchSajuResult = toFetchSajuFormat(mockData);
        expect(fetchSajuResult).toHaveProperty('name');
        expect(fetchSajuResult).toHaveProperty('saju');
        expect(fetchSajuResult).toHaveProperty('elements');
        expect(fetchSajuResult.name).toBe(testData.input.name);

        // UI 형식 변환 테스트
        const uiResult = toUiFormat(mockData);
        expect(uiResult).toHaveProperty('summary');
        expect(uiResult).toHaveProperty('pillarsDisplay');

        console.log(`✅ 모든 어댑터 형식이 올바른 구조를 가집니다!`);
      }, 30000); // 30초 타임아웃
    });
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
        calendar: 'solar' as const,
      },
      pillars: {
        year: { stem: '乙', branch: '亥' },
        month: { stem: '辛', branch: '巳' },
        day: { stem: '乙', branch: '卯' },
        time: { stem: '庚', branch: '辰' },
      },
      tenStars: {
        yearStem: '비견',
        yearBranch: '편인',
        monthStem: '편관',
        monthBranch: '정재',
        dayStem: '비견',
        dayBranch: '비견',
        timeStem: '정관',
        timeBranch: '정재',
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
        expect(result.pillars.year.stem).toBe('乙');
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
