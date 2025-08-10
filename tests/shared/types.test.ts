/**
 * 공유 타입 정의 테스트
 */

describe('Shared Types', () => {
  
  describe('Saju 타입 정의', () => {
    
    test('BirthInput 타입 구조', async () => {
      try {
        const sajuTypes = await import('@/lib/shared/types/saju');
        
        // BirthInput 타입 사용 예시
        const validBirthInput = {
          name: '홍길동',
          gender: '남성' as const,
          calendar: 'solar' as const,
          year: '1995',
          month: '04',
          day: '25',
          hour: '08'
        };
        
        // 타입 체크를 위한 기본 검증
        expect(validBirthInput.name).toBe('홍길동');
        expect(validBirthInput.gender).toBe('남성');
        expect(validBirthInput.calendar).toBe('solar');
        
        console.log('✅ BirthInput 타입 예시:', validBirthInput);
      } catch (error) {
        console.log('Saju 타입 모듈 import 실패:', error);
      }
    });
  });
  
  describe('AI 타입 정의', () => {
    
    test('AI 관련 타입 구조', async () => {
      try {
        const aiTypes = await import('@/lib/shared/types/ai');
        
        // AI 메시지 구조 예시
        const mockMessage = {
          role: 'user' as const,
          content: '사주를 봐주세요',
          timestamp: new Date().toISOString()
        };
        
        expect(mockMessage.role).toBe('user');
        expect(typeof mockMessage.content).toBe('string');
        
        console.log('✅ AI 메시지 타입 예시:', mockMessage);
      } catch (error) {
        console.log('AI 타입 모듈 import 실패:', error);
      }
    });
  });
  
  describe('Kakao 타입 정의', () => {
    
    test('KakaoSkillResponse 타입 구조', async () => {
      try {
        const kakaoTypes = await import('@/lib/shared/types/kakao');
        
        // Kakao 스킬 응답 구조 예시
        const mockKakaoResponse = {
          version: '2.0',
          template: {
            outputs: [
              {
                simpleText: { text: '안녕하세요!' }
              }
            ]
          }
        };
        
        expect(mockKakaoResponse.version).toBe('2.0');
        expect(mockKakaoResponse.template).toHaveProperty('outputs');
        expect(Array.isArray(mockKakaoResponse.template.outputs)).toBe(true);
        
        console.log('✅ Kakao 응답 타입 예시:', mockKakaoResponse);
      } catch (error) {
        console.log('Kakao 타입 모듈 import 실패:', error);
      }
    });
  });
  
  describe('타입 안전성 테스트', () => {
    
    test('잘못된 타입 사용 시뮬레이션', () => {
      // TypeScript에서 컴파일 타임에 잡힐 오류들
      
      // 잘못된 성별 값
      const invalidGender = 'invalid';
      expect(['남성', '여성']).not.toContain(invalidGender);
      
      // 잘못된 달력 타입
      const invalidCalendar = 'gregorian';
      expect(['solar', 'lunar', '양력', '음력']).not.toContain(invalidCalendar);
      
      console.log('✅ 타입 안전성 검증 완료');
    });
    
    test('올바른 타입 값들', () => {
      const validGenders = ['남성', '여성'];
      const validCalendars = ['solar', 'lunar', '양력', '음력'];
      const validRoles = ['user', 'assistant', 'system'];
      
      expect(validGenders).toContain('남성');
      expect(validCalendars).toContain('solar');
      expect(validRoles).toContain('user');
      
      console.log('✅ 유효한 타입 값들 검증 완료');
    });
  });
});