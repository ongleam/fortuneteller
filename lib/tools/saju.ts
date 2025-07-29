import { formattingErrorMessage } from '@/lib/utils';
import { tool } from 'ai';
import { z } from 'zod';
import { tools } from '@/config/prompts';
import { updateProfile as updateProfile, getOrCreateProfileByUserKakaoId } from '@/lib/db/queries';
import { fetchSaju } from '@/lib/utils/saju';

const PROMPTS = tools.getSaju;

export const getSaju = () =>
  tool({
    description: PROMPTS.description,
    parameters: z.object({
      name: z.string().describe(PROMPTS.parameters.name.description),
      gender: z.enum(['남성', '여성']).describe(PROMPTS.parameters.gender.description),
      birthType: z
        .enum(['양력', '음력'])
        .default('양력')
        .describe(PROMPTS.parameters.birthType.description),
      birthYear: z.string().describe(PROMPTS.parameters.birthYear.description),
      birthMonth: z.string().describe(PROMPTS.parameters.birthMonth.description),
      birthDay: z.string().describe(PROMPTS.parameters.birthDay.description),
      birthTime: z
        .enum(['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'])
        .nullable()
        .optional()
        .describe(PROMPTS.parameters.birthTime.description),
    }),
    execute: async ({ name, gender, birthType, birthYear, birthMonth, birthDay, birthTime }) => {
      console.log(
        `[INFO] getSaju 호출: '${name}, ${gender}, ${birthType}, ${birthYear}, ${birthMonth}, ${birthDay}, ${birthTime}'`
      );
      try {
        const sajuResult = await fetchSaju(
          name,
          gender,
          birthType,
          birthYear,
          birthMonth,
          birthDay,
          birthTime
        );

        console.log(`[INFO] 저장된 정보로 사주 조회 완료: ${name}`);

        return sajuResult;
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
