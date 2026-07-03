// AI SDK 어댑터 — fortune 모듈 handler/view 를 tool 로 감싼다.
import { formattingErrorMessage } from "@fortuneteller/shared/utils";
import { tool } from "ai";
import { z } from "zod";
import { tools } from "@fortuneteller/config/prompts";
import { getStoredSajuReading } from "@fortuneteller/modules/fortune/application/handlers";
import { storedSajuReadingView } from "@fortuneteller/modules/fortune/application/views";

const FORTUNE_PROMPTS = tools.fortune;

function getToday() {
  return new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const readStoredSaju = (kakao_user_id: string) => async () => {
  try {
    return storedSajuReadingView(await getStoredSajuReading(kakao_user_id), getToday());
  } catch (error) {
    return {
      success: false,
      error: formattingErrorMessage(error),
      message: "사주 정보를 불러오는 중 오류가 발생했습니다.",
      hasStoredInfo: false,
    };
  }
};

export const getTodayFortune = (kakao_user_id: string) =>
  tool({
    description: FORTUNE_PROMPTS.getTodayFortune.description,
    inputSchema: z.object({}),
    execute: readStoredSaju(kakao_user_id),
  });

export const getYearFortune = (kakao_user_id: string) =>
  tool({
    description: FORTUNE_PROMPTS.getYearFortune.description,
    inputSchema: z.object({}),
    execute: readStoredSaju(kakao_user_id),
  });
