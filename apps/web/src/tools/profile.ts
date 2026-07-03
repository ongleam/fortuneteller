// AI SDK 어댑터 — 프로필의 사주 정보 갱신(profile 모듈 handler/view).
import { formattingErrorMessage } from "@fortuneteller/shared/utils";
import { tool } from "ai";
import { z } from "zod";
import { tools } from "@fortuneteller/config/prompts";
import { UpdateSajuProfile } from "@fortuneteller/modules/profile/domain/commands";
import { updatedProfileView } from "@fortuneteller/modules/profile/application/views";
import type { SajuProfile } from "@fortuneteller/modules/profile/domain/value-objects";
import { bus } from "@/bootstrap/bus";

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
      try {
        const updated = await bus.handle<SajuProfile>(
          UpdateSajuProfile({
            kakaoUserId: kakao_user_id,
            input: { name, gender, calendar, year, month, day, hour },
          }),
        );
        return updatedProfileView(updated);
      } catch (error) {
        return {
          success: false,
          error: formattingErrorMessage(error),
          message: "사주 정보를 프로필에 저장하는 중 오류가 발생했습니다.",
        };
      }
    },
  });
