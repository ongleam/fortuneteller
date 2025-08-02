/**
 * 사주 팔자 계산 모듈
 */

import { HEAVENLY_STEMS, EARTHLY_BRANCHES, SIXTY_GAPJA, getStemIndex, getBranchIndex } from './constants';
import { CalendarConverter } from './calendar';
import type { BirthInput, SajuPillars } from '../../types/saju';

/**
 * 사주 팔자 계산 클래스
 */
export class SajuPillarsCalculator {
  
  /**
   * 생년월일시를 기준으로 사주 팔자 계산
   */
  static calculate(birthInput: BirthInput): SajuPillars {
    // BirthInput 필드 매핑
    const year = parseInt(birthInput.year);
    const month = parseInt(birthInput.month);
    const day = parseInt(birthInput.day);
    const birthTime = parseInt(birthInput.hour);
    
    // 양력/음력 변환 처리
    let solarDate: Date;
    if (birthInput.calendar === 'lunar') {
      const converted = CalendarConverter.lunarToSolar(year, month, day);
      solarDate = new Date(converted.year, converted.month - 1, converted.day);
    } else {
      solarDate = new Date(year, month - 1, day);
    }
    
    // 사주 기준 년월 계산 (절기 기준)
    const sajuYear = CalendarConverter.getSajuYear(solarDate);
    const sajuMonth = CalendarConverter.getSajuMonth(solarDate);
    
    // 각 주 계산
    const yearPillar = this.calculateYearPillar(sajuYear);
    const monthPillar = this.calculateMonthPillar(sajuYear, sajuMonth);
    const dayPillar = this.calculateDayPillar(solarDate);
    const timePillar = this.calculateTimePillar(dayPillar, birthTime);
    
    return {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      time: timePillar
    };
  }
  
  /**
   * 년주 계산 (60갑자 순환)
   */
  private static calculateYearPillar(year: number) {
    // 기준년도 1924년 = 갑자년 (0번 인덱스)
    const baseYear = 1924;
    const yearOffset = (year - baseYear) % 60;
    const gapjaIndex = yearOffset < 0 ? yearOffset + 60 : yearOffset;
    
    const gapja = SIXTY_GAPJA[gapjaIndex];
    
    return {
      stem: gapja.charAt(0),   // 천간
      branch: gapja.charAt(1)  // 지지
    };
  }
  
  /**
   * 월주 계산 (절기 기준 개선)
   * fetchSaju 결과를 참조하여 정확한 계산
   */
  private static calculateMonthPillar(year: number, month: number) {
    const yearPillar = this.calculateYearPillar(year);
    const yearStemIndex = getStemIndex(yearPillar.stem);
    
    // 알려진 정확한 월주 데이터를 참조
    // 1995년(乙亥년) 4월 → 辛巳
    // 2000년(庚辰년) 1월 → 戊寅
    
    // 년간별 정월(인월) 천간 매핑 (정확한 공식)
    // 갑기년: 병인월, 을경년: 무인월, 병신년: 경인월, 정임년: 임인월, 무계년: 갑인월
    const firstMonthStemMap = [
      2, // 갑년(0) -> 병(2)
      4, // 을년(1) -> 무(4) 
      6, // 병년(2) -> 경(6)
      8, // 정년(3) -> 임(8)
      0, // 무년(4) -> 갑(0)
      2, // 기년(5) -> 병(2)
      4, // 경년(6) -> 무(4)
      6, // 신년(7) -> 경(6)
      8, // 임년(8) -> 임(8)
      0  // 계년(9) -> 갑(0)
    ];
    
    const firstMonthStemIndex = firstMonthStemMap[yearStemIndex];
    
    // 절기 기준 월 조정 (대략적)
    let sajuMonth = month;
    
    // 각 월의 중요한 절기 경계 고려
    // 1월=인월(입춘~), 2월=묘월(경칩~), 3월=진월(청명~), 4월=사월(입하~)...
    // 절기 이전은 이전 월로 계산
    
    // 월간 계산: 정월(인월)을 기준으로 순차 계산
    const monthOffset = sajuMonth - 1; // 0부터 시작
    const monthStemIndex = (firstMonthStemIndex + monthOffset) % 10;
    const monthBranchIndex = (2 + monthOffset) % 12; // 인(2)부터 시작
    
    return {
      stem: HEAVENLY_STEMS[monthStemIndex].chinese,
      branch: EARTHLY_BRANCHES[monthBranchIndex].chinese
    };
  }
  
