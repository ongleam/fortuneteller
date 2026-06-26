// points.ts — 사주 오행·십성 점수 계산.
//
// forceteller `/saju/points` 와 호환되는 점수 알고리즘.
// 4주 8자(천간 4 + 지지 본기 4)를 각 1단위로 보고 오행·십성 분포를 카운트한 뒤
// 1단위 = 13.75 점 (= 110 / 8) 으로 환산해 점수·퍼센트·평가(description)를 낸다.

import { getFourPillars } from "./four-pillars";
import { getStemInfo } from "./constants";
import { getTenStar, getMainSky } from "./ten-stars";
import type { BirthInput, FourPillars } from "./types";

const POINT_UNIT = 13.75;
const TOTAL_CHARS = 8;

const ELEMENT_KO_TO_KEY: Record<string, "wood" | "fire" | "earth" | "metal" | "water"> = {
  목: "wood",
  화: "fire",
  토: "earth",
  금: "metal",
  수: "water",
};
const ELEMENT_KEY_TO_KO: Record<string, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};
const ELEMENT_KO_TO_CN: Record<string, string> = {
  목: "木",
  화: "火",
  토: "土",
  금: "金",
  수: "水",
};
const TEN_STAR_CN: Record<string, string> = {
  비견: "比肩",
  겁재: "劫財",
  식신: "食神",
  상관: "傷官",
  편재: "偏財",
  정재: "正財",
  편관: "偏官",
  정관: "正官",
  편인: "偏印",
  정인: "正印",
};

const TEN_STAR_ORDER: ReadonlyArray<string> = [
  "비견",
  "겁재",
  "식신",
  "상관",
  "편재",
  "정재",
  "편관",
  "정관",
  "편인",
  "정인",
];

function describeCount(count: number): string {
  if (count === 0) return "부족";
  if (count === 1) return "적정";
  if (count === 2) return "발달";
  return "과다";
}

export interface ElementPoint {
  key: "wood" | "fire" | "earth" | "metal" | "water";
  korean: string;
  chinese: string;
  point: number;
  percent: number;
  count: number;
  description: string;
}

export interface TenStarPoint {
  korean: string;
  chinese: string;
  point: number;
  percent: number;
  count: number;
}

export interface PointsResult {
  elements: ElementPoint[];
  tenStars: TenStarPoint[];
}

/** 8자(천간 4 + 지지 본기 4)를 모은다. 일간 포함. */
function getEightChars(pillars: FourPillars): string[] {
  return [
    pillars.year.sky,
    pillars.month.sky,
    pillars.day.sky,
    pillars.time.sky,
    getMainSky(pillars.year.ground),
    getMainSky(pillars.month.ground),
    getMainSky(pillars.day.ground),
    getMainSky(pillars.time.ground),
  ];
}

export function computePoints(pillars: FourPillars): PointsResult {
  const stems = getEightChars(pillars);
  const dayStem = pillars.day.sky;

  const elementCount: Record<string, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };
  const tenStarCount: Record<string, number> = {};
  for (const t of TEN_STAR_ORDER) tenStarCount[t] = 0;

  for (const stem of stems) {
    const info = getStemInfo(stem);
    if (info) {
      const key = ELEMENT_KO_TO_KEY[info.fiveElement];
      if (key) elementCount[key]++;
    }
    const ten = getTenStar(dayStem, stem);
    if (ten) tenStarCount[ten] = (tenStarCount[ten] || 0) + 1;
  }

  const elements: ElementPoint[] = (
    Object.keys(elementCount) as Array<keyof typeof elementCount>
  ).map((key) => {
    const count = elementCount[key];
    const ko = ELEMENT_KEY_TO_KO[key];
    return {
      key: key as ElementPoint["key"],
      korean: ko,
      chinese: ELEMENT_KO_TO_CN[ko],
      count,
      point: count * POINT_UNIT,
      percent: (count / TOTAL_CHARS) * 100,
      description: describeCount(count),
    };
  });

  const tenStars: TenStarPoint[] = TEN_STAR_ORDER.map((name) => ({
    korean: name,
    chinese: TEN_STAR_CN[name] ?? "",
    count: tenStarCount[name] ?? 0,
    point: (tenStarCount[name] ?? 0) * POINT_UNIT,
    percent: ((tenStarCount[name] ?? 0) / TOTAL_CHARS) * 100,
  }));

  return { elements, tenStars };
}

export async function getPoints(birthInput: BirthInput): Promise<PointsResult> {
  const pillars = await getFourPillars(birthInput);
  return computePoints(pillars);
}
