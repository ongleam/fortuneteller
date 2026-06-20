import { formattingErrorMessage } from '@/lib/shared/utils';
import { tool } from 'ai';
import { z } from 'zod';
import { tools } from '@/config/prompts';
import { getSajuInfo } from '@/lib/core/saju';

const PROMPTS = tools.getSaju;

export const getSaju = () =>
  tool({
    description: PROMPTS.description,
    inputSchema: z.object({
      name: z.string().describe(PROMPTS.parameters.name.description),
      gender: z.enum(['남성', '여성']).describe(PROMPTS.parameters.gender.description),
      calendar: z
        .enum(['양력', '음력'])
        .default('양력')
        .describe(PROMPTS.parameters.calendar.description),
      year: z.string().describe(PROMPTS.parameters.year.description),
      month: z.string().describe(PROMPTS.parameters.month.description),
      day: z.string().describe(PROMPTS.parameters.day.description),
      hour: z
        .enum(['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'])
        .nullable()
        .optional()
        .describe(PROMPTS.parameters.hour.description),
    }),
    execute: async ({ name, gender, calendar, year, month, day, hour }) => {
      console.log(
        `[INFO] getSaju 호출: '${name}, ${gender}, ${calendar}, ${year}, ${month}, ${day}, ${hour}'`
      );
      try {
        const sajuInfo = getSajuInfo({
          name,
          gender,
          calendar,
          year,
          month,
          day,
          hour: hour || '12',
        });

        console.log(`[INFO] 저장된 정보로 사주 조회 완료: ${name}`);

        return sajuInfo;
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
