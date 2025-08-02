/**
 * 사주 팔자 계산 모듈 테스트
 * Reference API 데이터와 비교하여 정확성 검증
 */

import { calculateSajuPillarsAccurate } from '@/lib/core/saju/pillars';
import { validateAndNormalizeInput } from '@/lib/core/saju';
import fs from 'fs';
import path from 'path';

// Reference 데이터 로드
let referenceData: any[] = [];
try {
  const dataPath = path.join(__dirname, '../../fixtures/data/reference-data.json');
  if (fs.existsSync(dataPath)) {
    referenceData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      .filter((data: any) => data.reference !== null)
      .slice(0, 5); // 처음 5개 케이스만 사용
  }
} catch (error) {
  console.warn('Reference 데이터 로드 실패:', error);
}

describe('SajuPillarsCalculator', () => {
  
  describe('Reference API 데이터와의 정확성 비교', () => {
    
    if (referenceData.length === 0) {
      test.skip('Reference 데이터가 없어 테스트를 건너뜁니다', () => {});
      return;
    }

    referenceData.forEach((testData, index) => {
      test(`케이스 ${index + 1}: ${testData.input.name} - Reference API와 비교`, async () => {
        const input = validateAndNormalizeInput({
          name: testData.input.name,
          gender: testData.input.gender,
          calendar: testData.input.birthType === 'solar' ? '양력' : '음력',
          year: testData.input.birthYear,
          month: testData.input.birthMonth,
          day: testData.input.birthDay,
          hour: testData.input.birthTime
        });

        const result = await calculateSajuPillarsAccurate(input);
        const reference = testData.reference.saju;
        
        console.log(`\n🔍 케이스 ${index + 1}: ${testData.input.name}`);
        console.log(`입력: ${testData.input.birthYear}-${testData.input.birthMonth}-${testData.input.birthDay} ${testData.input.birthTime}시 (${testData.input.birthType})`);
        console.log(`계산: ${result.year.stem}${result.year.branch} ${result.month.stem}${result.month.branch} ${result.day.stem}${result.day.branch} ${result.time.stem}${result.time.branch}`);
        console.log(`참조: ${reference.year.stem.chinese}${reference.year.branch.chinese} ${reference.month.stem.chinese}${reference.month.branch.chinese} ${reference.day.stem.chinese}${reference.day.branch.chinese} ${reference.time.stem.chinese}${reference.time.branch.chinese}`);
        
        // Reference API 데이터와 정확히 일치해야 함
        expect(result.year.stem).toBe(reference.year.stem.chinese);
        expect(result.year.branch).toBe(reference.year.branch.chinese);
        expect(result.month.stem).toBe(reference.month.stem.chinese);
        expect(result.month.branch).toBe(reference.month.branch.chinese);
        expect(result.day.stem).toBe(reference.day.stem.chinese);
        expect(result.day.branch).toBe(reference.day.branch.chinese);
        expect(result.time.stem).toBe(reference.time.stem.chinese);
        expect(result.time.branch).toBe(reference.time.branch.chinese);
        
        console.log(`✅ 모든 기둥이 Reference API와 일치합니다!`);
      }, 30000); // 30초 타임아웃
    });
  });

  describe('기본 기능 테스트', () => {
    
    test('결과 구조 검증', () => {
      const input = validateAndNormalizeInput({
        name: "테스트",
        gender: "남성",
        calendar: "양력",
        year: "2000",
        month: "01",
        day: "01",
        hour: "12"
      });

      const result = calculateSajuPillars(input);
      
      expect(result).toHaveProperty('year');
      expect(result).toHaveProperty('month');
      expect(result).toHaveProperty('day');
      expect(result).toHaveProperty('time');
      
      expect(result.year).toHaveProperty('stem');
      expect(result.year).toHaveProperty('branch');
      
      expect(typeof result.year.stem).toBe('string');
      expect(typeof result.year.branch).toBe('string');
      expect(result.year.stem).toHaveLength(1);
      expect(result.year.branch).toHaveLength(1);
    });

    test('유효한 천간지지 생성 확인', () => {
      const input = validateAndNormalizeInput({
        name: "테스트",
        gender: "여성",
        calendar: "음력",
        year: "1990",
        month: "06",
        day: "15",
        hour: "18"
      });

      const result = calculateSajuPillars(input);
      
      // 기본 유효성 검증
      expect(result.year.stem).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
      expect(result.year.branch).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
    });
  });
});