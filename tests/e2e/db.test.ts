import { getProfileByUserId } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/client';

describe('Database Integration Tests', () => {
  // 실제 Supabase 클라이언트 사용
  const supabase = createClient();

  // 테스트용 프로필 데이터
  const testProfile = {
    user_id: '29b0af00-668d-4add-9d61-80bf906d7963',
    name: '게스트 29b0af',
    avatar_url: 'https://avatar.vercel.sh/guest-29b0af',
  };

  // 테스트 전에 데이터 생성
  beforeAll(async () => {
    try {
      // 테스트용 프로필 생성
      await supabase.from('profiles').insert(testProfile);
    } catch (error) {
      console.error('테스트 데이터 생성 실패:', error);
    }
  });

  // 테스트 후 데이터 정리
  afterAll(async () => {
    try {
      // 테스트용 프로필 삭제
      await supabase.from('profiles').delete().eq('user_id', testProfile.user_id);
    } catch (error) {
      console.error('테스트 데이터 정리 실패:', error);
    }
  });

  describe('Profile Queries', () => {
    it('should create and retrieve a profile', async () => {
      // 프로필 조회
      const profile = await getProfileByUserId(testProfile.user_id);

      // 결과 검증
      expect(profile).not.toBeNull();
      expect(profile?.user_id).toBe(testProfile.user_id);
      expect(profile?.name).toBe(testProfile.name);
      expect(profile?.avatar_url).toBe(testProfile.avatar_url);
    });
  });

  // 실제 데이터베이스 로그 확인
  it('should log database operations', async () => {
    // 콘솔 로그 스파이 설정
    const consoleSpy = jest.spyOn(console, 'log');

    // 프로필 조회
    await getProfileByUserId(testProfile.user_id);

    // 로그 확인
    expect(consoleSpy).toHaveBeenCalled();

    // 스파이 정리
    consoleSpy.mockRestore();
  });
});
