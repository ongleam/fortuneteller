/**
 * 테스트 데이터 생성기
 * 다양한 케이스의 생년월일시 데이터를 생성
 */

import type { BirthInput } from '../../shared/types/saju';

/**
 * 100개의 다양한 테스트 케이스 생성
 */
export function generateTestCases(): BirthInput[] {
  const testCases: BirthInput[] = [];
  
  // 1. 기본 케이스들 (10개)
  testCases.push(
    // 양력 남성
    { name: '홍길동', gender: '남성', year: '1995', month: '4', day: '25', hour: '8', calendar: 'solar' },
    { name: '김철수', gender: '남성', year: '1988', month: '12', day: '31', hour: '23', calendar: 'solar' },
    { name: '박영수', gender: '남성', year: '2000', month: '1', day: '1', hour: '0', calendar: 'solar' },
    
    // 양력 여성
    { name: '김영희', gender: '여성', year: '1992', month: '7', day: '15', hour: '12', calendar: 'solar' },
    { name: '이미나', gender: '여성', year: '1985', month: '3', day: '8', hour: '6', calendar: 'solar' },
    
    // 음력 케이스
    { name: '최민수', gender: '남성', year: '1990', month: '5', day: '20', hour: '14', calendar: 'lunar' },
    { name: '정수연', gender: '여성', year: '1987', month: '11', day: '3', hour: '18', calendar: 'lunar' },
    { name: '김대중', gender: '남성', year: '1980', month: '2', day: '29', hour: '9', calendar: 'lunar' },
    
    // 2자리 년도 케이스
    { name: '송하늘', gender: '여성', year: '95', month: '6', day: '10', hour: '15', calendar: 'solar' },
    { name: '윤바다', gender: '남성', year: '03', month: '9', day: '27', hour: '21', calendar: 'solar' }
  );
  
  // 2. 년도별 케이스 (20개) - 1970년대부터 2020년대까지
  const years = ['1970', '1975', '1980', '1985', '1990', '1995', '2000', '2005', '2010', '2015', '2020'];
  const months = ['1', '3', '6', '9', '12'];
  const days = ['1', '8', '15', '22', '28'];
  const hours = ['3', '9', '15', '21'];
  
  for (let i = 0; i < 20; i++) {
    const year = years[i % years.length];
    const month = months[i % months.length];
    const day = days[i % days.length];
    const hour = hours[i % hours.length];
    const gender = i % 2 === 0 ? '남성' : '여성';
    const calendar = i % 3 === 0 ? 'lunar' : 'solar';
    
    testCases.push({
      name: `테스트${i + 11}`,
      gender,
      year,
      month,
      day,
      hour,
      calendar
    });
  }
  
  // 3. 월별 케이스 (12개) - 각 월의 특성 테스트
  for (let month = 1; month <= 12; month++) {
    const maxDay = month === 2 ? 28 : [4, 6, 9, 11].includes(month) ? 30 : 31;
    const day = Math.floor(maxDay / 2);
    
    testCases.push({
      name: `월테스트${month}`,
      gender: month % 2 === 0 ? '여성' : '남성',
      year: '1990',
      month: month.toString(),
      day: day.toString(),
      hour: (month * 2 % 24).toString(),
      calendar: month % 4 === 0 ? 'lunar' : 'solar'
    });
  }
  
  // 4. 시간별 케이스 (12개) - 12지지 시간 테스트
  const timeSlots = [
    { hour: '23', name: '자시' }, { hour: '1', name: '축시' }, { hour: '3', name: '인시' },
    { hour: '5', name: '묘시' }, { hour: '7', name: '진시' }, { hour: '9', name: '사시' },
    { hour: '11', name: '오시' }, { hour: '13', name: '미시' }, { hour: '15', name: '신시' },
    { hour: '17', name: '유시' }, { hour: '19', name: '술시' }, { hour: '21', name: '해시' }
  ];
  
  timeSlots.forEach((slot, i) => {
    testCases.push({
      name: `시간테스트_${slot.name}`,
      gender: i % 2 === 0 ? '남성' : '여성',
      year: '1995',
      month: '6',
      day: '15',
      hour: slot.hour,
      calendar: 'solar'
    });
  });
  
  // 5. 특수 날짜 케이스 (15개)
  const specialDates = [
    // 절기 관련
    { month: '2', day: '4', name: '입춘' },
    { month: '5', day: '6', name: '입하' },
    { month: '8', day: '8', name: '입추' },
    { month: '11', day: '8', name: '입동' },
    
    // 월말/월초
    { month: '1', day: '31', name: '1월말' },
    { month: '4', day: '30', name: '4월말' },
    { month: '2', day: '28', name: '2월말' },
    
    // 특별한 날
    { month: '12', day: '25', name: '크리스마스' },
    { month: '10', day: '9', name: '한글날' },
    { month: '3', day: '1', name: '삼일절' },
    { month: '5', day: '5', name: '어린이날' },
    { month: '6', day: '6', name: '현충일' },
    { month: '8', day: '15', name: '광복절' },
    { month: '9', day: '9', name: '중양절' },
    { month: '10', day: '3', name: '개천절' }
  ];
  
  specialDates.forEach((date, i) => {
    testCases.push({
      name: `특수날짜_${date.name}`,
      gender: i % 2 === 0 ? '여성' : '남성',
      year: '1993',
      month: date.month,
      day: date.day,
      hour: ((i * 2 + 8) % 24).toString(),
      calendar: i % 3 === 0 ? 'lunar' : 'solar'
    });
  });
  
  // 6. 경계값 테스트 (10개)
  const boundaryTests = [
    // 년도 경계
    { year: '1900', month: '1', day: '1', hour: '0', name: '최소년도' },
    { year: '2099', month: '12', day: '31', hour: '23', name: '최대년도' },
    
    // 월 경계
    { year: '2000', month: '1', day: '1', hour: '12', name: '년초' },
    { year: '2000', month: '12', day: '31', hour: '12', name: '년말' },
    
    // 일 경계
    { year: '2000', month: '6', day: '1', hour: '6', name: '월초' },
    { year: '2000', month: '6', day: '30', hour: '18', name: '월말' },
    
    // 시간 경계
    { year: '2000', month: '6', day: '15', hour: '0', name: '자정' },
    { year: '2000', month: '6', day: '15', hour: '12', name: '정오' },
    { year: '2000', month: '6', day: '15', hour: '6', name: '새벽' },
    { year: '2000', month: '6', day: '15', hour: '18', name: '저녁' }
  ];
  
  boundaryTests.forEach((test, i) => {
    testCases.push({
      name: `경계값_${test.name}`,
      gender: i % 2 === 0 ? '남성' : '여성',
      year: test.year,
      month: test.month,
      day: test.day,
      hour: test.hour,
      calendar: i % 2 === 0 ? 'solar' : 'lunar'
    });
  });
  
  // 7. 2자리 년도 집중 테스트 (10개)
  const twoDigitYears = ['95', '88', '03', '17', '99', '00', '50', '75', '33', '66'];
  twoDigitYears.forEach((year, i) => {
    testCases.push({
      name: `2자리년도_${year}`,
      gender: i % 2 === 0 ? '여성' : '남성',
      year,
      month: ((i % 12) + 1).toString(),
      day: ((i % 28) + 1).toString(),
      hour: (i * 2).toString(),
      calendar: i % 2 === 0 ? 'solar' : 'lunar'
    });
  });
  
  // 8. 음력 집중 테스트 (10개)
  const lunarSpecial = [
    { month: '1', day: '1', name: '음력새해' },
    { month: '1', day: '15', name: '대보름' },
    { month: '8', day: '15', name: '추석' },
    { month: '5', day: '5', name: '단오' },
    { month: '7', day: '7', name: '칠석' },
    { month: '9', day: '9', name: '중양절' },
    { month: '12', day: '8', name: '라바절' },
    { month: '3', day: '3', name: '삼짇날' },
    { month: '6', day: '15', name: '유두' },
    { month: '10', day: '1', name: '상달' }
  ];
  
  lunarSpecial.forEach((lunar, i) => {
    testCases.push({
      name: `음력특수_${lunar.name}`,
      gender: i % 2 === 0 ? '남성' : '여성',
      year: '1992',
      month: lunar.month,
      day: lunar.day,
      hour: ((i * 3) % 24).toString(),
      calendar: 'lunar'
    });
  });
  
  // 9. 극값 테스트 (10개) - 정확히 100개를 맞추기 위해
  const extremeTests = [
    { year: '1901', month: '2', day: '28', hour: '1', name: '평년2월' },
    { year: '2000', month: '2', day: '29', hour: '2', name: '윤년2월' },
    { year: '1999', month: '12', day: '31', hour: '23', name: '밀레니엄직전' },
    { year: '2001', month: '1', day: '1', hour: '0', name: '새천년' },
    { year: '1950', month: '6', day: '25', name: '한국전쟁', hour: '6' },
    { year: '1945', month: '8', day: '15', name: '광복', hour: '15' },
    { year: '1919', month: '3', day: '1', name: '삼일운동', hour: '10' },
    { year: '1988', month: '9', day: '17', name: '서울올림픽', hour: '14' },
    { year: '2002', month: '5', day: '31', name: '월드컵', hour: '20' },
    { year: '1997', month: '7', day: '1', name: 'IMF', hour: '9' }
  ];
  
  extremeTests.forEach((test, i) => {
    testCases.push({
      name: `극값_${test.name}`,
      gender: i % 2 === 0 ? '여성' : '남성',
      year: test.year,
      month: test.month,
      day: test.day,
      hour: test.hour,
      calendar: i % 3 === 0 ? 'lunar' : 'solar'
    });
  });
  
  return testCases;
}

