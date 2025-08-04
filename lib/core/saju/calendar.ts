/**
 * 달력은 항상 그레고리력을 기준으로 한다
 * 음력은 그레고리력 기준으로 변환하여 사용한다
 */

import { LUNAR_MONTH_TABLE, SOLAR_TERMS_BY_YEAR, SAJU_MONTH_MAPPING } from './constants';
import { getSolarTermsByYear, getSolarTermByYearAndName } from '@/lib/infra/db/queries';

/**
 * 한글 달력 타입을 영어로 변환하는 유틸 함수
 * @param calendar 한글 또는 영어 달력 타입
 * @returns 영어 달력 타입 ('solar' | 'lunar')
 */
export function normalizeCalendarType(calendar: string): 'solar' | 'lunar' {
  const lowerCalendar = calendar.toLowerCase().trim();

  // 한글 → 영어 변환
  if (lowerCalendar === '양력' || lowerCalendar === 'solar') {
    return 'solar';
  }
  if (lowerCalendar === '음력' || lowerCalendar === 'lunar') {
    return 'lunar';
  }

  // 기본값: 양력
  console.warn(`알 수 없는 달력 타입: ${calendar}, 기본값 'solar' 사용`);
  return 'solar';
}

// validation functions
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
  const hour = parseInt(time.split(':')[0]);
  return hour >= 0 && hour <= 23;
}

