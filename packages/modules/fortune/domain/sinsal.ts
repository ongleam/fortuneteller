// sinsal.ts — 12신살(神殺) 계산.
//
// forceteller `/saju/chart._신살` 와 호환되는 4주 신살.
// 룰 (회귀 N=200 검증):
//   - 월/일/시 신살 = 년지 기준 12신살
//   - 년주 신살 = 일지 기준 (자기 자신이 base 가 되는 모순 회피)
// 12신살은 삼합(三合) 그룹의 겁살 위치에서 12지지 순서로 매핑된다.

import type { FourPillars } from "./value-objects";

const BRANCH_ORDER: ReadonlyArray<string> = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];

// 12신살 시퀀스 (겁살 위치부터 순행).
const SINSAL_ORDER: ReadonlyArray<{ korean: string; chinese: string }> = [
  { korean: "겁살", chinese: "劫殺" },
  { korean: "재살", chinese: "災殺" },
  { korean: "천살", chinese: "天殺" },
  { korean: "지살", chinese: "地殺" },
  { korean: "년살", chinese: "年殺" },
  { korean: "월살", chinese: "月殺" },
  { korean: "망신살", chinese: "亡神殺" },
  { korean: "장성살", chinese: "將星殺" },
  { korean: "반안살", chinese: "攀鞍殺" },
  { korean: "역마살", chinese: "驛馬殺" },
  { korean: "육해살", chinese: "六害殺" },
  { korean: "화개살", chinese: "華蓋殺" },
];

// 삼합 그룹 → 겁살 위치.
const KUEPSAL_BY_BASE: Record<string, string> = {
  寅: "亥",
  午: "亥",
  戌: "亥",
  巳: "寅",
  酉: "寅",
  丑: "寅",
  申: "巳",
  子: "巳",
  辰: "巳",
  亥: "申",
  卯: "申",
  未: "申",
};

export interface SinsalInfo {
  korean: string;
  chinese: string;
}

function sinsalFor(baseBranch: string, targetBranch: string): SinsalInfo | null {
  const kuepsal = KUEPSAL_BY_BASE[baseBranch];
  if (!kuepsal) return null;
  const ksIdx = BRANCH_ORDER.indexOf(kuepsal);
  const tgtIdx = BRANCH_ORDER.indexOf(targetBranch);
  if (ksIdx < 0 || tgtIdx < 0) return null;
  const idx = (((tgtIdx - ksIdx) % 12) + 12) % 12;
  return SINSAL_ORDER[idx];
}

export interface FourSinsal {
  year: SinsalInfo | null;
  month: SinsalInfo | null;
  day: SinsalInfo | null;
  time: SinsalInfo | null;
}

/**
 * 사주 4주 각각의 신살을 계산한다.
 * forceteller 룰: 월/일/시 신살은 년지 기준, 년주 신살만 일지 기준.
 */
export function getFourSinsal(pillars: FourPillars): FourSinsal {
  const yg = pillars.year.ground;
  const dg = pillars.day.ground;
  return {
    year: sinsalFor(dg, yg),
    month: sinsalFor(yg, pillars.month.ground),
    day: sinsalFor(yg, dg),
    time: sinsalFor(yg, pillars.time.ground),
  };
}
