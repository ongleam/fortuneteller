import { formattingErrorMessage } from '@/lib/utils';
import { tool } from 'ai';
import { z } from 'zod';
import { tools } from '@/config/prompts';
import { getOrCreateProfileByUserKakaoId } from '@/lib/db/queries';
import { fetchHarmony } from '@/lib/utils/harmony';

const HARMONY_PROMPTS = tools.harmony;

export const getHarmony = (kakao_user_id: string) =>
  tool({
    description: HARMONY_PROMPTS.getHarmony.description,
    parameters: z.object({
      name: z.string().describe(HARMONY_PROMPTS.getHarmony.parameters.name.description),
      gender: z
        .enum(['남성', '여성'])
        .describe(HARMONY_PROMPTS.getHarmony.parameters.gender.description),
      birthType: z
        .enum(['양력', '음력'])
        .default('양력')
        .describe(HARMONY_PROMPTS.getHarmony.parameters.birthType.description),
      birthYear: z.string().describe(HARMONY_PROMPTS.getHarmony.parameters.birthYear.description),
      birthMonth: z.string().describe(HARMONY_PROMPTS.getHarmony.parameters.birthMonth.description),
      birthDay: z.string().describe(HARMONY_PROMPTS.getHarmony.parameters.birthDay.description),
      birthTime: z
        .enum(['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'])
        .nullable()
        .optional()
        .describe(HARMONY_PROMPTS.getHarmony.parameters.birthTime.description),
    }),
    execute: async ({ name, gender, birthType, birthYear, birthMonth, birthDay, birthTime }) => {
      try {
        console.log(
          `[INFO] getHarmony 호출: \nname: ${name}\ngender: ${gender}\nbirthType: ${birthType}\nbirthYear: ${birthYear}\nbirthMonth: ${birthMonth}\nbirthDay: ${birthDay}\nbirthTime: ${birthTime}`
        );

        // 현재 사용자의 프로필 조회
        const userProfile = await getOrCreateProfileByUserKakaoId({ user_kakao_id: kakao_user_id });

        if (!userProfile) {
          throw new Error('사용자 프로필을 찾을 수 없습니다.');
        }

        // 사용자의 사주 정보가 모두 있는지 확인
        if (
          !userProfile.name ||
          !userProfile.gender ||
          !userProfile.birth_type ||
          !userProfile.birth_year ||
          !userProfile.birth_month ||
          !userProfile.birth_day
        ) {
          return {
            success: false,
            error: '사용자의 사주 정보가 부족합니다. 먼저 프로필을 완성해주세요.',
            message:
              '궁합을 보려면 본인의 이름, 성별, 생년월일 정보가 필요해요. 프로필을 먼저 업데이트해주세요!',
          };
        }

        // 궁합 조회 실행
        const harmonyResult = await fetchHarmony(
          // 첫 번째 사람 (현재 사용자)
          userProfile.name,
          userProfile.gender,
          userProfile.birth_type,
          userProfile.birth_year.toString(),
          userProfile.birth_month.toString(),
          userProfile.birth_day.toString(),
          userProfile.birth_time,
          // 두 번째 사람 (상대방)
          name,
          gender,
          birthType,
          birthYear,
          birthMonth,
          birthDay,
          birthTime
        );

        if (!harmonyResult.compatibility && !harmonyResult.analysis) {
          return {
            success: false,
            error: '궁합 조회에 실패했습니다.',
            message: '궁합을 분석하는 중에 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
          };
        }

        return {
          success: true,
          data: {
            user1: {
              name: userProfile.name,
              gender: userProfile.gender,
              birthInfo: `${userProfile.birth_year}년 ${userProfile.birth_month}월 ${userProfile.birth_day}일 (${userProfile.birth_type})`,
            },
            user2: {
              name,
              gender,
              birthInfo: `${birthYear}년 ${birthMonth}월 ${birthDay}일 (${birthType})`,
            },
            compatibility: harmonyResult.compatibility,
            analysis: harmonyResult.analysis,
            advice: harmonyResult.advice,
            rawData: harmonyResult.rawData,
          },
          message: `${userProfile.name}님과 ${name}님의 궁합을 분석했어요!`,
        };
      } catch (error) {
        console.error('[ERROR] getHarmony 실패:', error);

        return {
          success: false,
          error: formattingErrorMessage(error),
          message: '궁합 조회 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
        };
      }
    },
  });
