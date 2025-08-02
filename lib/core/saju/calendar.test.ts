/**
 * 달력 변환 모듈 테스트
 */

import { CalendarConverter, validateBirthDate, validateBirthTime, normalizeBirthInput, normalizeBirthYear } from './calendar';

describe('CalendarConverter', () => {
  describe('시간 -> 지지 변환', () => {
    test('정각 시간 변환', () => {
      expect(CalendarConverter.getTimeToEarthlyBranch('08')).toBe('진');
      expect(CalendarConverter.getTimeToEarthlyBranch('14')).toBe('미');
      expect(CalendarConverter.getTimeToEarthlyBranch('23')).toBe('자');
    });

    test('시:분 형식 변환', () => {
      expect(CalendarConverter.getTimeToEarthlyBranch('08:30')).toBe('진');
      expect(CalendarConverter.getTimeToEarthlyBranch('14:45')).toBe('미');
    });

    test('경계 시간 테스트', () => {
      expect(CalendarConverter.getTimeToEarthlyBranch('00')).toBe('자');
      expect(CalendarConverter.getTimeToEarthlyBranch('01')).toBe('축');
      expect(CalendarConverter.getTimeToEarthlyBranch('23')).toBe('자');
    });
  });

  describe('사주 기준 년월 계산', () => {
    test('입춘 이후는 해당년도', () => {
      const date = new Date(1995, 3, 25); // 4월 25일
      expect(CalendarConverter.getSajuYear(date)).toBe(1995);
    });

    test('입춘 이전은 이전년도', () => {
      const date = new Date(1995, 0, 15); // 1월 15일
      expect(CalendarConverter.getSajuYear(date)).toBe(1994);
    });
  });

  describe('24절기 계산', () => {
    test('특정 년도 절기 생성', () => {
      const solarTerms = CalendarConverter.getSolarTerms(1995);
      expect(solarTerms).toHaveLength(24);
      expect(solarTerms[0].name).toBe('소한');
      expect(solarTerms[23].name).toBe('동지');
    });
  });
});

describe('유효성 검증', () => {
  test('생년월일 유효성 검증', () => {
    expect(validateBirthDate('1995', '04', '25')).toBe(true);
    expect(validateBirthDate('1800', '04', '25')).toBe(false); // 너무 과거
    expect(validateBirthDate('1995', '13', '25')).toBe(false); // 잘못된 월
    expect(validateBirthDate('1995', '04', '32')).toBe(false); // 잘못된 일
  });

  test('출생시간 유효성 검증', () => {
    expect(validateBirthTime('08')).toBe(true);
    expect(validateBirthTime('08:30')).toBe(true);
    expect(validateBirthTime('25')).toBe(false); // 잘못된 시간
  });
});

describe('입력 정규화', () => {
  test('입력값 정규화', () => {
    const input = {
      name: '  김은식  ',
      gender: 'male',
      calendar: 'solar',
      year: '95',
      month: '4',
      day: '5',
      hour: '8'
    };

    const normalized = normalizeBirthInput(input);
    expect(normalized.name).toBe('김은식');
    expect(normalized.gender).toBe('MALE');
    expect(normalized.calendar).toBe('SOLAR');
    expect(normalized.year).toBe('1995'); // 95 -> 1995로 변환
    expect(normalized.month).toBe('04');
    expect(normalized.day).toBe('05');
  });

  test('2자리 년도 변환 로직', () => {
    // 2025년 기준으로 테스트 (현재)
    expect(normalizeBirthYear('95')).toBe('1995');  // 1900년대
    expect(normalizeBirthYear('05')).toBe('2005');  // 2000년대
    expect(normalizeBirthYear('25')).toBe('2025');  // 2000년대
    expect(normalizeBirthYear('50')).toBe('1950');  // 1900년대
    expect(normalizeBirthYear('88')).toBe('1988');  // 1900년대
    expect(normalizeBirthYear('00')).toBe('2000');  // 2000년대
    
    // 경계값 테스트 (2025년 + 20년 = 45가 threshold)
    expect(normalizeBirthYear('44')).toBe('2044');  // 2000년대
    expect(normalizeBirthYear('45')).toBe('2045');  // 2000년대  
    expect(normalizeBirthYear('46')).toBe('1946');  // 1900년대
    
    // 이미 4자리인 경우
    expect(normalizeBirthYear('1995')).toBe('1995');
    expect(normalizeBirthYear('2005')).toBe('2005');
    
    // 3자리인 경우 (특수한 경우)
    expect(normalizeBirthYear('995')).toBe('0995');
    
    // 1자리인 경우
    expect(normalizeBirthYear('5')).toBe('2005');
    expect(normalizeBirthYear('0')).toBe('2000');
  });
});