  /**
   * 일주 계산 (fetchSaju 기준 보정)
   * 알려진 날짜들을 기준으로 정확한 계산
   */
  private static calculateDayPillar(date: Date) {
    // 알려진 정확한 기준점들 사용
    const knownDates = [
      { date: new Date(1995, 3, 25), gapja: '乙卯' },  // 1995-04-25 = 乙卯
      { date: new Date(2000, 0, 1), gapja: '癸巳' },   // 2000-01-01 = 癸巳
    ];
    
    // 가장 가까운 기준점 찾기
    const basePoint = knownDates[0]; // 1995-04-25 = 乙卯 사용
    
    const diffTime = date.getTime() - basePoint.date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const baseGapjaIndex = SIXTY_GAPJA.findIndex(g => g === basePoint.gapja);
    const gapjaIndex = (baseGapjaIndex + diffDays) % 60;
    const finalIndex = gapjaIndex < 0 ? gapjaIndex + 60 : gapjaIndex;
    
    const gapja = SIXTY_GAPJA[finalIndex];
    
    return {
      stem: gapja[0],
      branch: gapja[1]
    };
  }
  
  /**
   * 시주 계산
   * 일간에 따라 자시(0시)의 간지가 정해지고, 시간에 따라 계산
   */
  private static calculateTimePillar(dayPillar: { stem: string; branch: string }, birthTime: string) {
    const dayStemIndex = getStemIndex(dayPillar.stem);
    
    // 일간별 자시(0시) 천간 매핑
    // 갑/기일: 갑자, 을/경일: 병자, 병/신일: 무자, 정/임일: 경자, 무/계일: 임자
    const firstTimeStemMap = [
      0, // 갑일 -> 갑(0)
      2, // 을일 -> 병(2)
      4, // 병일 -> 무(4)
      6, // 정일 -> 경(6)
      8, // 무일 -> 임(8)
      0, // 기일 -> 갑(0)
      2, // 경일 -> 병(2)
      4, // 신일 -> 무(4)
      6, // 임일 -> 경(6)
      8  // 계일 -> 임(8)
    ];
    
    const firstTimeStem = firstTimeStemMap[dayStemIndex];
    
    // 시간을 지지로 변환
    const timeBranchKorean = CalendarConverter.getTimeToEarthlyBranch(birthTime);
    
    // 한글 지지를 중국어 지지로 변환
    const branchMap: { [key: string]: string } = {
      '자': '子', '축': '丑', '인': '寅', '묘': '卯',
      '진': '辰', '사': '巳', '오': '午', '미': '未',
      '신': '申', '유': '酉', '술': '戌', '해': '亥'
    };
    
    const timeBranchChinese = branchMap[timeBranchKorean];
    const timeBranchIndex = getBranchIndex(timeBranchChinese);
    
    // 자시(0)부터의 오프셋
    const timeOffset = timeBranchIndex;
    const timeStemIndex = (firstTimeStem + timeOffset) % 10;
    
    return {
      stem: HEAVENLY_STEMS[timeStemIndex].chinese,
      branch: timeBranchChinese
    };
  }
}

/**
 * 간단한 검증을 위한 헬퍼 함수
 */
export function validatePillars(pillars: SajuPillars): boolean {
  const isValidStem = (stem: string) => HEAVENLY_STEMS.some(s => s.chinese === stem);
  const isValidBranch = (branch: string) => EARTHLY_BRANCHES.some(b => b.chinese === branch);
  
  return (
    isValidStem(pillars.year.stem) &&
    isValidBranch(pillars.year.branch) &&
    isValidStem(pillars.month.stem) &&
    isValidBranch(pillars.month.branch) &&
    isValidStem(pillars.day.stem) &&
    isValidBranch(pillars.day.branch) &&
    isValidStem(pillars.time.stem) &&
    isValidBranch(pillars.time.branch)
  );
}