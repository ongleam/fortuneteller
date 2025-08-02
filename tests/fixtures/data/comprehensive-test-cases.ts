/**
 * 종합 테스트 케이스 - 100개
 * fetchSaju 검증 데이터 기반으로 생성된 포괄적인 테스트 케이스들
 */

import type { BirthInput } from '@/lib/shared/types/saju';

/**
 * 100개의 다양한 테스트 케이스 생성
 * fetchSaju와의 호환성 검증을 위한 데이터
 */
export function generateComprehensiveTestCases(): BirthInput[] {
  const testCases: BirthInput[] = [];

  // 1. fetchSaju 검증된 기본 케이스들 (20개)
  testCases.push(
    // 양력 남성 케이스
    {
      name: '홍길동',
      gender: '남성',
      year: '1995',
      month: '4',
      day: '25',
      hour: '8',
      calendar: '양력',
    },
    {
      name: '김철수',
      gender: '남성',
      year: '1988',
      month: '12',
      day: '31',
      hour: '23',
      calendar: '양력',
    },
    {
      name: '박영수',
      gender: '남성',
      year: '2000',
      month: '1',
      day: '1',
      hour: '0',
      calendar: '양력',
    },
    {
      name: '이민호',
      gender: '남성',
      year: '1993',
      month: '7',
      day: '18',
      hour: '14',
      calendar: '양력',
    },
    {
      name: '정우성',
      gender: '남성',
      year: '1985',
      month: '9',
      day: '5',
      hour: '10',
      calendar: '양력',
    },

    // 양력 여성 케이스
    {
      name: '김영희',
      gender: '여성',
      year: '1992',
      month: '7',
      day: '15',
      hour: '12',
      calendar: '양력',
    },
    {
      name: '이미나',
      gender: '여성',
      year: '1985',
      month: '3',
      day: '8',
      hour: '6',
      calendar: '양력',
    },
    {
      name: '박소연',
      gender: '여성',
      year: '1990',
      month: '11',
      day: '22',
      hour: '16',
      calendar: '양력',
    },
    {
      name: '최지은',
      gender: '여성',
      year: '1987',
      month: '2',
      day: '14',
      hour: '20',
      calendar: '양력',
    },
    {
      name: '한지민',
      gender: '여성',
      year: '1994',
      month: '10',
      day: '30',
      hour: '4',
      calendar: '양력',
    },

    // 음력 케이스
    {
      name: '최민수',
      gender: '남성',
      year: '1990',
      month: '5',
      day: '20',
      hour: '14',
      calendar: '음력',
    },
    {
      name: '정수연',
      gender: '여성',
      year: '1987',
      month: '11',
      day: '3',
      hour: '18',
      calendar: '음력',
    },
    {
      name: '김대중',
      gender: '남성',
      year: '1980',
      month: '2',
      day: '29',
      hour: '9',
      calendar: '음력',
    },
    {
      name: '윤세아',
      gender: '여성',
      year: '1986',
      month: '8',
      day: '15',
      hour: '13',
      calendar: '음력',
    },
    {
      name: '조인성',
      gender: '남성',
      year: '1981',
      month: '1',
      day: '15',
      hour: '7',
      calendar: '음력',
    },

    // 2자리 년도 케이스
    {
      name: '송하늘',
      gender: '여성',
      year: '95',
      month: '6',
      day: '10',
      hour: '15',
      calendar: '양력',
    },
    {
      name: '윤바다',
      gender: '남성',
      year: '03',
      month: '9',
      day: '27',
      hour: '21',
      calendar: '양력',
    },
    {
      name: '김별',
      gender: '여성',
      year: '88',
      month: '4',
      day: '7',
      hour: '11',
      calendar: '양력',
    },
    {
      name: '이달',
      gender: '남성',
      year: '00',
      month: '12',
      day: '25',
      hour: '17',
      calendar: '양력',
    },
    { name: '박해', gender: '여성', year: '99', month: '5', day: '3', hour: '2', calendar: '양력' }
  );

  // 2. 년도별 체계적 케이스 (30개) - 1970년대부터 2020년대까지
  const systematicYears = [
    '1970',
    '1973',
    '1976',
    '1979',
    '1982',
    '1985',
    '1988',
    '1991',
    '1994',
    '1997',
    '2000',
    '2003',
    '2006',
    '2009',
    '2012',
    '2015',
    '2018',
    '2021',
  ];

  systematicYears.forEach((year, i) => {
    const month = ((i % 12) + 1).toString().padStart(2, '0');
    const day = ((i % 28) + 1).toString().padStart(2, '0');
    const hour = ((i * 2) % 24).toString().padStart(2, '0');
    const gender = i % 2 === 0 ? '남성' : '여성';
    const calendar = i % 3 === 0 ? '음력' : '양력';

    testCases.push({
      name: `체계${year.slice(-2)}`,
      gender,
      year,
      month,
      day,
      hour,
      calendar,
    });
  });

  // 3. 12간지 년도 케이스 (12개)
  const ganjiYears = [
    { year: '1984', name: '쥐띠' },
    { year: '1985', name: '소띠' },
    { year: '1986', name: '호랑이띠' },
    { year: '1987', name: '토끼띠' },
    { year: '1988', name: '용띠' },
    { year: '1989', name: '뱀띠' },
    { year: '1990', name: '말띠' },
    { year: '1991', name: '양띠' },
    { year: '1992', name: '원숭이띠' },
    { year: '1993', name: '닭띠' },
    { year: '1994', name: '개띠' },
    { year: '1995', name: '돼지띠' },
  ];

  ganjiYears.forEach((ganji, i) => {
    testCases.push({
      name: `${ganji.name}_${i + 1}`,
      gender: i % 2 === 0 ? '여성' : '남성',
      year: ganji.year,
      month: '6',
      day: '15',
      hour: ((i * 2 + 8) % 24).toString(),
      calendar: i % 2 === 0 ? '양력' : '음력',
    });
  });

  // 4. 12지지 시간 케이스 (12개)
  const timeSlots = [
    { hour: '23', name: '자시_쥐' },
    { hour: '1', name: '축시_소' },
    { hour: '3', name: '인시_호랑이' },
    { hour: '5', name: '묘시_토끼' },
    { hour: '7', name: '진시_용' },
    { hour: '9', name: '사시_뱀' },
    { hour: '11', name: '오시_말' },
    { hour: '13', name: '미시_양' },
    { hour: '15', name: '신시_원숭이' },
    { hour: '17', name: '유시_닭' },
    { hour: '19', name: '술시_개' },
    { hour: '21', name: '해시_돼지' },
  ];

  timeSlots.forEach((slot, i) => {
    testCases.push({
      name: `시간_${slot.name}`,
      gender: i % 2 === 0 ? '남성' : '여성',
      year: '1990',
      month: '6',
      day: '15',
      hour: slot.hour,
      calendar: '양력',
    });
  });

  // 5. 절기별 특수 케이스 (12개)
  const solarTerms = [
    { month: '2', day: '4', name: '입춘' },
    { month: '3', day: '6', name: '경칩' },
    { month: '4', day: '5', name: '청명' },
    { month: '5', day: '6', name: '입하' },
    { month: '6', day: '6', name: '망종' },
    { month: '7', day: '7', name: '소서' },
    { month: '8', day: '8', name: '입추' },
    { month: '9', day: '8', name: '백로' },
    { month: '10', day: '8', name: '한로' },
    { month: '11', day: '8', name: '입동' },
    { month: '12', day: '7', name: '대설' },
    { month: '1', day: '6', name: '소한' },
  ];

  solarTerms.forEach((term, i) => {
    testCases.push({
      name: `절기_${term.name}`,
      gender: i % 2 === 0 ? '여성' : '남성',
      year: '1992',
      month: term.month,
      day: term.day,
      hour: ((i * 2 + 10) % 24).toString(),
      calendar: '양력',
    });
  });

  // 6. 음력 특수 날짜 케이스 (14개)
  const lunarSpecialDays = [
    { month: '1', day: '1', name: '음력설' },
    { month: '1', day: '15', name: '대보름' },
    { month: '3', day: '3', name: '삼짇날' },
    { month: '4', day: '8', name: '초파일' },
    { month: '5', day: '5', name: '단오' },
    { month: '6', day: '15', name: '유두' },
    { month: '7', day: '7', name: '칠석' },
    { month: '7', day: '15', name: '중원' },
    { month: '8', day: '15', name: '추석' },
    { month: '9', day: '9', name: '중양절' },
    { month: '10', day: '15', name: '상달보름' },
    { month: '11', day: '22', name: '동지' },
    { month: '12', day: '8', name: '성도절' },
    { month: '12', day: '30', name: '그믐' },
  ];

  // 7. 추가 엣지 케이스 (18개) - 100개 달성을 위해
  const edgeCases = [
    // 윤년 케이스
    {
      name: '윤년1',
      gender: '남성',
      year: '2000',
      month: '2',
      day: '29',
      hour: '12',
      calendar: '양력',
    },
    {
      name: '윤년2',
      gender: '여성',
      year: '2004',
      month: '2',
      day: '29',
      hour: '16',
      calendar: '양력',
    },
    {
      name: '윤년3',
      gender: '남성',
      year: '2008',
      month: '2',
      day: '29',
      hour: '20',
      calendar: '양력',
    },

    // 자정/정오 케이스
    {
      name: '자정',
      gender: '여성',
      year: '1995',
      month: '6',
      day: '15',
      hour: '0',
      calendar: '양력',
    },
    {
      name: '정오',
      gender: '남성',
      year: '1995',
      month: '6',
      day: '15',
      hour: '12',
      calendar: '양력',
    },

    // 월말 케이스
    {
      name: '1월말',
      gender: '여성',
      year: '1990',
      month: '1',
      day: '31',
      hour: '10',
      calendar: '양력',
    },
    {
      name: '3월말',
      gender: '남성',
      year: '1990',
      month: '3',
      day: '31',
      hour: '14',
      calendar: '양력',
    },
    {
      name: '5월말',
      gender: '여성',
      year: '1990',
      month: '5',
      day: '31',
      hour: '18',
      calendar: '양력',
    },
    {
      name: '7월말',
      gender: '남성',
      year: '1990',
      month: '7',
      day: '31',
      hour: '22',
      calendar: '양력',
    },
    {
      name: '8월말',
      gender: '여성',
      year: '1990',
      month: '8',
      day: '31',
      hour: '6',
      calendar: '양력',
    },
    {
      name: '10월말',
      gender: '남성',
      year: '1990',
      month: '10',
      day: '31',
      hour: '2',
      calendar: '양력',
    },
    {
      name: '12월말',
      gender: '여성',
      year: '1990',
      month: '12',
      day: '31',
      hour: '23',
      calendar: '양력',
    },

    // 음력 월말 케이스
    {
      name: '음력1월말',
      gender: '남성',
      year: '1995',
      month: '1',
      day: '30',
      hour: '8',
      calendar: '음력',
    },
    {
      name: '음력6월말',
      gender: '여성',
      year: '1995',
      month: '6',
      day: '30',
      hour: '16',
      calendar: '음력',
    },
    {
      name: '음력11월말',
      gender: '남성',
      year: '1995',
      month: '11',
      day: '30',
      hour: '4',
      calendar: '음력',
    },

    // 극한 시간 케이스
    {
      name: '새벽1시',
      gender: '여성',
      year: '1988',
      month: '9',
      day: '12',
      hour: '1',
      calendar: '양력',
    },
    {
      name: '새벽3시',
      gender: '남성',
      year: '1988',
      month: '9',
      day: '12',
      hour: '3',
      calendar: '양력',
    },
    {
      name: '밤11시',
      gender: '여성',
      year: '1988',
      month: '9',
      day: '12',
      hour: '23',
      calendar: '양력',
    },
  ];

  lunarSpecialDays.forEach((day, i) => {
    testCases.push({
      name: `음력_${day.name}`,
      gender: i % 2 === 0 ? '남성' : '여성',
      year: '1989',
      month: day.month,
      day: day.day,
      hour: ((i * 3 + 6) % 24).toString(),
      calendar: '음력',
    });
  });

  // 7. 추가 엣지 케이스 추가
  edgeCases.forEach((caseData) => {
    testCases.push(caseData);
  });

  console.log(`✅ 총 ${testCases.length}개의 종합 테스트 케이스 생성 완료`);
  return testCases;
}