/**
 * 테스트 케이스 검증
 */
export function validateTestCases(testCases: BirthInput[]): { valid: number; invalid: number; errors: string[] } {
  let valid = 0;
  let invalid = 0;
  const errors: string[] = [];
  
  testCases.forEach((testCase, index) => {
    try {
      // 기본 필드 검증
      if (!testCase.year || !testCase.month || !testCase.day || !testCase.hour) {
        throw new Error('필수 필드 누락');
      }
      
      // 년도 범위 검증
      const year = parseInt(testCase.year.length <= 2 ? 
        (parseInt(testCase.year) <= 30 ? `20${testCase.year}` : `19${testCase.year}`) : 
        testCase.year
      );
      
      if (year < 1900 || year > 2100) {
        throw new Error(`년도 범위 오류: ${year}`);
      }
      
      // 월/일/시 범위 검증
      const month = parseInt(testCase.month);
      const day = parseInt(testCase.day);
      const hour = parseInt(testCase.hour);
      
      if (month < 1 || month > 12) throw new Error(`월 범위 오류: ${month}`);
      if (day < 1 || day > 31) throw new Error(`일 범위 오류: ${day}`);
      if (hour < 0 || hour > 23) throw new Error(`시간 범위 오류: ${hour}`);
      
      valid++;
    } catch (error) {
      invalid++;
      errors.push(`케이스 ${index + 1} (${testCase.name}): ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  
  return { valid, invalid, errors };
}

/**
 * 테스트 케이스 통계
 */
export function getTestCaseStats(testCases: BirthInput[]) {
  const stats = {
    total: testCases.length,
    byGender: { 남성: 0, 여성: 0 },
    byCalendar: { solar: 0, lunar: 0 },
    byDecade: {} as Record<string, number>,
    by2DigitYear: 0
  };
  
  testCases.forEach(testCase => {
    // 성별 통계
    stats.byGender[testCase.gender as '남성' | '여성']++;
    
    // 달력 통계
    stats.byCalendar[testCase.calendar as 'solar' | 'lunar' || 'solar']++;
    
    // 2자리 년도 통계
    if (testCase.year.length <= 2) {
      stats.by2DigitYear++;
    }
    
    // 연대별 통계
    const year = parseInt(testCase.year.length <= 2 ? 
      (parseInt(testCase.year) <= 30 ? `20${testCase.year}` : `19${testCase.year}`) : 
      testCase.year
    );
    const decade = `${Math.floor(year / 10) * 10}년대`;
    stats.byDecade[decade] = (stats.byDecade[decade] || 0) + 1;
  });
  
  return stats;
}