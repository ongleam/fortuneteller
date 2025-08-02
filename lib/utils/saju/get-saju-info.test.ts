/**
 * getSajuInfo 메인 함수 테스트
 */

import { 
  GetSajuInfo, 
  getSajuInfo, 
  getSajuInfoCompatible, 
  getSajuInfoForUi, 
  getSajuInfoAll,
  MODULE_INFO 
} from './get-saju-info';
import type { BirthInput } from '../../types/saju';

describe('GetSajuInfo', () => {
  
  // 테스트용 샘플 데이터
  const sampleBirthInput: BirthInput = {
    name: '홍길동',
    gender: '남성',
    year: '1995',
    month: '4',
    day: '25',
    hour: '8',
    calendar: 'solar'
  };
  
  const sampleBirthInput2: BirthInput = {
    name: '김영희',
    gender: '여성',
    year: '88',
    month: '3',
    day: '15',
    hour: '14',
    calendar: 'lunar'
  };
  
  describe('메인 calculate 함수 테스트', () => {
    
    test('simple 형식 계산', () => {
      const result = GetSajuInfo.calculate(sampleBirthInput, {
        outputFormat: 'simple',
        targetYear: 2025
      });
      
      // 기본 구조 검증
      expect(result).toHaveProperty('basic');
      expect(result).toHaveProperty('pillars');
      expect(result).toHaveProperty('tenStars');
      expect(result).toHaveProperty('elements');
      expect(result).toHaveProperty('fortune');
      expect(result).toHaveProperty('sinsals');
      
      // 입력 데이터 정규화 확인
      expect(result.basic.year).toBe('1995');
      expect(result.basic.month).toBe('04');
      expect(result.basic.day).toBe('25');
      expect(result.basic.hour).toBe('08');
      
      console.log('✅ Simple 형식 계산 결과:', result);
    });
    
    test('fetchSaju 형식 계산', () => {
      const result = GetSajuInfo.calculate(sampleBirthInput, {
        outputFormat: 'fetchSaju',
        targetYear: 2025
      });
      
      // fetchSaju 호환 구조 검증
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('gender');
      expect(result).toHaveProperty('birth');
      expect(result).toHaveProperty('saju');
      expect(result).toHaveProperty('tenStars');
      expect(result).toHaveProperty('elements');
      expect(result).toHaveProperty('sinsals');
      expect(result).toHaveProperty('fortune');
      
      // fetchSaju 세부 구조 확인
      expect(result.saju.year.stem).toHaveProperty('korean');
      expect(result.saju.year.stem).toHaveProperty('chinese');
      expect(result.tenStars.year).toHaveProperty('meaning');
      expect(result.elements).toHaveProperty('distribution');
      expect(result.elements).toHaveProperty('analysis');
      
      console.log('✅ FetchSaju 형식 계산 결과:', result);
    });
    
    test('ui 형식 계산', () => {
      const result = GetSajuInfo.calculate(sampleBirthInput, {
        outputFormat: 'ui',
        targetYear: 2025
      });
      
      // UI 최적화 구조 검증
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('pillarsDisplay');
      expect(result).toHaveProperty('tenStarsDisplay');
      expect(result).toHaveProperty('elementsChart');
      expect(result).toHaveProperty('sinsalsDisplay');
      expect(result).toHaveProperty('fortuneDisplay');
      
      // UI 전용 데이터 확인
      expect(result.elementsChart).toHaveProperty('labels');
      expect(result.elementsChart).toHaveProperty('values');
      expect(result.elementsChart).toHaveProperty('colors');
      expect(result.sinsalsDisplay).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            meaning: expect.any(String),
            type: expect.stringMatching(/^(good|bad|neutral)$/)
          })
        ])
      );
      
      console.log('✅ UI 형식 계산 결과:', result);
    });
  });
  
  describe('편의 함수 테스트', () => {
    
    test('getSajuInfo 기본 함수', () => {
      const result = getSajuInfo(sampleBirthInput);
      
      expect(result).toHaveProperty('basic');
      expect(result).toHaveProperty('pillars');
      expect(result.basic.name).toBe('홍길동');
      
      console.log('✅ getSajuInfo 기본 함수 결과:', result.basic);
    });
    
    test('getSajuInfoCompatible 함수', () => {
      const result = getSajuInfoCompatible(sampleBirthInput);
      
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('saju');
      expect(result.name).toBe('홍길동');
      
      console.log('✅ getSajuInfoCompatible 함수 결과:', {
        name: result.name,
        birth: result.birth
      });
    });
    
    test('getSajuInfoForUi 함수', () => {
      const result = getSajuInfoForUi(sampleBirthInput);
      
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('elementsChart');
      expect(result.summary.name).toBe('홍길동');
      
      console.log('✅ getSajuInfoForUi 함수 결과:', result.summary);
    });
    
    test('getSajuInfoAll 함수', () => {
      const result = getSajuInfoAll(sampleBirthInput);
      
      expect(result).toHaveProperty('simple');
      expect(result).toHaveProperty('fetchSaju');
      expect(result).toHaveProperty('ui');
      
      // 모든 형식이 동일한 기본 데이터를 가지는지 확인
      expect(result.simple.basic.name).toBe('홍길동');
      expect(result.fetchSaju.name).toBe('홍길동');
      expect(result.ui.summary.name).toBe('홍길동');
      
      console.log('✅ getSajuInfoAll 함수 결과:', {
        simpleType: typeof result.simple,
        fetchSajuType: typeof result.fetchSaju,
        uiType: typeof result.ui
      });
    });
  });
  
  describe('입력 검증 및 정규화 테스트', () => {
    
    test('년도 정규화 (95 -> 1995)', () => {
      const result = getSajuInfo(sampleBirthInput2);
      
      expect(result.basic.year).toBe('1988');
      
      console.log('✅ 년도 정규화 결과:', result.basic.year);
    });
    
    test('날짜 패딩 (4 -> 04)', () => {
      const input: BirthInput = {
        gender: '남성',
        year: '2000',
        month: '1',
        day: '5',
        hour: '9',
        calendar: 'solar'
      };
      
      const result = getSajuInfo(input);
      
      expect(result.basic.month).toBe('01');
      expect(result.basic.day).toBe('05');
      expect(result.basic.hour).toBe('09');
      
      console.log('✅ 날짜 패딩 결과:', {
        month: result.basic.month,
        day: result.basic.day,
        hour: result.basic.hour
      });
    });
    
    test('기본값 설정 (성별, 달력타입)', () => {
      const input: BirthInput = {
        year: '2000',
        month: '1',
        day: '1',
        hour: '12'
        // gender, calendar 생략
      };
      
      const result = getSajuInfo(input);
      
      expect(result.basic.gender).toBe('남성');
      expect(result.basic.calendar).toBe('solar');
      
      console.log('✅ 기본값 설정 결과:', {
        gender: result.basic.gender,
        calendar: result.basic.calendar
      });
    });
  });
  
  describe('에러 처리 테스트', () => {
    
    test('필수 필드 누락 에러', () => {
      const invalidInput = {
        year: '1995',
        month: '4'
        // day, hour 누락
      } as BirthInput;
      
      expect(() => {
        getSajuInfo(invalidInput);
      }).toThrow('생년월일시 정보가 부족합니다');
    });
    
    test('년도 범위 에러', () => {
      const invalidInput: BirthInput = {
        gender: '남성',
        year: '1800', // 1900년 이전
        month: '4',
        day: '25',
        hour: '8',
        calendar: 'solar'
      };
      
      expect(() => {
        getSajuInfo(invalidInput);
      }).toThrow('년도가 유효하지 않습니다');
    });
    
    test('월 범위 에러', () => {
      const invalidInput: BirthInput = {
        gender: '남성',
        year: '1995',
        month: '13', // 12월 초과
        day: '25',
        hour: '8',
        calendar: 'solar'
      };
      
      expect(() => {
        getSajuInfo(invalidInput);
      }).toThrow('월이 유효하지 않습니다');
    });
    
    test('지원하지 않는 출력 형식 에러', () => {
      expect(() => {
        GetSajuInfo.calculate(sampleBirthInput, {
          outputFormat: 'invalid' as any,
          targetYear: 2025
        });
      }).toThrow('지원하지 않는 출력 형식입니다');
    });
  });
  
  describe('성능 및 일관성 테스트', () => {
    
    test('동일 입력에 대한 일관된 결과', () => {
      const result1 = getSajuInfo(sampleBirthInput);
      const result2 = getSajuInfo(sampleBirthInput);
      
      expect(result1.pillars).toEqual(result2.pillars);
      expect(result1.tenStars).toEqual(result2.tenStars);
      expect(result1.elements).toEqual(result2.elements);
      
      console.log('✅ 일관성 테스트 통과');
    });
    
    test('성능 측정 (기본적인 실행 시간)', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        getSajuInfo(sampleBirthInput);
      }
      
      const endTime = Date.now();
      const avgTime = (endTime - startTime) / 10;
      
      expect(avgTime).toBeLessThan(100); // 100ms 이하
      
      console.log('✅ 평균 실행 시간:', avgTime, 'ms');
    });
  });
  
  describe('모듈 정보 테스트', () => {
    
    test('모듈 정보 확인', () => {
      expect(MODULE_INFO.name).toBe('getSajuInfo');
      expect(MODULE_INFO.version).toBe('1.0.0');
      expect(Array.isArray(MODULE_INFO.features)).toBe(true);
      expect(MODULE_INFO.features.length).toBeGreaterThan(0);
      
      console.log('✅ 모듈 정보:', MODULE_INFO);
    });
  });
  
  describe('호환성 비교 테스트', () => {
    
    test('fetchSaju 호환성 확인', () => {
      const result = GetSajuInfo.compareWithFetchSaju(sampleBirthInput);
      
      expect(result).toHaveProperty('getSajuInfo');
      expect(result).toHaveProperty('comparison');
      expect(result.comparison).toHaveProperty('pillarsMatch');
      expect(result.comparison).toHaveProperty('tenStarsMatch');
      
      console.log('✅ fetchSaju 호환성 비교 결과:', result.comparison);
    });
  });
});