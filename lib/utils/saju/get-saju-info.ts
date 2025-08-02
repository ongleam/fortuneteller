/**
 * getSajuInfo 메인 함수
 * fetchSaju를 대체하는 새로운 사주 계산 함수
 */

import { normalizeBirthYear } from './calendar';
import { SajuPillarsCalculator } from './pillars';
import { SajuTenStarsCalculator } from './ten-stars';
import { SajuFiveElementsCalculator } from './five-elements';
import { SajuFortunesCalculator } from './fortunes';
import { SajuSinsalsCalculator } from './sinsals';
import { SajuAdapters } from './adapters';

import type { 
  BirthInput,
  SimplifiedSajuOutput,
  FetchSajuCompatibleOutput,
  UiOptimizedSajuOutput,
  GetSajuInfoOptions
} from '../../types/saju';

/**
 * getSajuInfo 메인 클래스
 */
export class GetSajuInfo {
  
  /**
   * 사주 정보 계산 메인 함수
   * 
   * @param birthInput - 생년월일시 정보
   * @param options - 계산 옵션 (출력 형식, 년도 등)
   * @returns 요청된 형식의 사주 정보
   */
  static calculate<T extends 'simple' | 'fetchSaju' | 'ui'>(
    birthInput: BirthInput,
    options: GetSajuInfoOptions & { outputFormat: T }
  ): T extends 'simple' 
    ? SimplifiedSajuOutput 
    : T extends 'fetchSaju' 
    ? FetchSajuCompatibleOutput 
    : UiOptimizedSajuOutput {
    
    try {
      // 1. 입력 데이터 검증 및 정규화
      const normalizedInput = this.validateAndNormalizeInput(birthInput);
      
      // 2. 사주 팔자 계산
      const pillars = SajuPillarsCalculator.calculate(normalizedInput);
      
      // 3. 십성 계산
      const tenStars = SajuTenStarsCalculator.calculate(pillars);
      
      // 4. 오행 분석
      const elements = SajuFiveElementsCalculator.calculate(pillars);
      
      // 5. 운세 계산
      const fortune = SajuFortunesCalculator.calculate(pillars, options.targetYear);
      
      // 6. 신살 계산
      const sinsals = SajuSinsalsCalculator.getTopThree(pillars);
      
      // 7. 데이터 통합
      const combinedData = {
        basic: normalizedInput,
        pillars,
        tenStars,
        elements,
        fortune,
        sinsals
      };
      
      // 8. 요청된 형식으로 변환
      return this.convertToRequestedFormat(combinedData, options.outputFormat) as any;
      
    } catch (error) {
      throw new Error(`getSajuInfo 계산 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }
  
  /**
   * 간단한 사주 계산 (기본 형식)
   */
  static simple(birthInput: BirthInput, targetYear?: number): SimplifiedSajuOutput {
    return this.calculate(birthInput, {
      outputFormat: 'simple',
      targetYear
    });
  }
  
  /**
   * fetchSaju 호환 형식으로 사주 계산
   */
  static fetchSajuFormat(birthInput: BirthInput, targetYear?: number): FetchSajuCompatibleOutput {
    return this.calculate(birthInput, {
      outputFormat: 'fetchSaju',
      targetYear
    });
  }
  
  /**
   * UI 최적화 형식으로 사주 계산
   */
  static uiFormat(birthInput: BirthInput, targetYear?: number): UiOptimizedSajuOutput {
    return this.calculate(birthInput, {
      outputFormat: 'ui',
      targetYear
    });
  }
  
  /**
   * 입력 데이터 검증 및 정규화
   */
  private static validateAndNormalizeInput(input: BirthInput): BirthInput {
    // 필수 필드 검증
    if (!input.year || !input.month || !input.day || !input.hour) {
      throw new Error('생년월일시 정보가 부족합니다.');
    }
    
    // 년도 정규화 (95 -> 1995)
    const normalizedYear = normalizeBirthYear(input.year);
    
    // 숫자 범위 검증
    const year = parseInt(normalizedYear);
    const month = parseInt(input.month);
    const day = parseInt(input.day);
    const hour = parseInt(input.hour);
    
    if (year < 1900 || year > 2100) {
      throw new Error(`년도가 유효하지 않습니다: ${year}`);
    }
    
    if (month < 1 || month > 12) {
      throw new Error(`월이 유효하지 않습니다: ${month}`);
    }
    
    if (day < 1 || day > 31) {
      throw new Error(`일이 유효하지 않습니다: ${day}`);
    }
    
    if (hour < 0 || hour > 23) {
      throw new Error(`시간이 유효하지 않습니다: ${hour}`);
    }
    
    // 성별 기본값 설정
    const gender = input.gender || '남성';
    if (!['남성', '여성'].includes(gender)) {
      throw new Error(`성별이 유효하지 않습니다: ${gender}`);
    }
    
    // 달력 타입 기본값 설정
    const calendar = input.calendar || 'solar';
    if (!['solar', 'lunar'].includes(calendar)) {
      throw new Error(`달력 타입이 유효하지 않습니다: ${calendar}`);
    }
    
    return {
      ...input,
      year: normalizedYear,
      month: input.month.padStart(2, '0'),
      day: input.day.padStart(2, '0'),
      hour: input.hour.padStart(2, '0'),
      gender,
      calendar
    };
  }
  
  /**
   * 요청된 형식으로 데이터 변환
   */
  private static convertToRequestedFormat(
    data: any,
    format: 'simple' | 'fetchSaju' | 'ui'
  ): SimplifiedSajuOutput | FetchSajuCompatibleOutput | UiOptimizedSajuOutput {
    
    switch (format) {
      case 'simple':
        return SajuAdapters.toSimple(data);
        
      case 'fetchSaju':
        return SajuAdapters.toFetchSaju(data);
        
      case 'ui':
        return SajuAdapters.toUi(data);
        
      default:
        throw new Error(`지원하지 않는 출력 형식입니다: ${format}`);
    }
  }
  
  /**
   * 모든 형식의 결과를 한 번에 계산
   */
  static calculateAll(birthInput: BirthInput, targetYear?: number) {
    const normalizedInput = this.validateAndNormalizeInput(birthInput);
    
    // 한 번만 계산하고 각 형식으로 변환
    const pillars = SajuPillarsCalculator.calculate(normalizedInput);
    const tenStars = SajuTenStarsCalculator.calculate(pillars);
    const elements = SajuFiveElementsCalculator.calculate(pillars);
    const fortune = SajuFortunesCalculator.calculate(pillars, targetYear);
    const sinsals = SajuSinsalsCalculator.getTopThree(pillars);
    
    const combinedData = {
      basic: normalizedInput,
      pillars,
      tenStars,
      elements,
      fortune,
      sinsals
    };
    
    return {
      simple: SajuAdapters.toSimple(combinedData),
      fetchSaju: SajuAdapters.toFetchSaju(combinedData),
      ui: SajuAdapters.toUi(combinedData)
    };
  }
  
  /**
   * fetchSaju와의 호환성 확인용 비교 함수
   */
  static compareWithFetchSaju(birthInput: BirthInput): {
    getSajuInfo: FetchSajuCompatibleOutput;
    // fetchSaju: any; // 실제 fetchSaju 결과와 비교할 때 사용
    comparison: {
      pillarsMatch: boolean;
      tenStarsMatch: boolean;
      elementsMatch: boolean;
      sinsalsMatch: boolean;
    };
  } {
    const result = this.fetchSajuFormat(birthInput);
    
    // 실제 fetchSaju와 비교할 때 사용할 구조
    const comparison = {
      pillarsMatch: true, // 실제 비교 로직 필요
      tenStarsMatch: true, // 실제 비교 로직 필요
      elementsMatch: true, // 실제 비교 로직 필요
      sinsalsMatch: true   // 실제 비교 로직 필요
    };
    
    return {
      getSajuInfo: result,
      comparison
    };
  }
}

/**
 * 편의 함수들 (기존 코드와의 호환성을 위해)
 */

// 기본 형식 계산
export function getSajuInfo(birthInput: BirthInput, targetYear?: number): SimplifiedSajuOutput {
  return GetSajuInfo.simple(birthInput, targetYear);
}

// fetchSaju 호환 형식 계산
export function getSajuInfoCompatible(birthInput: BirthInput, targetYear?: number): FetchSajuCompatibleOutput {
  return GetSajuInfo.fetchSajuFormat(birthInput, targetYear);
}

// UI 최적화 형식 계산
export function getSajuInfoForUi(birthInput: BirthInput, targetYear?: number): UiOptimizedSajuOutput {
  return GetSajuInfo.uiFormat(birthInput, targetYear);
}

// 모든 형식 한 번에 계산
export function getSajuInfoAll(birthInput: BirthInput, targetYear?: number) {
  return GetSajuInfo.calculateAll(birthInput, targetYear);
}

/**
 * 모듈 정보 및 버전
 */
export const MODULE_INFO = {
  name: 'getSajuInfo',
  version: '1.0.0',
  description: 'fetchSaju를 대체하는 새로운 사주 계산 함수',
  features: [
    '모듈화된 아키텍처',
    '다양한 출력 형식 지원 (simple/fetchSaju/ui)',
    '향상된 에러 처리',
    '입력 데이터 검증',
    '년도 정규화',
    '어댑터 패턴 적용'
  ],
  compatibility: {
    fetchSaju: '호환 가능 (어댑터를 통한 형식 변환)',
    existingCode: '편의 함수를 통한 점진적 마이그레이션 지원'
  }
} as const;