/**
 * 십성 계산 모듈 테스트
 */

import { SajuTenStarsCalculator } from './ten-stars';
import type { SajuPillars } from '../../shared/types/saju';

describe('SajuTenStarsCalculator', () => {
  
  describe('fetchSaju 데이터와의 비교 테스트', () => {
    
    test('양력 남성 케이스 - 1995년 4월 25일 8시', () => {
      // fetchSaju 팔자: 乙亥 辛巳 乙卯 庚辰
      const pillars: SajuPillars = {
        year: { stem: '乙', branch: '亥' },
        month: { stem: '辛', branch: '巳' },
        day: { stem: '乙', branch: '卯' },
        time: { stem: '庚', branch: '辰' }
      };

      const result = SajuTenStarsCalculator.calculate(pillars);
      
      // fetchSaju 기대값 (일간 乙 기준):
      // yearStem: "비견", yearBranch: "정인",
      // monthStem: "편관", monthBranch: "상관", 
      // dayStem: "비견", dayBranch: "비견",
      // timeStem: "정관", timeBranch: "정재"
      
      expect(result.yearStem).toBe('비견');     // 乙-乙
      expect(result.yearBranch).toBe('정인');   // 乙-壬(亥의 주기)
      expect(result.monthStem).toBe('편관');    // 乙-辛
      expect(result.monthBranch).toBe('상관');  // 乙-丙(巳의 주기)
      expect(result.dayStem).toBe('비견');      // 乙-乙 (자기 자신)
      expect(result.dayBranch).toBe('비견');    // 乙-乙(卯의 주기)
      expect(result.timeStem).toBe('정관');     // 乙-庚
      expect(result.timeBranch).toBe('정재');   // 乙-戊(辰의 주기)
      
      console.log('✅ 십성 계산 결과:', result);
    });

    test('음력 여성 케이스 - 1988년 3월 15일 14시', () => {
      // fetchSaju 팔자: 戊辰 丙辰 乙卯 癸未
      const pillars: SajuPillars = {
        year: { stem: '戊', branch: '辰' },
        month: { stem: '丙', branch: '辰' },
        day: { stem: '乙', branch: '卯' },
        time: { stem: '癸', branch: '未' }
      };

      const result = SajuTenStarsCalculator.calculate(pillars);
      
      // 일간 乙 기준으로 계산
      expect(result.yearStem).toBe('정재');     // 乙-戊
      expect(result.monthStem).toBe('상관');    // 乙-丙
      expect(result.dayStem).toBe('비견');      // 乙-乙
      expect(result.timeStem).toBe('편인');     // 乙-癸
      
      console.log('✅ 십성 계산 결과:', result);
    });
  });

  describe('기본 십성 계산 로직 테스트', () => {
    
    test('같은 오행 십성 계산', () => {
      // 甲(양목) 기준
      const pillars: SajuPillars = {
        year: { stem: '甲', branch: '子' },  // 甲-甲 = 비견
        month: { stem: '乙', branch: '子' }, // 甲-乙 = 겁재  
        day: { stem: '甲', branch: '子' },   // 기준
        time: { stem: '甲', branch: '子' }   // 甲-甲 = 비견
      };

      const result = SajuTenStarsCalculator.calculate(pillars);
      
      expect(result.yearStem).toBe('비견');   // 같은 음양
      expect(result.monthStem).toBe('겁재'); // 다른 음양
      expect(result.dayStem).toBe('비견');   // 자기 자신
      expect(result.timeStem).toBe('비견');  // 같은 음양
    });

    test('오행별 십성 관계 확인', () => {
      // 丙(양화) 기준으로 각 오행과의 관계
      const testPillars: SajuPillars = {
        year: { stem: '甲', branch: '子' },  // 甲(목) -> 丙(화) 생함 = 정인
        month: { stem: '戊', branch: '子' }, // 丙(화) -> 戊(토) 생함 = 식신
        day: { stem: '丙', branch: '子' },   // 기준
        time: { stem: '庚', branch: '子' }   // 丙(화) -> 庚(금) 극함 = 편재
      };

      const result = SajuTenStarsCalculator.calculate(testPillars);
      
      expect(result.yearStem).toBe('편인');   // 목생화 (甲양목 -> 丙양화 = 편인)
      expect(result.monthStem).toBe('식신'); // 화생토 
      expect(result.timeStem).toBe('편재');  // 화극금
    });
  });
});