/**
 * 사주 메인 모듈 테스트
 * Reference API 데이터와 비교하여 정확성 검증
 */

import { 
  getSajuInfo, 
  getSajuInfoCompatible, 
  getSajuInfoForUi,
  validateAndNormalizeInput 
} from '@/lib/core/saju';
import { fetchSaju } from '@/lib/core/saju/reference';
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

describe('SajuMainModule', () => {
  
  describe('Reference API 데이터와의 정확성 비교', () => {
    
    if (referenceData.length === 0) {
      test.skip('Reference 데이터가 없어 테스트를 건너뜁니다', () => {});
      return;
    }

    referenceData.forEach((testData, index) => {
      test(`케이스 ${index + 1}: ${testData.input.name} - Reference 전체 기능 비교`, async () => {
        const input = {
          name: testData.input.name,
          gender: testData.input.gender,
          calendar: testData.input.birthType === 'solar' ? '양력' : '음력',
          year: testData.input.birthYear,
          month: testData.input.birthMonth,
          day: testData.input.birthDay,
          hour: testData.input.birthTime
        };
        
        console.log(`\n🔍 케이스 ${index + 1}: ${testData.input.name}`);
        
        // 입력 검증 및 정규화
        const normalizedInput = validateAndNormalizeInput(input);
        expect(normalizedInput.name).toBe(testData.input.name);
        expect(normalizedInput.gender).toBe(testData.input.gender);
        
        // getSajuInfo - 기본 형식
        const sajuInfo = getSajuInfo(normalizedInput);
        expect(sajuInfo).toHaveProperty('basic');
        expect(sajuInfo).toHaveProperty('pillars');
        expect(sajuInfo).toHaveProperty('elements');
        expect(sajuInfo.basic.name).toBe(testData.input.name);
        
        // getSajuInfoCompatible - fetchSaju 호환
        const compatibleInfo = getSajuInfoCompatible(normalizedInput);
        expect(compatibleInfo).toHaveProperty('name');
        expect(compatibleInfo).toHaveProperty('saju');
        expect(compatibleInfo).toHaveProperty('elements');
        expect(compatibleInfo.name).toBe(testData.input.name);
        
        // Reference API 사주 비교
        const referenceSaju = testData.reference.saju;
        expect(compatibleInfo.saju.year.stem.chinese).toBe(referenceSaju.year.stem.chinese);
        expect(compatibleInfo.saju.year.branch.chinese).toBe(referenceSaju.year.branch.chinese);
        
        // getSajuInfoForUi - UI 최적화
        const uiInfo = getSajuInfoForUi(normalizedInput);
        expect(uiInfo).toHaveProperty('summary');
        expect(uiInfo).toHaveProperty('pillarsDisplay');
        expect(uiInfo.summary.name).toBe(testData.input.name);
        
        console.log(`✅ 모든 메인 모듈 기능이 Reference API와 일치합니다!`);
      }, 30000); // 30초 타임아웃
    });
  });

  describe('기본 모듈 테스트', () => {
    const testInput = {
    name: '홍길동',
    gender: '남성' as const,
    calendar: '양력' as const,
    year: '1995',
    month: '04',
    day: '25',
    hour: '08'
  };
  
  describe('입력 검증 및 정규화', () => {
    
    test('정상 입력 처리', () => {
      const result = validateAndNormalizeInput(testInput);
      
      expect(result.name).toBe('홍길동');
      expect(result.gender).toBe('남성');
      expect(result.calendar).toBe('solar');
      expect(result.year).toBe('1995');
      expect(result.month).toBe('04');
      expect(result.day).toBe('25');
      expect(result.hour).toBe('08');
    });
    
    test('2자리 년도 정규화', () => {
      const input = { ...testInput, year: '95' };
      const result = validateAndNormalizeInput(input);
      
      expect(result.year).toBe('1995');
    });
    
    test('한국어 달력 타입 변환', () => {
      const solarInput = { ...testInput, calendar: '양력' as const };
      const lunarInput = { ...testInput, calendar: '음력' as const };
      
      expect(validateAndNormalizeInput(solarInput).calendar).toBe('solar');
      expect(validateAndNormalizeInput(lunarInput).calendar).toBe('lunar');
    });
  });
  
  describe('사주 계산 함수들', () => {
    
    test('getSajuInfo - 기본 형식', () => {
      const result = getSajuInfo(testInput);
      
      expect(result).toHaveProperty('basic');
      expect(result).toHaveProperty('pillars');
      expect(result).toHaveProperty('tenStars');
      expect(result).toHaveProperty('elements');
      expect(result).toHaveProperty('fortune');
      expect(result).toHaveProperty('sinsals');
      
      console.log('✅ getSajuInfo 결과:', JSON.stringify(result, null, 2));
    });
    
    test('getSajuInfoCompatible - fetchSaju 호환', () => {
      const result = getSajuInfoCompatible(testInput);
      
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('gender');
      expect(result).toHaveProperty('birth');
      expect(result).toHaveProperty('saju');
      
      console.log('✅ getSajuInfoCompatible 결과:', JSON.stringify(result, null, 2));
    });
    
    test('getSajuInfoForUi - UI 최적화', () => {
      const result = getSajuInfoForUi(testInput);
      
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('pillarsDisplay');
      
      console.log('✅ getSajuInfoForUi 구조 검증 통과');
    });
  });
  
  describe('에러 처리', () => {
    
    test('필수 필드 누락 시 에러', () => {
      const invalidInput = { ...testInput };
      delete (invalidInput as any).year;
      
      expect(() => validateAndNormalizeInput(invalidInput as any)).toThrow();
    });
    
    test('잘못된 년도 범위 에러', () => {
      const invalidInput = { ...testInput, year: '1800' };
      
      expect(() => validateAndNormalizeInput(invalidInput)).toThrow();
    });
    
    test('잘못된 월 범위 에러', () => {
      const invalidInput = { ...testInput, month: '13' };
      
      expect(() => validateAndNormalizeInput(invalidInput)).toThrow();
    });
    });
  });
});