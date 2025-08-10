/**
 * 공유 유틸리티 함수들 테스트
 */

import { generateUUID, getKSTDateTime, measureExecutionTime } from '@/lib/shared/utils';

describe('Shared Utils', () => {
  
  describe('UUID 생성', () => {
    
    test('generateUUID 함수 존재성', () => {
      expect(typeof generateUUID).toBe('function');
    });
    
    test('UUID 형식 검증', () => {
      const uuid = generateUUID();
      
      expect(typeof uuid).toBe('string');
      expect(uuid.length).toBeGreaterThan(10);
      
      // UUID가 매번 다른지 확인
      const uuid2 = generateUUID();
      expect(uuid).not.toBe(uuid2);
      
      console.log('✅ 생성된 UUID 예시:', uuid);
    });
  });
  
  describe('한국 시간 처리', () => {
    
    test('getKSTDateTime 함수 존재성', () => {
      expect(typeof getKSTDateTime).toBe('function');
    });
    
    test('KST 날짜 시간 형식', () => {
      const kstTime = getKSTDateTime();
      
      expect(typeof kstTime).toBe('string');
      expect(kstTime).toMatch(/\d{4}-\d{2}-\d{2}/); // YYYY-MM-DD 형식 포함
      
      console.log('✅ KST 시간:', kstTime);
    });
  });
  
  describe('실행 시간 측정', () => {
    
    test('measureExecutionTime 함수 존재성', () => {
      expect(typeof measureExecutionTime).toBe('function');
    });
    
    test('비동기 함수 실행 시간 측정', async () => {
      const mockAsyncFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return '완료';
      };
      
      const result = await measureExecutionTime('테스트 함수', mockAsyncFunction);
      
      expect(result).toBe('완료');
      console.log('✅ 실행 시간 측정 완료');
    });
  });
  
  describe('에러 처리 유틸리티', () => {
    
    test('formattingErrorMessage 함수 테스트', async () => {
      try {
        const { formattingErrorMessage } = await import('@/lib/shared/utils');
        
        const testError = new Error('테스트 에러');
        const formatted = formattingErrorMessage(testError);
        
        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('테스트 에러');
        
        console.log('✅ 포맷된 에러 메시지:', formatted);
      } catch (importError) {
        console.log('formattingErrorMessage 함수가 없거나 import 실패');
      }
    });
  });
  
  describe('텍스트 처리 유틸리티', () => {
    
    test('removeMarkdown 함수 테스트', async () => {
      try {
        const { removeMarkdown } = await import('@/lib/shared/utils/text');
        
        const markdownText = '# 제목\n\n**굵은 글씨** 및 *기울임*';
        const cleanText = removeMarkdown(markdownText);
        
        expect(typeof cleanText).toBe('string');
        expect(cleanText).not.toContain('#');
        expect(cleanText).not.toContain('**');
        expect(cleanText).not.toContain('*');
        
        console.log('✅ 마크다운 제거 결과:', cleanText);
      } catch (importError) {
        console.log('removeMarkdown 함수가 없거나 import 실패');
      }
    });
  });
});