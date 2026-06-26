import { formattingErrorMessage } from "@/lib/shared/utils";
import { tool } from "ai";
import { z } from "zod";
import { tools } from "@/config/prompts";
import { updateProfile } from "@/lib/infra/db/queries";

const PROFILE_PROMPTS = tools.updateUserProfile;

export const updateUserProfile = (kakao_user_id: string) =>
  tool({
    description: PROFILE_PROMPTS.description,
    inputSchema: z.object({
      name: z.string().describe(PROFILE_PROMPTS.parameters.name.description),
      gender: z.enum(["남성", "여성"]).describe(PROFILE_PROMPTS.parameters.gender.description),
      calendar: z
        .enum(["양력", "음력"])
        .default("양력")
        .describe(PROFILE_PROMPTS.parameters.calendar.description),
      year: z.string().describe(PROFILE_PROMPTS.parameters.year.description),
      month: z.string().describe(PROFILE_PROMPTS.parameters.month.description),
      day: z.string().describe(PROFILE_PROMPTS.parameters.day.description),
      hour: z
        .enum(["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22", "24"])
        .nullable()
        .optional()
        .describe(PROFILE_PROMPTS.parameters.hour.description),
    }),
    execute: async ({ name, gender, calendar, year, month, day, hour }) => {
      console.log(
        `[INFO] updateSajuProfile 호출: \nname: ${name}\ngender: ${gender}\ncalendar: ${calendar}\nyear: ${year}\nmonth: ${month}\nday: ${day}\nhour: ${hour}`,
      );

      try {
        // 사주 정보를 프로필에 업데이트
        const updatedProfile = await updateProfile({
          kakao_user_id,
          name,
          gender,
          birth_type: calendar,
          birth_year: parseInt(year),
          birth_month: parseInt(month),
          birth_day: parseInt(day),
          birth_time: hour || null,
        });

        console.log(`[INFO] 프로필 사주 정보 업데이트 완료: ${kakao_user_id}`);

        return {
          success: true,
          message: "사주 정보가 프로필에 저장되었습니다.",
          profile: {
            name: updatedProfile.name,
            gender: updatedProfile.gender,
            calendar: updatedProfile.birth_type,
            year: updatedProfile.birth_year,
            month: updatedProfile.birth_month,
            day: updatedProfile.birth_day,
            hour: updatedProfile.birth_time,
          },
        };
      } catch (error) {
        console.error("[ERROR] updateSajuProfile 실행 실패:", formattingErrorMessage(error));

        return {
          success: false,
          error: formattingErrorMessage(error),
          message: "사주 정보를 프로필에 저장하는 중 오류가 발생했습니다.",
        };
      }
    },
  });
