import { formattingErrorMessage } from '@/lib/utils';
import { tool } from 'ai';
import { z } from 'zod';
import { tools } from '@/config/prompts';
import { updateProfile } from '@/lib/db/queries';

const PROFILE_PROMPTS = tools.updateUserProfile;

export const updateUserProfile = (kakao_user_id: string) =>
  tool({
    description: PROFILE_PROMPTS.description,
    parameters: z.object({
      name: z.string().describe(PROFILE_PROMPTS.parameters.name.description),
      gender: z.enum(['남성', '여성']).describe(PROFILE_PROMPTS.parameters.gender.description),
      birthType: z
        .enum(['양력', '음력'])
        .default('양력')
        .describe(PROFILE_PROMPTS.parameters.birthType.description),
      birthYear: z.string().describe(PROFILE_PROMPTS.parameters.birthYear.description),
      birthMonth: z.string().describe(PROFILE_PROMPTS.parameters.birthMonth.description),
      birthDay: z.string().describe(PROFILE_PROMPTS.parameters.birthDay.description),
      birthTime: z
        .enum(['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'])
        .nullable()
        .optional()
        .describe(PROFILE_PROMPTS.parameters.birthTime.description),
    }),
    execute: async ({ name, gender, birthType, birthYear, birthMonth, birthDay, birthTime }) => {
      console.log(
        `[INFO] updateSajuProfile 호출: \nname: ${name}\ngender: ${gender}\nbirthType: ${birthType}\nbirthYear: ${birthYear}\nbirthMonth: ${birthMonth}\nbirthDay: ${birthDay}\nbirthTime: ${birthTime}`
      );

      try {
        // 사주 정보를 프로필에 업데이트
        const updatedProfile = await updateProfile({
          kakao_user_id,
          name,
          gender,
          birth_type: birthType,
          birth_year: parseInt(birthYear),
          birth_month: parseInt(birthMonth),
          birth_day: parseInt(birthDay),
          birth_time: birthTime || null,
        });

        console.log(`[INFO] 프로필 사주 정보 업데이트 완료: ${kakao_user_id}`);

        return {
          success: true,
          message: '사주 정보가 프로필에 저장되었습니다.',
          profile: {
            name: updatedProfile.name,
            gender: updatedProfile.gender,
            birthType: updatedProfile.birth_type,
            birthYear: updatedProfile.birth_year,
            birthMonth: updatedProfile.birth_month,
            birthDay: updatedProfile.birth_day,
            birthTime: updatedProfile.birth_time,
          },
        };
      } catch (error) {
        console.error('[ERROR] updateSajuProfile 실행 실패:', formattingErrorMessage(error));

        return {
          success: false,
          error: formattingErrorMessage(error),
          message: '사주 정보를 프로필에 저장하는 중 오류가 발생했습니다.',
        };
      }
    },
  });
