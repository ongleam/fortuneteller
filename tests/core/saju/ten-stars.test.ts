/**
 * 십성 계산 모듈 테스트
 */

import { calculateTenStars } from '@/lib/core/saju/ten-stars';

describe('TenStarsCalculator', () => {
  
  describe('십성 계산 테스트', () => {
    
    test('기본 십성 계산', () => {
      const samplePillars = {
        year: { stem: '乙', branch: '亥' },
        month: { stem: '辛', branch: '巳' },
        day: { stem: '乙', branch: '卯' },
        time: { stem: '庚', branch: '辰' }
      };

      const result = calculateTenStars(samplePillars);
      
      // 구조 검증
      expect(result).toHaveProperty('year');
      expect(result).toHaveProperty('month');
      expect(result).toHaveProperty('day');
      expect(result).toHaveProperty('time');
      
      // 각 기둥별 십성 정보 검증
      expect(result.year).toHaveProperty('korean');
      expect(result.year).toHaveProperty('chinese');
      expect(result.month).toHaveProperty('korean');
      expect(result.month).toHaveProperty('chinese');
      
      // 십성이 올바른 값인지 확인
      expect(typeof result.year.korean).toBe('string');
      expect(typeof result.year.chinese).toBe('string');
      
      console.log('✅ 십성 계산 결과:', result);
    });
    
    test('다른 일간의 십성 계산', () => {
      const samplePillars = {
        year: { stem: '甲', branch: '子' },
        month: { stem: '丙', branch: '寅' },
        day: { stem: '戊', branch: '午' },
        time: { stem: '壬', branch: '戌' }
      };

      const result = calculateTenStars(samplePillars);
      
      expect(result.year.korean).toBeDefined();
      expect(result.month.korean).toBeDefined();
      expect(result.day.korean).toBeDefined();
      expect(result.time.korean).toBeDefined();
      
      console.log('✅ 다른 일간 십성 결과:', result);
    });
  });
  
  describe('십성 유효성 검증', () => {
    
    test('십성 한글명 유효성', () => {
      const validKoreanNames = [
        '비견', '겁재', '식신', '상관', '편재', 
        '정재', '편관', '정관', '편인', '정인'
      ];
      
      const samplePillars = {
        year: { stem: '乙', branch: '亥' },
        month: { stem: '辛', branch: '巳' },
        day: { stem: '乙', branch: '卯' },
        time: { stem: '庚', branch: '辰' }
      };

      const result = calculateTenStars(samplePillars);
      
      expect(validKoreanNames).toContain(result.year.korean);
      expect(validKoreanNames).toContain(result.month.korean);
      expect(validKoreanNames).toContain(result.day.korean);
      expect(validKoreanNames).toContain(result.time.korean);
    });
  });
});