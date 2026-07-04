import { describe, test, expect } from "bun:test";
/**
 * 이상형 이미지 도구 테스트 — 프롬프트 구성(순수함수)만 검증.
 * 이미지 생성/업로드는 외부 I/O 라 단위테스트 대상에서 제외.
 */

import { buildIdealTypePrompt, getIdealTypeImage } from "@/tools/ideal-type";

describe("IdealTypeImageTool", () => {
  test("도구 생성 및 구조", () => {
    const t = getIdealTypeImage();
    expect(t).toHaveProperty("description");
    expect(t).toHaveProperty("inputSchema");
    expect(typeof t.execute).toBe("function");
  });

  describe("buildIdealTypePrompt", () => {
    test("오행별 분위기가 프롬프트에 반영된다", () => {
      const elements: Record<string, string> = {
        목: "내추럴",
        화: "화사",
        토: "포근",
        금: "시크",
        수: "지적",
      };
      for (const [element, keyword] of Object.entries(elements)) {
        const prompt = buildIdealTypePrompt(element, "여성");
        expect(prompt).toContain(element);
        expect(prompt).toContain(keyword);
      }
    });

    test("상대 성별이 프롬프트에 반영된다", () => {
      expect(buildIdealTypePrompt("목", "여성")).toContain("여성");
      expect(buildIdealTypePrompt("목", "남성")).toContain("남성");
    });

    test("extraTraits 는 있을 때만 포함된다", () => {
      expect(buildIdealTypePrompt("화", "여성", "안경")).toContain("안경");
      expect(buildIdealTypePrompt("화", "여성")).not.toContain("추가 특징");
    });

    test("알 수 없는 오행은 기본 분위기로 폴백한다", () => {
      expect(buildIdealTypePrompt("없음", "여성")).toContain("조화로운");
    });
  });
});
