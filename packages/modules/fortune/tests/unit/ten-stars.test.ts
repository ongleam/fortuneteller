// ten-stars 서비스 단위 테스트 — 십성(十星) 규칙 정합성.
import { describe, expect, it } from "bun:test";
import { getTenStar } from "../../domain/services/ten-stars";

describe("getTenStar — 십성 규칙", () => {
  it("같은 천간(같은 오행·같은 음양) → 비견", () => {
    expect(getTenStar("甲", "甲")).toBe("비견"); // 목·양 vs 목·양
    expect(getTenStar("乙", "乙")).toBe("비견"); // 목·음 vs 목·음
  });

  it("같은 오행·다른 음양 → 겁재", () => {
    expect(getTenStar("甲", "乙")).toBe("겁재"); // 목·양 vs 목·음
    expect(getTenStar("乙", "甲")).toBe("겁재");
  });

  it("알 수 없는 천간 → 빈 문자열", () => {
    expect(getTenStar("甲", "X")).toBe("");
  });
});
