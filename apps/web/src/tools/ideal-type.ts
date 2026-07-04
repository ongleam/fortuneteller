// AI SDK 어댑터 — 사주 부족 오행을 보완하는 '이상형' 이미지를 생성(gemini-2.5-flash-image)해
// public Storage 에 올리고 공개 URL 을 반환한다. 카카오는 이 URL 을 스크랩해 이미지로 렌더한다.
import { formattingErrorMessage } from "@fortuneteller/shared/utils";
import { google } from "@fortuneteller/clients/gemini/client";
import { uploadPublicImage } from "@fortuneteller/clients/supabase/storage";
import { tool, generateText } from "ai";
import { z } from "zod";
import sharp from "sharp";
import { tools } from "@fortuneteller/config/prompts";

const PROMPTS = tools.getIdealTypeImage;

// 부족 오행을 채워주는 상대상 — 궁합의 핵심(내게 없는 기운을 형상화).
const ELEMENT_VIBE: Record<string, string> = {
  목: "싱그럽고 생기 넘치는, 자연을 닮은 청량하고 성장하는 분위기, 편안한 내추럴룩",
  화: "밝고 따뜻하며 열정적인 화사한 미소, 화사한 색감의 옷",
  토: "포근하고 안정감 있는 신뢰가 가는 편안한 인상, 차분한 뉴트럴톤",
  금: "단정하고 세련된 시크한 카리스마, 깔끔한 정장/모던룩",
  수: "지적이고 차분하며 신비로운 유연한 매력, 깊이 있는 눈빛",
};

/** 사주 부족 오행 + 상대 성별로 이상형 이미지 생성 프롬프트를 만든다(순수함수). */
export function buildIdealTypePrompt(
  weakElement: string,
  partnerGender: string,
  extraTraits?: string,
): string {
  const vibe = ELEMENT_VIBE[weakElement] ?? "부드럽고 조화로운 분위기";
  return [
    "사주 궁합에 기반한 '이상형' 인물 초상 사진을 만들어줘.",
    `이 사람은 ${weakElement} 기운이 부족해서, ${weakElement} 기운을 채워줄 상대가 궁합이 좋아. 그 기운을 형상화한 이상형을 그려줘.`,
    `- 대상: 20대 후반 한국인 ${partnerGender}, 상반신 포트레이트`,
    `- 분위기: ${vibe}`,
    extraTraits ? `- 추가 특징: ${extraTraits}` : "",
    "- 스타일: 자연광, 부드러운 보케 배경, 실사풍(photorealistic) 고화질 초상",
    "- 톤: 감성적인 연애운 카드 느낌, 따뜻하고 세련된 색감",
  ]
    .filter(Boolean)
    .join("\n");
}

export const getIdealTypeImage = () =>
  tool({
    description: PROMPTS.description,
    inputSchema: z.object({
      weakElement: z
        .enum(["목", "화", "토", "금", "수"])
        .describe(PROMPTS.parameters.weakElement.description),
      partnerGender: z
        .enum(["남성", "여성"])
        .describe(PROMPTS.parameters.partnerGender.description),
      extraTraits: z
        .string()
        .nullable()
        .optional()
        .describe(PROMPTS.parameters.extraTraits.description),
    }),
    execute: async ({ weakElement, partnerGender, extraTraits }) => {
      try {
        const prompt = buildIdealTypePrompt(weakElement, partnerGender, extraTraits ?? undefined);
        const result = await generateText({ model: google("gemini-2.5-flash-image"), prompt });

        const image = result.files.find((f) => f.mediaType.startsWith("image/"));
        if (!image) {
          return {
            success: false,
            message: "이상형 이미지를 생성하지 못했어요. 다시 시도해 주세요.",
          };
        }

        // 원본 PNG(~2MB)를 JPEG 로 변환해 업로드 — 용량 ~89%↓ + 카카오 렌더 확실.
        // (webp 는 더 작지만 카카오 챗봇 렌더 지원이 불확실해 jpeg 채택.)
        const jpeg = await sharp(image.uint8Array).jpeg({ quality: 85 }).toBuffer();
        const imageUrl = await uploadPublicImage(new Uint8Array(jpeg), "image/jpeg");
        return {
          success: true,
          imageUrl,
          caption: `${weakElement} 기운을 채워줄 당신의 이상형이에요 💘`,
        };
      } catch (error) {
        return {
          success: false,
          error: formattingErrorMessage(error),
          message: "이상형 이미지를 만드는 중 오류가 발생했어요.",
        };
      }
    },
  });
