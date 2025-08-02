/**
 * 수정된 사주 팔자 계산 모듈 테스트
 */

import { getCorrectPillars } from './pillars-fixed';
import { normalizeBirthInput } from './calendar';

describe('SajuPillarsCalculatorFixed', () => {
  
  describe('fetchSaju 데이터와의 정확한 비교 테스트', () => {
    
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

      const result = getCorrectPillars(input);
      
      // fetchSaju 기대값: 乙亥 辛巳 乙卯 庚辰
      expect(result.year.stem).toBe('乙');
      expect(result.year.branch).toBe('亥');
      expect(result.month.stem).toBe('辛');
      expect(result.month.branch).toBe('巳');
      expect(result.day.stem).toBe('乙');
      expect(result.day.branch).toBe('卯');
      expect(result.time.stem).toBe('庚');
      expect(result.time.branch).toBe('辰');
      
      console.log('✅ 수정된 팔자:', 
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

      const result = getCorrectPillars(input);
      
      // fetchSaju 기대값: 戊辰 丙辰 乙卯 癸未
      expect(result.year.stem).toBe('戊');
      expect(result.year.branch).toBe('辰');
      expect(result.month.stem).toBe('丙');
      expect(result.month.branch).toBe('辰');
      expect(result.day.stem).toBe('乙');
      expect(result.day.branch).toBe('卯');
      expect(result.time.stem).toBe('癸');
      expect(result.time.branch).toBe('未');
      
      console.log('✅ 수정된 팔자:', 
        `${result.year.stem}${result.year.branch} ${result.month.stem}${result.month.branch} ${result.day.stem}${result.day.branch} ${result.time.stem}${result.time.branch}`
      );
    });
  });
});