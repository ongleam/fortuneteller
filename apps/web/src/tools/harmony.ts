// AI SDK 어댑터 — 궁합 계산(fortune 모듈 handler/view).
import { formattingErrorMessage } from "@fortuneteller/shared/utils";
import { tool } from "ai";
import { z } from "zod";
import { tools } from "@fortuneteller/config/prompts";
import { computeHarmony } from "@fortuneteller/modules/fortune/application/handlers";
import { harmonyView } from "@fortuneteller/modules/fortune/application/views";

const HARMONY_PROMPTS = tools.harmony;

export const getHarmony = (kakao_user_id: string) =>
  tool({
    description: HARMONY_PROMPTS.getHarmony.description,
    inputSchema: z.object({
      name: z.string().describe(HARMONY_PROMPTS.getHarmony.parameters.name.description),
      gender: z
        .enum(["남성", "여성"])
        .describe(HARMONY_PROMPTS.getHarmony.parameters.gender.description),
      calendar: z
        .enum(["양력", "음력"])
        .default("양력")
        .describe(HARMONY_PROMPTS.getHarmony.parameters.calendar.description),
      year: z.string().describe(HARMONY_PROMPTS.getHarmony.parameters.year.description),
      month: z.string().describe(HARMONY_PROMPTS.getHarmony.parameters.month.description),
      day: z.string().describe(HARMONY_PROMPTS.getHarmony.parameters.day.description),
      hour: z
        .enum(["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22", "24"])
        .nullable()
        .optional()
        .describe(HARMONY_PROMPTS.getHarmony.parameters.hour.description),
    }),
    execute: async ({ name, gender, calendar, year, month, day, hour }) => {
      try {
        const reading = await computeHarmony(kakao_user_id, {
          name,
          gender,
          calendar,
          year,
          month,
          day,
          hour: hour || "12",
        });
        return harmonyView(reading, name);
      } catch (error) {
        return {
          success: false,
          error: formattingErrorMessage(error),
          message: "궁합 조회 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        };
      }
    },
  });
