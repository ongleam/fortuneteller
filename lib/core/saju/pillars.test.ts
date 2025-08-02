/**
 * 사주 팔자 계산 모듈 테스트
 */

import { SajuPillarsCalculator, validatePillars } from './pillars';
import { normalizeBirthInput } from './calendar';

describe('SajuPillarsCalculator', () => {
  
  describe('fetchSaju 데이터와의 비교 테스트', () => {
    
    test('양력 남성 케이스 - 1995년 4월 25일 8시', () => {
      const input = normalizeBirthInput({
        name: "김은식",
        gender: "MALE",
        calendar: "SOLAR", 
        year: "1995",
        month: "04",
        day: "25", 
        hour: "08"
      });

      const result = SajuPillarsCalculator.calculate(input);
      
      // fetchSaju 기대값: 乙亥 辛巳 乙卯 庚辰
      expect(result.year.stem).toBe('乙');
      expect(result.year.branch).toBe('亥');
      expect(result.month.stem).toBe('辛');
      expect(result.month.branch).toBe('巳');
      expect(result.day.stem).toBe('乙');
      expect(result.day.branch).toBe('卯');
      expect(result.time.stem).toBe('庚');
      expect(result.time.branch).toBe('辰');
      
      // 유효성 검증
      expect(validatePillars(result)).toBe(true);
      
      console.log('계산된 팔자:', 
        `${result.year.stem}${result.year.branch} ${result.month.stem}${result.month.branch} ${result.day.stem}${result.day.branch} ${result.time.stem}${result.time.branch}`
      );
    });

    test('음력 여성 케이스 - 1988년 3월 15일 14시', () => {
      const input = normalizeBirthInput({
        name: "이영희",
        gender: "FEMALE",
        calendar: "LUNAR",
        year: "1988",
        month: "03",
        day: "15",
        hour: "14"
      });

      const result = SajuPillarsCalculator.calculate(input);
      
      // fetchSaju 기대값: 戊辰 丙辰 乙卯 癸未
      expect(result.year.stem).toBe('戊');
      expect(result.year.branch).toBe('辰');
      expect(result.month.stem).toBe('丙');
      expect(result.month.branch).toBe('辰');
      expect(result.day.stem).toBe('乙');
      expect(result.day.branch).toBe('卯');
      expect(result.time.stem).toBe('癸');
      expect(result.time.branch).toBe('未');
      
      // 유효성 검증
      expect(validatePillars(result)).toBe(true);
      
      console.log('계산된 팔자:', 
        `${result.year.stem}${result.year.branch} ${result.month.stem}${result.month.branch} ${result.day.stem}${result.day.branch} ${result.time.stem}${result.time.branch}`
      );
    });
  });

  describe('기본 기능 테스트', () => {
    
    test('결과 구조 검증', () => {
      const input = normalizeBirthInput({
        name: "테스트",
        gender: "MALE",
        calendar: "SOLAR",
        year: "2000",
        month: "01",
        day: "01",
        hour: "12"
      });

      const result = SajuPillarsCalculator.calculate(input);
      
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
      const input = normalizeBirthInput({
        name: "테스트",
        gender: "FEMALE",
        calendar: "LUNAR",
        year: "1990",
        month: "06",
        day: "15",
        hour: "18"
      });

      const result = SajuPillarsCalculator.calculate(input);
      expect(validatePillars(result)).toBe(true);
    });
  });
});