// normalize functions
export function normalizeBirthInput(birthInput: any) {
  return {
    name: birthInput.name.trim(),
    gender: birthInput.gender.toUpperCase(),
    calendar: birthInput.calendar.toUpperCase(),
    year: normalizeBirthYear(birthInput.year),
    month: birthInput.month.padStart(2, '0'),
    day: birthInput.day.padStart(2, '0'),
    hour: birthInput.hour,
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

/**
 * 특정 년도에 윤달이 있는 월을 반환하는 함수
 * @param year 음력 년도 (1900-2040)
 * @returns 윤달이 있는 월 번호 (1-12), 윤달이 없으면 0
 */
export function getLeapMonth(year: number): number {
  if (year < 1900 || year > 2040) {
    return 0;
  }

  const lunIndex = year - 1899;

  for (let month = 1; month <= 12; month++) {
    const monthValue = LUNAR_MONTH_TABLE[lunIndex][month - 1];
    // 3, 4, 5, 6은 윤달이 있는 월을 의미
    if (monthValue >= 3) {
      return month;
    }
  }

  return 0;
}

/**
 * 특정 년도와 월에 윤달이 있는지 확인하는 함수
 * @param year 음력 년도 (1900-2040)
 * @param month 음력 월 (1-12)
 * @returns 윤달 존재 여부
 */
export function hasLeapMonth(year: number, month: number): boolean {
  if (year < 1900 || year > 2040 || month < 1 || month > 12) {
    return false;
  }

  const lunIndex = year - 1899;
  const monthValue = LUNAR_MONTH_TABLE[lunIndex][month - 1];

  // 3, 4, 5, 6은 윤달이 있는 월을 의미
  return monthValue >= 3;
}

/**
 * 윤달의 일수를 반환하는 함수
 * @param year 음력 년도 (1900-2040)
 * @param month 음력 월 (1-12)
 * @returns 윤달의 일수 (29 또는 30), 윤달이 없으면 0
 */
export function getLeapMonthDays(year: number, month: number): number {
  if (!hasLeapMonth(year, month)) {
    return 0;
  }

  const lunIndex = year - 1899;
  const monthValue = LUNAR_MONTH_TABLE[lunIndex][month - 1];

  // 3, 5 = 윤달이 29일 (작은달)
  // 4, 6 = 윤달이 30일 (큰달)
  if (monthValue === 3 || monthValue === 5) {
    return 29;
  } else if (monthValue === 4 || monthValue === 6) {
    return 30;
  }

  return 0;
}

/**
 * 음력 날짜를 양력으로 변환하는 함수
 * @param year 음력 년도 (1900-2040)
 * @param month 음력 월 (1-12)
 * @param day 음력 일 (1-30)
 * @param isLeapMonth 윤달 여부 (생략 시 자동 판단: 윤달이 있으면 일반 달, 없으면 그대로)
 * @returns 양력 날짜 객체 { year, month, day }
 */
export function lunarToSolar(
  year: number,
  month: number,
  day: number,
  isLeapMonth?: boolean
): { year: number; month: number; day: number } | null {
  // isLeapMonth가 명시되지 않은 경우 자동 판단
  if (isLeapMonth === undefined) {
    // 해당 월에 윤달이 있는 경우, 일반 달로 처리 (기본값)
    isLeapMonth = false;
  }

  // 윤달을 요청했지만 해당 월에 윤달이 없는 경우
  if (isLeapMonth && !hasLeapMonth(year, month)) {
    return null; // 에러: 존재하지 않는 윤달
  }
  // 음력 월별 일수 테이블 (1900-2042)
  // 1 = 29일 (작은달), 2 = 30일 (큰달)
  // 3,4,5,6 = 윤달이 있는 경우 (3,5=작은달 윤달, 4,6=큰달 윤달)

  // 입력 범위 체크
  if (year < 1900 || year > 2040) {
    return null;
  }

  // 양력 월별 일수
  const solMonthDay = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // 기준일 설정
  let solYear: number, solMonth: number, solDay: number;
  let lunYear: number, lunMonth: number, lunDay: number;
  let lunLeapMonth: number, lunMonthDay: number;

  if (year >= 2000) {
    // 기준일자 양력 2000년 1월 1일 (음력 1999년 11월 25일)
    solYear = 2000;
    solMonth = 1;
    solDay = 1;
    lunYear = 1999;
    lunMonth = 11;
    lunDay = 25;
    lunLeapMonth = 0;
    solMonthDay[1] = 29; // 2000년은 윤년
    lunMonthDay = 30;
  } else if (year >= 1970) {
    // 기준일자 양력 1970년 1월 1일 (음력 1969년 11월 24일)
    solYear = 1970;
    solMonth = 1;
    solDay = 1;
    lunYear = 1969;
    lunMonth = 11;
    lunDay = 24;
    lunLeapMonth = 0;
    solMonthDay[1] = 28;
    lunMonthDay = 30;
  } else if (year >= 1940) {
    // 기준일자 양력 1940년 1월 1일 (음력 1939년 11월 22일)
    solYear = 1940;
    solMonth = 1;
    solDay = 1;
    lunYear = 1939;
    lunMonth = 11;
    lunDay = 22;
    lunLeapMonth = 0;
    solMonthDay[1] = 29; // 1940년은 윤년
    lunMonthDay = 29;
  } else {
    // 기준일자 양력 1900년 1월 1일 (음력 1899년 12월 1일)
    solYear = 1900;
    solMonth = 1;
    solDay = 1;
    lunYear = 1899;
    lunMonth = 12;
    lunDay = 1;
    lunLeapMonth = 0;
    solMonthDay[1] = 28;
    lunMonthDay = 30;
  }

  let lunIndex = lunYear - 1899;

  // 계산 루프
  while (true) {
    // 음력 날짜가 일치하는지 확인
    if (
      year === lunYear &&
      month === lunMonth &&
      day === lunDay &&
      (isLeapMonth ? 1 : 0) === lunLeapMonth
    ) {
      return { year: solYear, month: solMonth, day: solDay };
    }

    // 양력 날짜 하루 증가
    if (solMonth === 12 && solDay === 31) {
      solYear++;
      solMonth = 1;
      solDay = 1;

      // 윤년 체크
      if (solYear % 400 === 0) {
        solMonthDay[1] = 29;
      } else if (solYear % 100 === 0) {
        solMonthDay[1] = 28;
      } else if (solYear % 4 === 0) {
        solMonthDay[1] = 29;
      } else {
        solMonthDay[1] = 28;
      }
    } else if (solMonthDay[solMonth - 1] === solDay) {
      solMonth++;
      solDay = 1;
    } else {
      solDay++;
    }

    // 음력 날짜 하루 증가
    if (
      lunMonth === 12 &&
      ((LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 1 && lunDay === 29) ||
        (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 2 && lunDay === 30))
    ) {
      lunYear++;
      lunMonth = 1;
      lunDay = 1;

      if (lunYear > 2043) {
        return null;
      }

      lunIndex = lunYear - 1899;

      if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 1) {
        lunMonthDay = 29;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 2) {
        lunMonthDay = 30;
      }
    } else if (lunDay === lunMonthDay) {
      if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] >= 3 && lunLeapMonth === 0) {
        lunDay = 1;
        lunLeapMonth = 1;
      } else {
        lunMonth++;
        lunDay = 1;
        lunLeapMonth = 0;
      }

      if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 1) {
        lunMonthDay = 29;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 2) {
        lunMonthDay = 30;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 3) {
        lunMonthDay = 29;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 4 && lunLeapMonth === 0) {
        lunMonthDay = 29;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 4 && lunLeapMonth === 1) {
        lunMonthDay = 30;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 5 && lunLeapMonth === 0) {
        lunMonthDay = 30;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 5 && lunLeapMonth === 1) {
        lunMonthDay = 29;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 6) {
        lunMonthDay = 30;
      }
    } else {
      lunDay++;
    }
  }
}

