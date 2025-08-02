/**
 * 달력 변환 모듈 테스트
 */

import { normalizeBirthYear } from '@/lib/core/saju/calendar';

describe('CalendarConverter', () => {
  describe('년도 정규화', () => {
    test('2자리 년도 변환 로직', () => {
      // 2025년 기준으로 테스트 (현재)
      expect(normalizeBirthYear('95')).toBe('1995');  // 1900년대
      expect(normalizeBirthYear('05')).toBe('2005');  // 2000년대
      expect(normalizeBirthYear('25')).toBe('2025');  // 2000년대
      expect(normalizeBirthYear('50')).toBe('1950');  // 1900년대
      expect(normalizeBirthYear('88')).toBe('1988');  // 1900년대
      expect(normalizeBirthYear('00')).toBe('2000');  // 2000년대
      
      // 경계값 테스트 (현재년도 + 20년이 threshold)
      expect(normalizeBirthYear('44')).toBe('2044');  // 2000년대
      expect(normalizeBirthYear('45')).toBe('2045');  // 2000년대  
      expect(normalizeBirthYear('46')).toBe('1946');  // 1900년대
      
      // 이미 4자리인 경우
      expect(normalizeBirthYear('1995')).toBe('1995');
      expect(normalizeBirthYear('2005')).toBe('2005');
      
      // 1자리인 경우
      expect(normalizeBirthYear('5')).toBe('2005');
      expect(normalizeBirthYear('0')).toBe('2000');
    });

    test('잘못된 입력 처리', () => {
      expect(() => normalizeBirthYear('')).toThrow();
      expect(() => normalizeBirthYear('abc')).toThrow();
    });
  });

  describe('유효성 검증', () => {
    test('년도 범위 검증', () => {
      // 유효한 범위 (1900-2100)
      expect(parseInt(normalizeBirthYear('1950'))).toBeGreaterThanOrEqual(1900);
      expect(parseInt(normalizeBirthYear('2050'))).toBeLessThanOrEqual(2100);
    });
  });
});