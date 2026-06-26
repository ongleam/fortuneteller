// chart-extras.ts — 사주 명식 보조 정보.
// 지장간(地藏干) · 12운성(運星) · 띠(생초) 정적 매핑.
// 신살은 별도 모듈(sinsal.ts)에서 처리한다.

import { HEAVENLY_STEMS, EARTHLY_BRANCHES, getStemIndex, getGroundIndex } from "./constants";

// ─────────────────────────────────────────────────────────────────────────────
// 지장간(地藏干)
// 각 지지에 숨은 천간들. 표준 명리학 본기·중기·여기 순.
// (forceteller 응답과 일치 검증 완료)

const HIDDEN_STEMS_BY_BRANCH: Record<string, ReadonlyArray<string>> = {
  子: ["壬", "癸"],
  丑: ["癸", "辛", "己"],
  寅: ["戊", "丙", "甲"],
  卯: ["甲", "乙"],
  辰: ["乙", "癸", "戊"],
  巳: ["戊", "庚", "丙"],
  午: ["丙", "己", "丁"],
  未: ["丁", "乙", "己"],
  申: ["戊", "壬", "庚"],
  酉: ["庚", "辛"],
  戌: ["辛", "丁", "戊"],
  亥: ["戊", "甲", "壬"],
};

export function getHiddenStems(branch: string): ReadonlyArray<string> {
  return HIDDEN_STEMS_BY_BRANCH[branch] ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// 12운성(運星)
// 일간 기준 12지지의 생장사절(生長死絶) 흐름.
// 양간(갑·병·무·경·임)은 순행, 음간(을·정·기·신·계)은 역행.
// 시작점(장생) 지지: 갑→亥, 병/무→寅, 경→巳, 임→申.

const TWELVE_FORTUNES_ORDER: ReadonlyArray<{
  korean: string;
  chinese: string;
}> = [
  { korean: "장생", chinese: "長生" },
  { korean: "목욕", chinese: "沐浴" },
  { korean: "관대", chinese: "冠帶" },
  { korean: "건록", chinese: "建祿" },
  { korean: "제왕", chinese: "帝旺" },
  { korean: "쇠", chinese: "衰" },
  { korean: "병", chinese: "病" },
  { korean: "사", chinese: "死" },
  { korean: "묘", chinese: "墓" },
  { korean: "절", chinese: "絶" },
  { korean: "태", chinese: "胎" },
  { korean: "양", chinese: "養" },
];

// 양간 시작 지지(장생) 인덱스: 갑→亥(11), 병/무→寅(2), 경→巳(5), 임→申(8).
// 음간은 같은 오행의 양간 + 6 (반대편) 또는 별도 표준 — 명리 표준: 음간 장생 위치
//   을→午(6), 정/기→酉(9), 신→子(0), 계→卯(3).
const STEM_FORTUNE_START: Record<string, { startBranchIdx: number; direction: 1 | -1 }> = {
  甲: { startBranchIdx: 11, direction: 1 }, // 亥 순행
  乙: { startBranchIdx: 6, direction: -1 }, // 午 역행
  丙: { startBranchIdx: 2, direction: 1 }, // 寅
  丁: { startBranchIdx: 9, direction: -1 }, // 酉
  戊: { startBranchIdx: 2, direction: 1 }, // 寅 (병과 동일)
  己: { startBranchIdx: 9, direction: -1 }, // 酉 (정과 동일)
  庚: { startBranchIdx: 5, direction: 1 }, // 巳
  辛: { startBranchIdx: 0, direction: -1 }, // 子
  壬: { startBranchIdx: 8, direction: 1 }, // 申
  癸: { startBranchIdx: 3, direction: -1 }, // 卯
};

export function getTwelveFortune(
  dayStem: string,
  branch: string,
): { korean: string; chinese: string } | null {
  const startInfo = STEM_FORTUNE_START[dayStem];
  if (!startInfo) return null;
  const branchIdx = getGroundIndex(branch);
  if (branchIdx < 0) return null;
  // 장생부터 12운성 순서대로 진행하면서 양간은 +1, 음간은 -1.
  let offset = branchIdx - startInfo.startBranchIdx;
  if (startInfo.direction === -1) offset = -offset;
  const idx = ((offset % 12) + 12) % 12;
  return TWELVE_FORTUNES_ORDER[idx];
}

// ─────────────────────────────────────────────────────────────────────────────
// 띠 (생초) — 년주 60갑자 → 동물 + 색(천간 오행)
// forceteller profile.sexagenaryCycle: "{년주 한글}({색} {동물})" 예: "계묘(검은 토끼)"

const BRANCH_TO_ANIMAL: Record<string, string> = {
  子: "쥐",
  丑: "소",
  寅: "호랑이",
  卯: "토끼",
  辰: "용",
  巳: "뱀",
  午: "말",
  未: "양",
  申: "원숭이",
  酉: "닭",
  戌: "개",
  亥: "돼지",
};

// 색 표기: forceteller SSOT 기준. 토=황금, 금=하얀 (우리 직관과 다름 — 검증된 매핑).
const ELEMENT_TO_COLOR: Record<string, string> = {
  목: "푸른",
  화: "붉은",
  토: "황금",
  금: "하얀",
  수: "검은",
};

export interface ZodiacInfo {
  /** 60갑자 한글 (예: "계묘") */
  gapjaKorean: string;
  /** 동물 (예: "토끼") */
  animal: string;
  /** 색 (예: "검은") */
  color: string;
  /** 표시 문자열 (예: "계묘(검은 토끼)") */
  display: string;
}

/**
 * 띠(생초) 계산. forceteller `sexagenaryCycle` SSOT 와 호환되도록 **일주(日柱)** 기준.
 * (년주 기준이 아님 — 한국 사주 표준은 일주의 60갑자를 띠로 표시한다.)
 */
export function getZodiac(dayStem: string, dayBranch: string): ZodiacInfo | null {
  const stemIdx = getStemIndex(dayStem);
  const branchIdx = getGroundIndex(dayBranch);
  if (stemIdx < 0 || branchIdx < 0) return null;
  const stem = HEAVENLY_STEMS[stemIdx];
  const branch = EARTHLY_BRANCHES[branchIdx];
  const animal = BRANCH_TO_ANIMAL[dayBranch];
  const color = ELEMENT_TO_COLOR[stem.fiveElement];
  if (!animal || !color) return null;
  const gapjaKorean = `${stem.korean}${branch.korean}`;
  return {
    gapjaKorean,
    animal,
    color,
    display: `${gapjaKorean}(${color} ${animal})`,
  };
}
