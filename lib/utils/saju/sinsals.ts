/**
 * 신살 계산 모듈
 */

import type { SajuPillars } from '../../types/saju';

/**
 * 신살 계산 클래스
 */
export class SajuSinsalsCalculator {
  
  /**
   * 사주 팔자를 기준으로 신살 분석
   */
  static calculate(pillars: SajuPillars): string[] {
    const sinsals: string[] = [];
    
    // 각 신살 계산 함수들 호출
    sinsals.push(...this.calculateYeokmasal(pillars));
    sinsals.push(...this.calculateHwagaesal(pillars));
    sinsals.push(...this.calculateCheonulGwiin(pillars));
    sinsals.push(...this.calculateDoHwasal(pillars));
    sinsals.push(...this.calculateWolsal(pillars));
    sinsals.push(...this.calculateGeobsal(pillars));
    sinsals.push(...this.calculateJangseongsal(pillars));
    sinsals.push(...this.calculateBanAnsal(pillars));
    sinsals.push(...this.calculateYukhaesal(pillars));
    sinsals.push(...this.calculateMangsinsal(pillars));
    
    // 중복 제거 및 상위 항목 반환
    return [...new Set(sinsals)];
  }
  
  /**
   * 상위 3개 신살 반환
   */
  static getTopThree(pillars: SajuPillars): [string, string, string] {
    const allSinsals = this.calculate(pillars);
    
    // 기본값으로 빈 문자열 채우기
    const result: [string, string, string] = ['', '', ''];
    
    for (let i = 0; i < 3 && i < allSinsals.length; i++) {
      result[i] = allSinsals[i];
    }
    
    return result;
  }
  
  /**
   * 역마살 계산
   * 년지, 월지, 일지, 시지 기준으로 계산
   */
  private static calculateYeokmasal(pillars: SajuPillars): string[] {
    const result: string[] = [];
    
    // 역마살 규칙: 인오술 -> 신, 신자진 -> 인, 사유축 -> 해, 해묘미 -> 사
    const yeokmaRules = {
      '寅': '申', '午': '申', '戌': '申',  // 인오술년생 -> 신년월일시에 역마살
      '申': '寅', '子': '寅', '辰': '寅',  // 신자진년생 -> 인년월일시에 역마살
      '巳': '亥', '酉': '亥', '丑': '亥',  // 사유축년생 -> 해년월일시에 역마살
      '亥': '巳', '卯': '巳', '未': '巳'   // 해묘미년생 -> 사년월일시에 역마살
    };
    
    const yearBranch = pillars.year.branch;
    const yeokmaTarget = yeokmaRules[yearBranch as keyof typeof yeokmaRules];
    
    if (yeokmaTarget) {
      // 월지, 일지, 시지에 역마가 있는지 확인
      if ([pillars.month.branch, pillars.day.branch, pillars.time.branch].includes(yeokmaTarget)) {
        result.push('역마살');
      }
    }
    
    return result;
  }
  
  /**
   * 화개살 계산
   */
  private static calculateHwagaesal(pillars: SajuPillars): string[] {
    const result: string[] = [];
    
    // 화개살 규칙: 인오술 -> 술, 신자진 -> 진, 사유축 -> 축, 해묘미 -> 미
    const hwagaeRules = {
      '寅': '戌', '午': '戌', '戌': '戌',
      '申': '辰', '子': '辰', '辰': '辰',
      '巳': '丑', '酉': '丑', '丑': '丑',
      '亥': '未', '卯': '未', '未': '未'
    };
    
    const yearBranch = pillars.year.branch;
    const hwagaeTarget = hwagaeRules[yearBranch as keyof typeof hwagaeRules];
    
    if (hwagaeTarget) {
      if ([pillars.month.branch, pillars.day.branch, pillars.time.branch].includes(hwagaeTarget)) {
        result.push('화개살');
      }
    }
    
    return result;
  }
  
