/**
 * 달력 변환 및 절기 계산 유틸리티
 */

// 24절기 데이터 (양력 기준 근사치)
const SOLAR_TERMS = [
  { name: '소한', month: 1, day: 6 },   // 1월
  { name: '대한', month: 1, day: 20 },
  { name: '입춘', month: 2, day: 4 },   // 2월
  { name: '우수', month: 2, day: 19 },
  { name: '경칩', month: 3, day: 6 },   // 3월
  { name: '춘분', month: 3, day: 21 },
  { name: '청명', month: 4, day: 5 },   // 4월
  { name: '곡우', month: 4, day: 20 },
  { name: '입하', month: 5, day: 6 },   // 5월
  { name: '소만', month: 5, day: 21 },
  { name: '망종', month: 6, day: 6 },   // 6월
  { name: '하지', month: 6, day: 21 },
  { name: '소서', month: 7, day: 7 },   // 7월
  { name: '대서', month: 7, day: 23 },
  { name: '입추', month: 8, day: 8 },   // 8월
  { name: '처서', month: 8, day: 23 },
  { name: '백로', month: 9, day: 8 },   // 9월
  { name: '추분', month: 9, day: 23 },
  { name: '한로', month: 10, day: 8 },  // 10월
  { name: '상강', month: 10, day: 23 },
  { name: '입동', month: 11, day: 7 },  // 11월
  { name: '소설', month: 11, day: 22 },
  { name: '대설', month: 12, day: 7 },  // 12월
  { name: '동지', month: 12, day: 22 }
];

interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
}

interface SolarDate {
  year: number;
  month: number;
  day: number;
}

interface SolarTerm {
  name: string;
  date: Date;
}

/**
 * 달력 변환 유틸리티 클래스
 */
export class CalendarConverter {
  
  /**
   * 양력을 음력으로 변환 (간단한 근사치 구현)
   * 실제로는 복잡한 천문학적 계산이 필요하지만, 
   * 여기서는 기본적인 변환만 구현
   */
  static solarToLunar(year: number, month: number, day: number): LunarDate {
    // 간단한 근사치 계산 (실제 구현시에는 정밀한 변환 테이블 필요)
    // 음력이 양력보다 약 30일 정도 빠름
    let lunarYear = year;
    let lunarMonth = month;
    let lunarDay = day - 30;
    
    if (lunarDay <= 0) {
      lunarMonth -= 1;
      if (lunarMonth <= 0) {
        lunarMonth = 12;
        lunarYear -= 1;
      }
      lunarDay += 30; // 한 달 일수로 보정
    }
    
    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeap: false // 윤달 계산은 복잡하므로 일단 false
    };
  }

  /**
   * 음력을 양력으로 변환
   */
  static lunarToSolar(year: number, month: number, day: number, isLeap: boolean = false): SolarDate {
    // 간단한 근사치 계산
    let solarYear = year;
    let solarMonth = month;
    let solarDay = day + 30;
    
    if (solarDay > 31) {
      solarMonth += 1;
      if (solarMonth > 12) {
        solarMonth = 1;
        solarYear += 1;
      }
      solarDay -= 30;
    }
    
    return {
      year: solarYear,
      month: solarMonth,
      day: solarDay
    };
  }

  /**
   * 특정 년도의 24절기 날짜 계산
   */
  static getSolarTerms(year: number): SolarTerm[] {
    return SOLAR_TERMS.map(term => ({
      name: term.name,
      date: new Date(year, term.month - 1, term.day)
    }));
  }

  /**
   * 사주 기준 월 계산 (절기 기준)
   * 입춘부터 년이 시작되고, 각 월은 절기로 구분
   */
  static getSajuMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 절기 기준으로 월 계산
    // 입춘(2월 4일경) 이전이면 이전년도로 계산
    if (month === 1 || (month === 2 && day < 4)) {
      return 12; // 이전년도 12월로 처리
    }
    
    // 각 절기 기준으로 월 구분
    const solarTerms = this.getSolarTerms(year);
    
    for (let i = 0; i < solarTerms.length; i += 2) {
      const term = solarTerms[i];
      if (date >= term.date) {
        return Math.floor(i / 2) + 1;
      }
    }
    
    return month; // 기본값으로 양력 월 반환
  }

  /**
   * 사주 기준 년도 계산
   * 입춘 이전이면 이전년도로 계산
   */
  static getSajuYear(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 입춘(2월 4일경) 이전이면 이전년도
    if (month === 1 || (month === 2 && day < 4)) {
      return year - 1;
    }
    
    return year;
  }

  /**
   * 시간을 12지지로 변환
   * 23:00-01:00: 자시, 01:00-03:00: 축시, ...
   */
  static getTimeToEarthlyBranch(timeInput: string | number): string {
    // string이면 파싱, number면 그대로 사용
    const hour = typeof timeInput === 'string' 
      ? parseInt(timeInput.split(':')[0])
      : timeInput;
    
    // 12지지 시간 매핑
    const timeMap = [
      '자', // 23-01시
      '축', // 01-03시
      '인', // 03-05시
      '묘', // 05-07시
      '진', // 07-09시
      '사', // 09-11시
      '오', // 11-13시
      '미', // 13-15시
      '신', // 15-17시
      '유', // 17-19시
      '술', // 19-21시
      '해'  // 21-23시
    ];
    
    // 시간대별 매핑
    let timeIndex: number;
    if (hour >= 23 || hour < 1) timeIndex = 0;  // 자시
    else if (hour >= 1 && hour < 3) timeIndex = 1;   // 축시
    else if (hour >= 3 && hour < 5) timeIndex = 2;   // 인시
    else if (hour >= 5 && hour < 7) timeIndex = 3;   // 묘시
    else if (hour >= 7 && hour < 9) timeIndex = 4;   // 진시
    else if (hour >= 9 && hour < 11) timeIndex = 5;  // 사시
    else if (hour >= 11 && hour < 13) timeIndex = 6; // 오시
    else if (hour >= 13 && hour < 15) timeIndex = 7; // 미시
    else if (hour >= 15 && hour < 17) timeIndex = 8; // 신시
    else if (hour >= 17 && hour < 19) timeIndex = 9; // 유시
    else if (hour >= 19 && hour < 21) timeIndex = 10; // 술시
    else timeIndex = 11; // 해시
    
    return timeMap[timeIndex];
  }
}