/**
 * 양력 날짜를 음력으로 변환하는 함수
 * @param solarDate 양력 Date 객체
 * @returns 음력 날짜 객체 { year, month, day, isLeapMonth }
 */
export function solarToLunar(solarDate: Date): {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
} | null {
  const year = solarDate.getFullYear();
  const month = solarDate.getMonth() + 1;
  const day = solarDate.getDate();

  // 입력 범위 체크
  if (year < 1900 || year > 2040) {
    return null;
  }

  // 양력 월별 일수
  const solMonthDay = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // 기준일 설정
  let solYear: number, solMonth: number, solDay: number;
  let lunYear: number, lunMonth: number, lunDay: number;
  let lunLeapMonth: number, lunMonthDay: number;

  if (year >= 2000) {
    // 기준일자 양력 2000년 1월 1일 (음력 1999년 11월 25일)
    solYear = 2000;
    solMonth = 1;
    solDay = 1;
    lunYear = 1999;
    lunMonth = 11;
    lunDay = 25;
    lunLeapMonth = 0;
    solMonthDay[1] = 29; // 2000년은 윤년
    lunMonthDay = 30;
  } else if (year >= 1970) {
    // 기준일자 양력 1970년 1월 1일 (음력 1969년 11월 24일)
    solYear = 1970;
    solMonth = 1;
    solDay = 1;
    lunYear = 1969;
    lunMonth = 11;
    lunDay = 24;
    lunLeapMonth = 0;
    solMonthDay[1] = 28;
    lunMonthDay = 30;
  } else if (year >= 1940) {
    // 기준일자 양력 1940년 1월 1일 (음력 1939년 11월 22일)
    solYear = 1940;
    solMonth = 1;
    solDay = 1;
    lunYear = 1939;
    lunMonth = 11;
    lunDay = 22;
    lunLeapMonth = 0;
    solMonthDay[1] = 29; // 1940년은 윤년
    lunMonthDay = 29;
  } else {
    // 기준일자 양력 1900년 1월 1일 (음력 1899년 12월 1일)
    solYear = 1900;
    solMonth = 1;
    solDay = 1;
    lunYear = 1899;
    lunMonth = 12;
    lunDay = 1;
    lunLeapMonth = 0;
    solMonthDay[1] = 28;
    lunMonthDay = 30;
  }

  let lunIndex = lunYear - 1899;

  // 계산 루프
  while (true) {
    // 양력 날짜가 일치하는지 확인
    if (year === solYear && month === solMonth && day === solDay) {
      return {
        year: lunYear,
        month: lunMonth,
        day: lunDay,
        isLeapMonth: lunLeapMonth === 1,
      };
    }

    // 양력 날짜 하루 증가
    if (solMonth === 12 && solDay === 31) {
      solYear++;
      solMonth = 1;
      solDay = 1;

      // 윤년 체크
      if (solYear % 400 === 0) {
        solMonthDay[1] = 29;
      } else if (solYear % 100 === 0) {
        solMonthDay[1] = 28;
      } else if (solYear % 4 === 0) {
        solMonthDay[1] = 29;
      } else {
        solMonthDay[1] = 28;
      }
    } else if (solMonthDay[solMonth - 1] === solDay) {
      solMonth++;
      solDay = 1;
    } else {
      solDay++;
    }

    // 음력 날짜 하루 증가
    if (
      lunMonth === 12 &&
      ((LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 1 && lunDay === 29) ||
        (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 2 && lunDay === 30))
    ) {
      lunYear++;
      lunMonth = 1;
      lunDay = 1;

      if (lunYear > 2043) {
        return null;
      }

      lunIndex = lunYear - 1899;

      if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 1) {
        lunMonthDay = 29;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 2) {
        lunMonthDay = 30;
      }
    } else if (lunDay === lunMonthDay) {
      if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] >= 3 && lunLeapMonth === 0) {
        lunDay = 1;
        lunLeapMonth = 1;
      } else {
        lunMonth++;
        lunDay = 1;
        lunLeapMonth = 0;
      }

      if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 1) {
        lunMonthDay = 29;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 2) {
        lunMonthDay = 30;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 3) {
        lunMonthDay = 29;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 4 && lunLeapMonth === 0) {
        lunMonthDay = 29;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 4 && lunLeapMonth === 1) {
        lunMonthDay = 30;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 5 && lunLeapMonth === 0) {
        lunMonthDay = 30;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 5 && lunLeapMonth === 1) {
        lunMonthDay = 29;
      } else if (LUNAR_MONTH_TABLE[lunIndex][lunMonth - 1] === 6) {
        lunMonthDay = 30;
      }
    } else {
      lunDay++;
    }
  }
}