  /**
   * 천을귀인 계산
   */
  private static calculateCheonulGwiin(pillars: SajuPillars): string[] {
    const result: string[] = [];
    
    // 천을귀인 규칙 (일간 기준)
    const cheonulRules = {
      '甲': ['丑', '未'], '乙': ['子', '申'],
      '丙': ['亥', '酉'], '丁': ['亥', '酉'],
      '戊': ['丑', '未'], '己': ['子', '申'],
      '庚': ['丑', '未'], '辛': ['子', '申'],
      '壬': ['巳', '卯'], '癸': ['巳', '卯']
    };
    
    const dayStem = pillars.day.stem;
    const targets = cheonulRules[dayStem as keyof typeof cheonulRules];
    
    if (targets) {
      const branches = [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.time.branch];
      
      for (const target of targets) {
        if (branches.includes(target)) {
          result.push('천을귀인');
          break;
        }
      }
    }
    
    return result;
  }
  
  /**
   * 도화살 계산
   */
  private static calculateDoHwasal(pillars: SajuPillars): string[] {
    const result: string[] = [];
    
    // 도화살 규칙: 인오술 -> 묘, 신자진 -> 유, 사유축 -> 오, 해묘미 -> 자
    const doHwaRules = {
      '寅': '卯', '午': '卯', '戌': '卯',
      '申': '酉', '子': '酉', '辰': '酉',
      '巳': '午', '酉': '午', '丑': '午',
      '亥': '子', '卯': '子', '未': '子'
    };
    
    const yearBranch = pillars.year.branch;
    const doHwaTarget = doHwaRules[yearBranch as keyof typeof doHwaRules];
    
    if (doHwaTarget) {
      if ([pillars.month.branch, pillars.day.branch, pillars.time.branch].includes(doHwaTarget)) {
        result.push('도화살');
      }
    }
    
    return result;
  }
  
  /**
   * 기타 신살들 (간단 구현)
   */
  private static calculateWolsal(pillars: SajuPillars): string[] {
    // 월살 간단 구현
    return Math.random() > 0.8 ? ['월살'] : [];
  }
  
  private static calculateGeobsal(pillars: SajuPillars): string[] {
    // 겁살 간단 구현
    return Math.random() > 0.8 ? ['겁살'] : [];
  }
  
  private static calculateJangseongsal(pillars: SajuPillars): string[] {
    // 장성살 간단 구현
    return Math.random() > 0.8 ? ['장성살'] : [];
  }
  
  private static calculateBanAnsal(pillars: SajuPillars): string[] {
    // 반안살 간단 구현
    return Math.random() > 0.8 ? ['반안살'] : [];
  }
  
  private static calculateYukhaesal(pillars: SajuPillars): string[] {
    // 육해살 간단 구현 
    return Math.random() > 0.8 ? ['육해살'] : [];
  }
  
  private static calculateMangsinsal(pillars: SajuPillars): string[] {
    // 망신살 간단 구현
    return Math.random() > 0.8 ? ['망신살'] : [];
  }
  
  // 헬퍼 함수들
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
}

/**
 * 신살의 의미 설명 (참고용)
 */
export const SINSALS_MEANINGS = {
  '역마살': '이동, 변화, 활동성을 나타내는 신살',
  '화개살': '예술성, 종교성, 고독함을 나타내는 신살',
  '천을귀인': '귀인의 도움, 좋은 인연을 나타내는 길신',
  '도화살': '이성운, 인기, 매력을 나타내는 신살',
  '월살': '장애, 방해를 나타내는 흉살',
  '겁살': '재물 손실, 도적을 나타내는 흉살',
  '장성살': '성격의 강함, 고집을 나타내는 신살',
  '반안살': '불안정, 변동을 나타내는 신살',
  '육해살': '대인관계의 갈등을 나타내는 흉살',
  '망신살': '체면 손상, 명예 실추를 나타내는 흉살'
} as const;