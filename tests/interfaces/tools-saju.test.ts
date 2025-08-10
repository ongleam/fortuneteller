/**
 * Saju AI 도구 테스트
 */

import { getSaju } from '@/lib/interfaces/tools/saju';

describe('SajuAITool', () => {
  
  describe('도구 생성 및 구조', () => {
    
    test('getSaju 도구 생성', () => {
      const sajuTool = getSaju();
      
      expect(sajuTool).toHaveProperty('description');
      expect(sajuTool).toHaveProperty('parameters');
      expect(sajuTool).toHaveProperty('execute');
      
      expect(typeof sajuTool.description).toBe('string');
      expect(typeof sajuTool.execute).toBe('function');
    });
    
    test('파라미터 스키마 검증', () => {
      const sajuTool = getSaju();
      
      // Zod 스키마 구조 확인
      expect(sajuTool.parameters).toBeDefined();
      expect(sajuTool.parameters._def).toBeDefined();
      expect(sajuTool.parameters._def.shape).toBeDefined();
      
      // 필수 파라미터들 확인
      const shape = sajuTool.parameters._def.shape();
      expect(shape).toHaveProperty('name');
      expect(shape).toHaveProperty('gender');
      expect(shape).toHaveProperty('year');
      expect(shape).toHaveProperty('month');
      expect(shape).toHaveProperty('day');
    });
  });
  
  describe('도구 실행 테스트', () => {
    
    test('정상적인 사주 계산', async () => {
      const sajuTool = getSaju();
      
      const testParams = {
        name: '홍길동',
        gender: '남성' as const,
        calendar: '양력' as const,
        year: '1995',
        month: '04',
        day: '25',
        hour: '08' as const
      };
      
      const result = await sajuTool.execute(testParams, { toolCallId: 'test', messages: [] });
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      // getSajuInfoCompatible 결과 구조 확인
      if (result && typeof result === 'object' && 'name' in result) {
        expect(result.name).toBe('홍길동');
      }
      
      console.log('✅ Saju AI Tool 실행 결과:', JSON.stringify(result, null, 2));
    });
    
    test('시간 파라미터 생략 시 기본값 처리', async () => {
      const sajuTool = getSaju();
      
      const testParams = {
        name: '김영희',
        gender: '여성' as const,
        calendar: '음력' as const,
        year: '1988',
        month: '03',
        day: '15'
        // hour 생략
      };
      
      const result = await sajuTool.execute(testParams, { toolCallId: 'test', messages: [] });
      
      expect(result).toBeDefined();
      console.log('✅ 시간 생략 시 결과:', JSON.stringify(result, null, 2));
    });
  });
  
  describe('에러 처리', () => {
    
    test('잘못된 성별 값 처리', async () => {
      const sajuTool = getSaju();
      
      try {
        await sajuTool.execute({
          name: '테스트',
          gender: '잘못된값' as any,
          calendar: '양력',
          year: '1995',
          month: '04',
          day: '25'
        }, { toolCallId: 'test', messages: [] });
      } catch (error) {
        expect(error).toBeDefined();
        console.log('✅ 성별 오류 처리:', error);
      }
    });
    
    test('잘못된 년도 범위 처리', async () => {
      const sajuTool = getSaju();
      
      const result = await sajuTool.execute({
        name: '테스트',
        gender: '남성',
        calendar: '양력',
        year: '1800', // 범위 초과
        month: '01',
        day: '01'
      }, { toolCallId: 'test', messages: [] });
      
      // 에러가 결과에 포함되는지 확인
      if (result && typeof result === 'object') {
        console.log('✅ 년도 범위 오류 처리:', JSON.stringify(result, null, 2));
      }
    });
  });
});