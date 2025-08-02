/**
 * 운세 계산 모듈 테스트
 */

import { SajuFortunesCalculator } from './fortunes';
import type { SajuPillars } from '../../types/saju';

describe('SajuFortunesCalculator', () => {
  
  describe('기본 운세 계산 테스트', () => {
    
    test('양력 남성 케이스 - 1995년 4월 25일 8시', () => {
      // fetchSaju 팔자: 乙亥 辛巳 乙卯 庚辰
      const pillars: SajuPillars = {
        year: { stem: '乙', branch: '亥' },
        month: { stem: '辛', branch: '巳' },
        day: { stem: '乙', branch: '卯' },
        time: { stem: '庚', branch: '辰' }
      };

      const result = SajuFortunesCalculator.calculate(pillars, 2025);
      
      console.log('✅ 운세 계산 결과:', result);
      
      // 기본 구조 검증
      expect(result).toHaveProperty('currentAge');
      expect(result).toHaveProperty('bigFortune');
      expect(result).toHaveProperty('yearFortune');
      
      expect(result.bigFortune).toHaveProperty('current');
      expect(result.bigFortune).toHaveProperty('next');
      
      expect(typeof result.currentAge).toBe('number');
      expect(result.currentAge).toBeGreaterThan(0);
    });

    test('운세 정보 구조 검증', () => {
      const pillars: SajuPillars = {
        year: { stem: '甲', branch: '子' },
        month: { stem: '丙', branch: '寅' },
        day: { stem: '戊', branch: '辰' },
        time: { stem: '庚', branch: '午' }
      };

      const result = SajuFortunesCalculator.calculate(pillars, 2024);
      
      // 대운 구조 검증
      expect(result.bigFortune.current).toHaveProperty('number');
      expect(result.bigFortune.current).toHaveProperty('stem');
      expect(result.bigFortune.current).toHaveProperty('branch');
      
      // 년운 구조 검증
      expect(result.yearFortune).toHaveProperty('year');
      expect(result.yearFortune).toHaveProperty('stem');
      expect(result.yearFortune).toHaveProperty('branch');
      
      console.log('✅ 운세 구조 검증 완료:', {
        currentAge: result.currentAge,
        bigFortuneNumber: result.bigFortune.current.number,
        yearFortuneYear: result.yearFortune.year
      });
    });
  });

  describe('년운 계산 테스트', () => {
    
    test('특정 년도의 간지 계산', () => {
      const pillars: SajuPillars = {
        year: { stem: '乙', branch: '亥' },
        month: { stem: '辛', branch: '巳' },
        day: { stem: '乙', branch: '卯' },
        time: { stem: '庚', branch: '辰' }
      };

      // 여러 년도 테스트
      const years = [2020, 2025, 2030];
      
      for (const year of years) {
        const result = SajuFortunesCalculator.calculate(pillars, year);
        
        expect(result.yearFortune.year).toBe(year);
        expect(result.yearFortune.stem.chinese).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
        expect(result.yearFortune.branch.chinese).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
        
        console.log(`✅ ${year}년 간지:`, 
          `${result.yearFortune.stem.chinese}${result.yearFortune.branch.chinese}`
        );
      }
    });
  });

  describe('대운 계산 테스트', () => {
    
    test('대운 진행 확인', () => {
      const pillars: SajuPillars = {
        year: { stem: '戊', branch: '辰' },
        month: { stem: '丙', branch: '辰' },
        day: { stem: '乙', branch: '卯' },
        time: { stem: '癸', branch: '未' }
      };

      const result = SajuFortunesCalculator.calculate(pillars, 2025);
      
      // 현재 대운과 다음 대운이 다른지 확인
      expect(result.bigFortune.current.number).toBeDefined();
      expect(result.bigFortune.next.number).toBe(result.bigFortune.current.number + 1);
      
      console.log('✅ 대운 진행:', {
        current: result.bigFortune.current.number,
        next: result.bigFortune.next.number
      });
    });
  });
});