/**
 * 테스트 케이스 통계 정보 생성
 */
export function getTestCaseStats(testCases: BirthInput[]) {
  const stats = {
    total: testCases.length,
    byGender: { 남성: 0, 여성: 0 },
    byCalendar: { 양력: 0, 음력: 0 },
    by2DigitYear: 0,
    byDecade: {} as Record<string, number>,
  };

  testCases.forEach((tc) => {
    // 성별 통계
    stats.byGender[tc.gender as keyof typeof stats.byGender]++;

    // 달력 통계
    stats.byCalendar[tc.calendar as keyof typeof stats.byCalendar]++;

    // 2자리 년도 통계
    if (tc.year.length <= 2) {
      stats.by2DigitYear++;
    }

    // 연대별 통계
    const year =
      tc.year.length <= 2
        ? parseInt(tc.year) < 50
          ? 2000 + parseInt(tc.year)
          : 1900 + parseInt(tc.year)
        : parseInt(tc.year);
    const decade = `${Math.floor(year / 10) * 10}년대`;
    stats.byDecade[decade] = (stats.byDecade[decade] || 0) + 1;
  });

  return stats;
}

/**
 * 테스트 케이스 유효성 검증
 */
export function validateTestCases(testCases: BirthInput[]) {
  const results = {
    valid: 0,
    invalid: 0,
    errors: [] as string[],
  };

  testCases.forEach((tc, index) => {
    try {
      // 필수 필드 검증
      if (!tc.name || !tc.gender || !tc.year || !tc.month || !tc.day || !tc.hour) {
        throw new Error('필수 필드 누락');
      }

      // 년도 검증
      const year =
        tc.year.length <= 2
          ? parseInt(tc.year) < 50
            ? 2000 + parseInt(tc.year)
            : 1900 + parseInt(tc.year)
          : parseInt(tc.year);
      if (year < 1900 || year > 2100) {
        throw new Error(`년도 범위 초과: ${year}`);
      }

      // 월 검증
      const month = parseInt(tc.month);
      if (month < 1 || month > 12) {
        throw new Error(`월 범위 초과: ${month}`);
      }

      // 일 검증
      const day = parseInt(tc.day);
      if (day < 1 || day > 31) {
        throw new Error(`일 범위 초과: ${day}`);
      }

      // 시간 검증
      const hour = parseInt(tc.hour);
      if (hour < 0 || hour > 23) {
        throw new Error(`시간 범위 초과: ${hour}`);
      }

      results.valid++;
    } catch (e) {
      const error = e as Error;
      results.invalid++;
      results.errors.push(`케이스 ${index + 1} (${tc.name}): ${error.message}`);
    }
  });

  return results;
}
