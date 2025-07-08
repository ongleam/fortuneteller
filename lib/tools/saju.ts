import { formattingErrorMessage } from '@/lib/utils';
import { tool } from 'ai';
import { z } from 'zod';
import { tools } from '@/config/prompts';
import { updateProfile as updateProfile, getOrCreateProfileByUserKakaoId } from '@/lib/db/queries';
import { fetchSaju } from '@/lib/utils/saju';

const GET_USER_SAJU_PROMPTS = tools.getSaju;

export const getSaju = (kakao_user_id: string) =>
  tool({
    description: GET_USER_SAJU_PROMPTS.description,
    parameters: z.object({}),
    execute: async () => {
      console.log(`[INFO] getUserSaju 호출: kakao_user_id: ${kakao_user_id}`);

      try {
        // 카카오 유저 프로필 조회
        const profile = await getOrCreateProfileByUserKakaoId({ user_kakao_id: kakao_user_id });

        // 사주 정보가 저장되어 있는지 확인
        if (!profile.gender || !profile.birth_year || !profile.birth_month || !profile.birth_day) {
          return {
            success: false,
            message: '저장된 사주 정보가 없습니다.',
            hasStoredInfo: false,
            suggestion:
              '사주 정보를 먼저 입력해주세요. "내 사주 정보 등록하기"라고 말씀해주시면 됩니다.',
          };
        }

        // 저장된 정보로 사주 조회
        const sajuResult = await fetchSaju(
          profile.name || '',
          profile.gender,
          profile.birth_type || '양력',
          profile.birth_year.toString(),
          profile.birth_month.toString(),
          profile.birth_day.toString(),
          profile.birth_time
        );

        console.log(`[INFO] 저장된 정보로 사주 조회 완료: ${kakao_user_id}`);

        return {
          success: true,
          message: '저장된 정보로 사주를 조회했습니다.',
          hasStoredInfo: true,
          userInfo: {
            name: profile.name,
            gender: profile.gender,
            birthType: profile.birth_type,
            birthYear: profile.birth_year,
            birthMonth: profile.birth_month,
            birthDay: profile.birth_day,
            birthTime: profile.birth_time,
          },
          sajuResult,
        };
      } catch (error) {
        console.error('[ERROR] getUserSaju 실행 실패:', formattingErrorMessage(error));
        return {
          success: false,
          error: formattingErrorMessage(error),
          message: '사주 정보를 불러오는 중 오류가 발생했습니다.',
          hasStoredInfo: false,
        };
      }
    },
  });
