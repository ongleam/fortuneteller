// harmony 궁합 엔진 단위 테스트 — 결정성·대칭성·점수역 불변식.
import { describe, expect, it } from "bun:test";
import { computeHarmony } from "../../domain/services/harmony";
import { profileToBirthInput } from "../../application/handlers";
import type { BirthInput } from "../../domain/value-objects";

const A: BirthInput = {
  gender: "남성",
  calendar: "양력",
  year: "1990",
  month: "5",
  day: "15",
  hour: "10",
};
const B: BirthInput = {
  gender: "여성",
  calendar: "양력",
  year: "1992",
  month: "8",
  day: "23",
  hour: "16",
};

describe("computeHarmony — 결정성(재현성)", () => {
  it("동일 입력은 항상 동일 점수를 낸다 (deterministic)", async () => {
    const r1 = await computeHarmony(A, B);
    const r2 = await computeHarmony(A, B);
    expect(r1).toEqual(r2);
  });

  it("birth_time 결측 시 기본값 '12' 로 매핑되어 재현 가능하다", async () => {
    const input = profileToBirthInput({
      gender: "여성",
      birth_type: "양력",
      birth_year: 1988,
      birth_month: 3,
      birth_day: 3,
      birth_time: null,
    });
    expect(input.hour).toBe("12");
    const r1 = await computeHarmony(A, input);
    const r2 = await computeHarmony(A, input);
    expect(r1.score).toBe(r2.score);
  });
});

describe("computeHarmony — 대칭성(symmetry)", () => {
  it("h(a,b) === h(b,a) — 순서 무관 (symmetric)", async () => {
    const ab = await computeHarmony(A, B);
    const ba = await computeHarmony(B, A);
    expect(ab.score).toBe(ba.score);
    expect(ab.breakdown).toEqual(ba.breakdown);
  });
});

describe("computeHarmony — 점수역(range)", () => {
  it("score 는 0–100 범위로 clamp 된다", async () => {
    const r = await computeHarmony(A, B);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("breakdown 3항목 합이 score 와 일치한다", async () => {
    const r = await computeHarmony(A, B);
    const sum = r.breakdown.fiveElements + r.breakdown.branches + r.breakdown.dayMaster;
    expect(Math.round(sum)).toBe(r.score);
  });

  it("자기 자신과의 궁합도 유효 범위 안이다", async () => {
    const r = await computeHarmony(A, A);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(typeof r.summary).toBe("string");
  });
});
