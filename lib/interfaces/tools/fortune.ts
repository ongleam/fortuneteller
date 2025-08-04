import { formattingErrorMessage } from '@/lib/shared/utils';
import { tool } from 'ai';
import { z } from 'zod';
import { tools } from '@/config/prompts';
import { getOrCreateProfileByUserKakaoId } from '@/lib/infra/db/queries';
import { getSajuInfoCompatible } from '@/lib/core/saju';

// 오늘 날짜 가져오기 함수
function getToday() {
  return new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

const FORTUNE_PROMPTS = tools.fortune;

export const getTodayFortune = (kakao_user_id: string) =>
  tool({
    description: FORTUNE_PROMPTS.getTodayFortune.description,
    parameters: z.object({}),
    execute: async () => {
      console.log(`[INFO] getTodayFortune 호출: kakao_user_id: ${kakao_user_id}`);

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
        const sajuResult = getSajuInfoCompatible({
          name: profile.name || '',
          gender: profile.gender,
          calendar: profile.birth_type || '양력',
          year: profile.birth_year.toString(),
          month: profile.birth_month.toString(),
          day: profile.birth_day.toString(),
          hour: profile.birth_time || '12',
        });

        console.log(`[INFO] 저장된 정보로 사주 조회 완료: ${kakao_user_id}`);

        return {
          success: true,
          message: '저장된 정보로 사주를 조회했습니다.',
          hasStoredInfo: true,
          today: getToday(),
          userInfo: {
            name: profile.name,
            gender: profile.gender,
            calendar: profile.birth_type,
            year: profile.birth_year,
            month: profile.birth_month,
            day: profile.birth_day,
            hour: profile.birth_time,
          },
          sajuResult,
        };
      } catch (error) {
        console.error('[ERROR] getTodayFortune 실행 실패:', formattingErrorMessage(error));
        return {
          success: false,
          error: formattingErrorMessage(error),
          message: '사주 정보를 불러오는 중 오류가 발생했습니다.',
          hasStoredInfo: false,
        };
      }
    },
  });

export const getYearFortune = (kakao_user_id: string) =>
  tool({
    description: FORTUNE_PROMPTS.getYearFortune.description,
    parameters: z.object({}),
    execute: async () => {
      console.log(`[INFO] getYearFortune 호출: kakao_user_id: ${kakao_user_id}`);

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
        const sajuResult = getSajuInfoCompatible({
          name: profile.name || '',
          gender: profile.gender,
          calendar: profile.birth_type || '양력',
          year: profile.birth_year.toString(),
          month: profile.birth_month.toString(),
          day: profile.birth_day.toString(),
          hour: profile.birth_time || '12',
        });

        console.log(`[INFO] 저장된 정보로 사주 조회 완료: ${kakao_user_id}`);

        return {
          success: true,
          message: '저장된 정보로 사주를 조회했습니다.',
          hasStoredInfo: true,
          today: getToday(),
          userInfo: {
            name: profile.name,
            gender: profile.gender,
            calendar: profile.birth_type,
            year: profile.birth_year,
            month: profile.birth_month,
            day: profile.birth_day,
            hour: profile.birth_time,
          },
          sajuResult,
        };
      } catch (error) {
        console.error('[ERROR] getYearFortune 실행 실패:', formattingErrorMessage(error));
        return {
          success: false,
          error: formattingErrorMessage(error),
          message: '사주 정보를 불러오는 중 오류가 발생했습니다.',
          hasStoredInfo: false,
        };
      }
    },
  });
