// five-elements 서비스 단위 테스트 — 오행 분포 불변식.
import { describe, expect, it } from "bun:test";
import { getFiveElements } from "../../domain/services/five-elements";
import type { FourPillars } from "../../domain/value-objects";

const pillars: FourPillars = {
  year: { sky: "甲", ground: "子" },
  month: { sky: "丙", ground: "寅" },
  day: { sky: "戊", ground: "午" },
  time: { sky: "庚", ground: "申" },
};

describe("getFiveElements — 오행 분포", () => {
  it("분포 합은 8 (천간 4 + 지지 4)", () => {
    const e = getFiveElements(pillars);
    const sum = e.wood + e.fire + e.earth + e.metal + e.water;
    expect(sum).toBe(8);
  });

  it("모든 오행 카운트는 음수가 아니다", () => {
    const e = getFiveElements(pillars);
    for (const v of Object.values(e)) expect(v).toBeGreaterThanOrEqual(0);
  });
});