/**
 * 간단한 유효성 검증 함수들
 */
export function validateBirthDate(year: string, month: string, day: string): boolean {
  const y = parseInt(year);
  const m = parseInt(month);
  const d = parseInt(day);
  
  if (y < 1900 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  
  return true;
}

export function validateBirthTime(time: string): boolean {
  // "08", "08:30", "14" 등의 형식 지원
  const hour = parseInt(time.split(':')[0]);
  return hour >= 0 && hour <= 23;
}

export function normalizeBirthInput(birthInput: any) {
  return {
    name: birthInput.name.trim(),
    gender: birthInput.gender.toUpperCase(),
    birthType: birthInput.birthType.toUpperCase(),
    birthYear: normalizeBirthYear(birthInput.birthYear),
    birthMonth: birthInput.birthMonth.padStart(2, '0'),
    birthDay: birthInput.birthDay.padStart(2, '0'),
    birthTime: birthInput.birthTime
  };
}

/**
 * 생년 정규화 함수
 * 2자리 년도를 4자리로 변환
 * 예: '95' -> '1995', '05' -> '2005', '25' -> '2025'
 */
export function normalizeBirthYear(yearString: string): string {
  const year = parseInt(yearString);
  
  // 이미 4자리 년도인 경우
  if (yearString.length === 4) {
    return yearString;
  }
  
  // 2자리 년도 처리
  if (yearString.length <= 2) {
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const currentYearLastTwo = currentYear % 100;
    
    // 현재 년도 + 20년 이내는 현재 세기, 그 이후는 이전 세기로 판단
    // 예: 2024년 기준으로 44 이하는 2000년대, 45 이상은 1900년대
    const threshold = currentYearLastTwo + 20;
    
    if (year <= threshold) {
      return String(currentCentury + year);
    } else {
      return String(currentCentury - 100 + year);
    }
  }
  
  // 3자리 년도는 앞에 0을 붙임 (예: 995 -> 0995)
  return yearString.padStart(4, '0');
}