/**
 * 사주 년도 계산 (입춘 기준)
 * @param solarDate 양력 날짜
 * @returns 사주 년도 (절기 기준)
 */
export async function getSajuYear(solarDate: Date): Promise<number> {
  const year = solarDate.getFullYear();

  try {
    // 데이터베이스에서 입춘 절기 조회
    const lichun = await getSolarTermByYearAndName(year, '입춘');

    if (lichun) {
      const lichunDate = new Date(year, lichun.month - 1, lichun.day, lichun.hour, lichun.minute);

      if (solarDate < lichunDate) {
        return year - 1;
      }
      return year;
    }
  } catch (error) {
    console.warn(`Failed to get solar term data for year ${year}, using fallback`);
  }

  // 데이터베이스에 데이터가 없는 경우 상수에서 조회
  if (SOLAR_TERMS_BY_YEAR[year]) {
    const lichun = SOLAR_TERMS_BY_YEAR[year].입춘;
    const lichunDate = new Date(year, lichun.month - 1, lichun.day, lichun.hour, lichun.minute);

    if (solarDate < lichunDate) {
      return year - 1;
    }
    return year;
  }

  // 절기 데이터가 없는 경우 평균값 사용 (기존 로직)
  const month = solarDate.getMonth() + 1;
  const day = solarDate.getDate();
  const lichunMonth = 2;
  const lichunDay = 4;

  if (month < lichunMonth || (month === lichunMonth && day < lichunDay)) {
    return year - 1;
  }

  return year;
}

/**
 * 사주 월 계산 (절기 기준)
 * @param solarDate 양력 날짜
 * @returns 사주 월 (1-12, 절기 기준)
 */
