/**
 * 운세 계산 모듈
 */

import { SIXTY_GAPJA, getStemIndex, getBranchIndex } from './constants';
import type { SajuPillars, FortuneInfo } from '../../types/saju';

/**
 * 운세 계산 클래스
 */
export class SajuFortunesCalculator {
  
  /**
   * 운세 정보 계산
   */
  static calculate(pillars: SajuPillars, targetYear?: number): FortuneInfo {
    const currentYear = targetYear || new Date().getFullYear();
    
    // 간단한 운세 정보 구조 (추후 확장)
    return {
      currentAge: this.calculateAge(1995, currentYear), // 임시로 1995년 기준
      bigFortune: {
        current: this.calculateCurrentBigFortune(pillars, currentYear),
        next: this.calculateNextBigFortune(pillars, currentYear)
      },
      yearFortune: this.calculateYearFortune(currentYear)
    };
  }
  
  /**
   * 나이 계산
   */
  private static calculateAge(birthYear: number, currentYear: number): number {
    return currentYear - birthYear + 1; // 한국식 나이
  }
  
  /**
   * 현재 대운 계산
   */
  private static calculateCurrentBigFortune(pillars: SajuPillars, currentYear: number): any {
    // 대운은 월주에서 시작하여 순행 또는 역행
    // 간단한 구현 (추후 정확한 공식으로 교체)
    
    const monthStemIndex = getStemIndex(pillars.month.stem);
    const monthBranchIndex = getBranchIndex(pillars.month.branch);
    
    // 10년 단위 대운 계산 (임시)
    const age = this.calculateAge(1995, currentYear);
    const fortuneNumber = Math.floor((age - 1) / 10);
    
    // 순행/역행 결정 (성별과 년도의 음양에 따라)
    const isForward = true; // 임시로 순행
    
    const offset = isForward ? fortuneNumber : -fortuneNumber;
    const newStemIndex = (monthStemIndex + offset) % 10;
    const newBranchIndex = (monthBranchIndex + offset) % 12;
    
    return {
      number: fortuneNumber,
      stem: { 
        chinese: pillars.month.stem, // 임시
        korean: this.getKoreanStem(pillars.month.stem),
        fiveElement: this.getStemElement(pillars.month.stem),
        yangYin: this.getStemYangYin(pillars.month.stem)
      },
      branch: {
        chinese: pillars.month.branch, // 임시  
        korean: this.getKoreanBranch(pillars.month.branch),
        fiveElement: this.getBranchElement(pillars.month.branch),
        yangYin: this.getBranchYangYin(pillars.month.branch)
      }
    };
  }
  
  /**
   * 다음 대운 계산
   */
  private static calculateNextBigFortune(pillars: SajuPillars, currentYear: number): any {
    const current = this.calculateCurrentBigFortune(pillars, currentYear);
    
    // 다음 대운은 현재 대운에서 1단계 진행
    return {
      ...current,
      number: current.number + 1
    };
  }
  
  /**
   * 년운 계산
   */
  private static calculateYearFortune(year: number): any {
    // 해당 년도의 간지 계산
    const baseYear = 1924; // 갑자년
    const yearOffset = (year - baseYear) % 60;
    const gapjaIndex = yearOffset < 0 ? yearOffset + 60 : yearOffset;
    const gapja = SIXTY_GAPJA[gapjaIndex];
    
    return {
      year,
      stem: {
        chinese: gapja[0],
        korean: this.getKoreanStem(gapja[0]),
        fiveElement: this.getStemElement(gapja[0])
      },
      branch: {
        chinese: gapja[1],
        korean: this.getKoreanBranch(gapja[1]),
        fiveElement: this.getBranchElement(gapja[1])
      }
    };
  }
  
  // 헬퍼 함수들 (간단 구현)
  private static getKoreanStem(chinese: string): string {
    const map: { [key: string]: string } = {
      '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
      '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계'
    };
    return map[chinese] || chinese;
  }
  
  private static getKoreanBranch(chinese: string): string {
    const map: { [key: string]: string } = {
      '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
      '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'
    };
    return map[chinese] || chinese;
  }
  
  private static getStemElement(chinese: string): string {
    const map: { [key: string]: string } = {
      '甲': '목', '乙': '목', '丙': '화', '丁': '화', '戊': '토',
      '己': '토', '庚': '금', '辛': '금', '壬': '수', '癸': '수'
    };
    return map[chinese] || '';
  }
  
  private static getBranchElement(chinese: string): string {
    const map: { [key: string]: string } = {
      '子': '수', '丑': '토', '寅': '목', '卯': '목', '辰': '토', '巳': '화',
      '午': '화', '未': '토', '申': '금', '酉': '금', '戌': '토', '亥': '수'
    };
    return map[chinese] || '';
  }
  
  private static getStemYangYin(chinese: string): string {
    const map: { [key: string]: string } = {
      '甲': '양', '乙': '음', '丙': '양', '丁': '음', '戊': '양',
      '己': '음', '庚': '양', '辛': '음', '壬': '양', '癸': '음'
    };
    return map[chinese] || '';
  }
  
  private static getBranchYangYin(chinese: string): string {
    const map: { [key: string]: string } = {
      '子': '양', '丑': '음', '寅': '양', '卯': '음', '辰': '양', '巳': '음',
      '午': '양', '未': '음', '申': '양', '酉': '음', '戌': '양', '亥': '음'
    };
    return map[chinese] || '';
  }
}

/**
 * 대운의 의미 (참고용)
 */
export const BIG_FORTUNE_MEANINGS = {
  description: '10년 단위로 변화하는 인생의 큰 흐름',
  calculation: '월주를 기준으로 성별과 년도의 음양에 따라 순행 또는 역행',
  influence: '전반적인 운세의 방향성과 인생의 변화 시기를 나타냄'
} as const;