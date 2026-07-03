/**
 * 사주 계산 교차검증 테스트
 *
 * SSOT: harness/saju skill (tests/skills/saju/four-pillars.test.js).
 * bun:test → jest 로만 이식하고, 천문 기준(ground truth) 로직은 그대로 유지한다.
 */

import { describe, it, expect } from "bun:test";
import { getSajuInfo } from "../../domain/services/saju-info";

// 천문 기준(ground truth) 생성기 — 서비스와 독립적으로 구현해 교차검증한다.
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const GAPJA = Array.from({ length: 60 }, (_, i) => STEMS[i % 10] + BRANCHES[i % 12]);

// 율리우스 적일수 (00:00 기준 정수)
function jdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}
// 일주 60갑자: JDN + 사이클 위상(49). forceteller SSOT 정합 상수
// (1995-04-25 = 丙戌, N=10000 회귀 검증).
const dayGZ = (y: number, m: number, d: number) => GAPJA[(((jdn(y, m, d) + 49) % 60) + 60) % 60];
// 연주: (사주연 - 4) mod 60. 4 AD = 甲子.
const yearGZ = (sajuYear: number) => GAPJA[(((sajuYear - 4) % 60) + 60) % 60];

const birth = (y: number, m: number, d: number, h = 12) => ({
  gender: "남성",
  calendar: "양력",
  year: String(y),
  month: String(m),
  day: String(d),
  hour: String(h),
  minute: "0",
});

// 입춘 경계에서 충분히 떨어진 정오 출생 표본 (연/월/일 경계 안전)
const SOLAR_DATES: [number, number, number][] = [
  [1990, 3, 15],
  [2000, 1, 1],
  [1992, 7, 15],
  [1985, 3, 8],
  [2024, 1, 1],
  [1975, 11, 20],
  [2010, 6, 30],
  [1968, 9, 9],
  [2003, 12, 25],
  [1995, 4, 25],
  [1958, 2, 20],
  [2015, 8, 8],
  [1988, 10, 10],
  [1999, 5, 5],
  [2020, 2, 29],
  [1947, 6, 1],
  [2025, 5, 30],
  [1960, 12, 31],
  [1980, 7, 7],
  [2008, 8, 8],
];

describe("사주 일주 — JDN 천문 기준 일치", () => {
  for (const [y, m, d] of SOLAR_DATES) {
    it(`${y}-${m}-${d} 일주 = ${dayGZ(y, m, d)}`, async () => {
      const r = await getSajuInfo(birth(y, m, d));
      expect(r.pillars.day.gapja).toBe(dayGZ(y, m, d));
    });
  }
});

describe("사주 연주 — 입춘 기준 60갑자 일치", () => {
  for (const [y, m, d] of SOLAR_DATES) {
    const sajuY = m > 2 || (m === 2 && d >= 5) ? y : y - 1; // 입춘(2/4) 근사 경계
    it(`${y}-${m}-${d} 연주 = ${yearGZ(sajuY)}`, async () => {
      const r = await getSajuInfo(birth(y, m, d));
      expect(r.pillars.year.gapja).toBe(yearGZ(sajuY));
    });
  }
});

describe("월주 — 오호둔(五虎遁) + 절기 입절", () => {
  // 절입일에서 충분히 떨어진 날짜의 월주(검산값)
  const cases: [number, number, number, string][] = [
    [1990, 3, 15, "己卯"], // 경오년 묘월
    [2000, 5, 20, "辛巳"], // 경진년 사월
    [1984, 8, 10, "壬申"], // 갑자년 신월
  ];
  for (const [y, m, d, exp] of cases) {
    it(`${y}-${m}-${d} 월주 = ${exp}`, async () => {
      const r = await getSajuInfo(birth(y, m, d));
      expect(r.pillars.month.gapja).toBe(exp);
    });
  }
});

describe("음→양력 변환 — 설날(음력 1/1)", () => {
  const cases: [number, string][] = [
    [1995, "1995-01-31"],
    [2000, "2000-02-05"],
    [2020, "2020-01-25"],
    [1976, "1976-01-31"],
  ];
  for (const [y, expSolar] of cases) {
    it(`음력 ${y}-1-1 → ${expSolar}`, async () => {
      const r = await getSajuInfo({ ...birth(y, 1, 1), calendar: "음력" });
      // input은 음력이지만 일주는 변환된 양력 기준으로 계산되므로,
      // 변환 정확성은 해당 양력일의 일주와 일치하는지로 확인한다.
      const [sy, sm, sd] = expSolar.split("-").map(Number);
      expect(r.pillars.day.gapja).toBe(dayGZ(sy, sm, sd));
    });
  }
});

describe("십성 — 일간 기준 정합성", () => {
  it("일간 천간의 십성은 항상 비견", async () => {
    const r = await getSajuInfo(birth(1990, 3, 15, 9));
    expect(r.tenStars.daySky).toBe("비견");
  });
  it("오행 분포 합은 8 (천간4 + 지지4)", async () => {
    const r = await getSajuInfo(birth(1990, 3, 15, 9));
    const e = r.elements.distribution;
    expect(e.wood + e.fire + e.earth + e.metal + e.water).toBe(8);
  });
});
