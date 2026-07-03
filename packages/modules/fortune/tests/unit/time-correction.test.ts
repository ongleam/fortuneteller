// time-correction 서비스 단위 테스트 — 진태양시 경도 보정.
// 보정(분) = (경도E − 135°) × 4 분/도.
import { describe, expect, it } from "bun:test";
import { getLongitudeOffsetMinutes } from "../../domain/services/time-correction";

describe("getLongitudeOffsetMinutes — 경도 보정", () => {
  it("표준자오선(135°E) → 0분", () => {
    expect(getLongitudeOffsetMinutes(135)).toBe(0);
  });

  it("서쪽(127.5°E, 서울 근방) → -30분", () => {
    expect(getLongitudeOffsetMinutes(127.5)).toBe(-30);
  });

  it("동쪽(140°E) → +20분", () => {
    expect(getLongitudeOffsetMinutes(140)).toBe(20);
  });
});
