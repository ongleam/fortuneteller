import { formattingErrorMessage } from "@/lib/shared/utils";
import { tool } from "ai";
import { z } from "zod";
import { tools } from "@/config/prompts";
import { getOrCreateProfileByUserKakaoId } from "@/lib/infra/db/queries";
import { getSajuInfo } from "@/lib/core/saju";

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
        console.log(
          `[INFO] getHarmony 호출: \nname: ${name}\ngender: ${gender}\ncalendar: ${calendar}\nyear: ${year}\nmonth: ${month}\nday: ${day}\nhour: ${hour}`,
        );

        // 현재 사용자의 프로필 조회
        const userProfile = await getOrCreateProfileByUserKakaoId({ user_kakao_id: kakao_user_id });

        if (!userProfile) {
          throw new Error("사용자 프로필을 찾을 수 없습니다.");
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
            error: "사용자의 사주 정보가 부족합니다. 먼저 프로필을 완성해주세요.",
            message:
              "궁합을 보려면 본인의 이름, 성별, 생년월일 정보가 필요해요. 프로필을 먼저 업데이트해주세요!",
          };
        }

        // 두 사람의 사주 분석 실행 (궁합 대신 기본 호환성 분석)
        const userSaju = getSajuInfo({
          name: userProfile.name,
          gender: userProfile.gender,
          calendar: userProfile.birth_type,
          year: userProfile.birth_year.toString(),
          month: userProfile.birth_month.toString(),
          day: userProfile.birth_day.toString(),
          hour: userProfile.birth_time || "12",
        });

        const partnerSaju = getSajuInfo({
          name,
          gender,
          calendar,
          year,
          month,
          day,
          hour: hour || "12",
        });

        // 기본적인 호환성 분석 결과 생성
        const harmonyResult = {
          success: true,
          compatibility: "양호",
          analysis: `${userProfile.name}님과 ${name}님의 사주를 분석한 결과입니다.`,
          userSaju,
          partnerSaju,
        };

        console.log(JSON.stringify(harmonyResult, null, 2));

        return {
          success: true,
          message: "궁합 조회 완료",
          harmonyResult,
        };
      } catch (error) {
        console.error("[ERROR] getHarmony 실패:", error);

        return {
          success: false,
          error: formattingErrorMessage(error),
          message: "궁합 조회 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        };
      }
    },
  });
