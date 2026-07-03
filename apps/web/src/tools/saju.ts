// AI SDK 어댑터 — 입력받은 생년월일시로 사주 계산(fortune 모듈 handler).
import { formattingErrorMessage } from "@fortuneteller/shared/utils";
import { tool } from "ai";
import { z } from "zod";
import { tools } from "@fortuneteller/config/prompts";
import { computeSaju } from "@fortuneteller/modules/fortune/application/handlers";

const PROMPTS = tools.getSaju;

export const getSaju = () =>
  tool({
    description: PROMPTS.description,
    inputSchema: z.object({
      name: z.string().describe(PROMPTS.parameters.name.description),
      gender: z.enum(["남성", "여성"]).describe(PROMPTS.parameters.gender.description),
      calendar: z
        .enum(["양력", "음력"])
        .default("양력")
        .describe(PROMPTS.parameters.calendar.description),
      year: z.string().describe(PROMPTS.parameters.year.description),
      month: z.string().describe(PROMPTS.parameters.month.description),
      day: z.string().describe(PROMPTS.parameters.day.description),
      hour: z
        .enum(["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22", "24"])
        .nullable()
        .optional()
        .describe(PROMPTS.parameters.hour.description),
    }),
    execute: async ({ name, gender, calendar, year, month, day, hour }) => {
      try {
        return await computeSaju({ name, gender, calendar, year, month, day, hour: hour || "12" });
      } catch (error) {
        return {
          success: false,
          error: formattingErrorMessage(error),
          message: "사주 정보를 불러오는 중 오류가 발생했습니다.",
          hasStoredInfo: false,
        };
      }
    },
  });