export async function getSajuMonth(solarDate: Date): Promise<number> {
  const year = solarDate.getFullYear();

  try {
    const termsForYear = await getSolarTermsByYear(year);
    const termsForPrevYear = await getSolarTermsByYear(year - 1);
    const allTerms = [...termsForPrevYear, ...termsForYear];

    console.log('[DEBUG] allTerms:', allTerms);
    const findTermDate = (name: string, searchYear: number): Date | null => {
      const term = allTerms.find((t) => t.year === searchYear && t.term_name === name);
      if (!term) return null;
      return new Date(term.year, term.month - 1, term.day, term.hour, term.minute);
    };

    const termNames = [
      { sajuMonth: 1, name: '입춘' },
      { sajuMonth: 2, name: '경칩' },
      { sajuMonth: 3, name: '청명' },
      { sajuMonth: 4, name: '입하' },
      { sajuMonth: 5, name: '망종' },
      { sajuMonth: 6, name: '소서' },
      { sajuMonth: 7, name: '입추' },
      { sajuMonth: 8, name: '백로' },
      { sajuMonth: 9, name: '한로' },
      { sajuMonth: 10, name: '입동' },
      { sajuMonth: 11, name: '대설' },
      { sajuMonth: 12, name: '소한' },
    ];

    const monthBoundaries = [
      ...termNames.map((term) => ({ ...term, yr: year })),
      ...termNames.map((term) => ({ ...term, yr: year - 1 })),
    ];

    const boundariesWithDates = monthBoundaries
      .map((b) => ({ ...b, date: findTermDate(b.name, b.yr) }))
      .filter((b) => b.date)
      .sort((a, b) => b.date!.getTime() - a.date!.getTime());

    for (const boundary of boundariesWithDates) {
      if (solarDate >= boundary.date!) {
        return boundary.sajuMonth;
      }
    }

    // Default to 축월 if no boundary matches (e.g. before any known terms)
    return 12;
  } catch (error) {
    console.warn(`Failed to get solar terms data for year ${year}, using fallback`);
    // Fallback logic remains unchanged
    const month = solarDate.getMonth() + 1;
    const day = solarDate.getDate();

    const monthTerms = [
      { sajuMonth: 1, termMonth: 2, termDay: 4 }, // 입춘 (인월 시작)
      { sajuMonth: 2, termMonth: 3, termDay: 6 }, // 경칩 (묘월 시작)
      { sajuMonth: 3, termMonth: 4, termDay: 5 }, // 청명 (진월 시작)
      { sajuMonth: 4, termMonth: 5, termDay: 6 }, // 입하 (사월 시작)
      { sajuMonth: 5, termMonth: 6, termDay: 6 }, // 망종 (오월 시작)
      { sajuMonth: 6, termMonth: 7, termDay: 7 }, // 소서 (미월 시작)
      { sajuMonth: 7, termMonth: 8, termDay: 8 }, // 입추 (신월 시작)
      { sajuMonth: 8, termMonth: 9, termDay: 8 }, // 백로 (유월 시작)
      { sajuMonth: 9, termMonth: 10, termDay: 8 }, // 한로 (술월 시작)
      { sajuMonth: 10, termMonth: 11, termDay: 8 }, // 입동 (해월 시작)
      { sajuMonth: 11, termMonth: 12, termDay: 7 }, // 대설 (자월 시작)
      { sajuMonth: 12, termMonth: 1, termDay: 6 }, // 소한 (축월 시작)
    ];

    for (let i = 0; i < monthTerms.length; i++) {
      const currentTerm = monthTerms[i];
      const nextTerm = monthTerms[(i + 1) % monthTerms.length];

      if (isDateInRange(month, day, currentTerm, nextTerm)) {
        return currentTerm.sajuMonth;
      }
    }
    return 1;
  }
}

/**
 * 날짜가 두 절기 사이에 있는지 확인하는 헬퍼 함수
 */
function isDateInRange(
  month: number,
  day: number,
  startTerm: { sajuMonth: number; termMonth: number; termDay: number },
  endTerm: { sajuMonth: number; termMonth: number; termDay: number }
): boolean {
  const currentDate = month * 100 + day;
  const startDate = startTerm.termMonth * 100 + startTerm.termDay;
  let endDate = endTerm.termMonth * 100 + endTerm.termDay;

  // 연도를 넘나드는 경우 처리 (12월 → 2월)
  if (startTerm.termMonth === 12 && endTerm.termMonth === 2) {
    if (month === 12) {
      return currentDate >= startDate;
    } else if (month === 1 || month === 2) {
      return currentDate < endDate;
    }
    return false;
  }

  // 연말-연초 경계 처리 (11월 → 12월)
  if (startTerm.termMonth > endTerm.termMonth) {
    endDate += 1200; // 다음년도로 처리
    if (month >= startTerm.termMonth) {
      return currentDate >= startDate;
    } else {
      return currentDate + 1200 < endDate;
    }
  }

  // 일반적인 경우
  return currentDate >= startDate && currentDate < endDate;
}
