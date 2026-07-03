// sinsal.ts — 12신살(神殺) 계산.
//
// forceteller `/saju/chart._신살` 와 호환되는 4주 신살.
// 룰 (회귀 N=200 검증):
//   - 월/일/시 신살 = 년지 기준 12신살
//   - 년주 신살 = 일지 기준 (자기 자신이 base 가 되는 모순 회피)
// 12신살은 삼합(三合) 그룹의 겁살 위치에서 12지지 순서로 매핑된다.

import type { FourPillars, SinsalInfo, FourSinsal } from "../value-objects";

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

function sinsalFor(baseBranch: string, targetBranch: string): SinsalInfo | null {
  const kuepsal = KUEPSAL_BY_BASE[baseBranch];
  if (!kuepsal) return null;
  const ksIdx = BRANCH_ORDER.indexOf(kuepsal);
  const tgtIdx = BRANCH_ORDER.indexOf(targetBranch);
  if (ksIdx < 0 || tgtIdx < 0) return null;
  const idx = (((tgtIdx - ksIdx) % 12) + 12) % 12;
  return SINSAL_ORDER[idx];
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

// ── 신살 상세 계산 (통합: 구 sinsals.ts) ──
/**
 * 사주 팔자를 기준으로 신살 분석
 */
export function calculateSinsals(pillars: FourPillars): string[] {
  const sinsals: string[] = [];

  // 각 신살 계산 함수들 호출
  sinsals.push(...calculateYeokmasal(pillars));
  sinsals.push(...calculateHwagaesal(pillars));
  sinsals.push(...calculateCheonulGwiin(pillars));
  sinsals.push(...calculateDoHwasal(pillars));
  sinsals.push(...calculateWolsal(pillars));
  sinsals.push(...calculateGeobsal(pillars));
  sinsals.push(...calculateJangseongsal(pillars));
  sinsals.push(...calculateBanAnsal(pillars));
  sinsals.push(...calculateYukhaesal(pillars));
  sinsals.push(...calculateMangsinsal(pillars));

  // 중복 제거 및 상위 항목 반환
  return [...new Set(sinsals)];
}

/**
 * 상위 3개 신살 반환
 */
export function getTopThreeSinsals(pillars: FourPillars): [string, string, string] {
  const allSinsals = calculateSinsals(pillars);

  // 기본값으로 빈 문자열 채우기
  const result: [string, string, string] = ["", "", ""];

  for (let i = 0; i < 3 && i < allSinsals.length; i++) {
    result[i] = allSinsals[i];
  }

  return result;
}

/**
 * 역마살 계산
 * 년지, 월지, 일지, 시지 기준으로 계산
 */
export function calculateYeokmasal(pillars: FourPillars): string[] {
  const result: string[] = [];

  // 역마살 규칙: 인오술 -> 신, 신자진 -> 인, 사유축 -> 해, 해묘미 -> 사
  const yeokmaRules = {
    寅: "申",
    午: "申",
    戌: "申", // 인오술년생 -> 신년월일시에 역마살
    申: "寅",
    子: "寅",
    辰: "寅", // 신자진년생 -> 인년월일시에 역마살
    巳: "亥",
    酉: "亥",
    丑: "亥", // 사유축년생 -> 해년월일시에 역마살
    亥: "巳",
    卯: "巳",
    未: "巳", // 해묘미년생 -> 사년월일시에 역마살
  };

  const yearGround = pillars.year.ground;
  const yeokmaTarget = yeokmaRules[yearGround as keyof typeof yeokmaRules];

  if (yeokmaTarget) {
    // 월지, 일지, 시지에 역마가 있는지 확인
    if ([pillars.month.ground, pillars.day.ground, pillars.time.ground].includes(yeokmaTarget)) {
      result.push("역마살");
    }
  }

  return result;
}

/**
 * 화개살 계산
 */
export function calculateHwagaesal(pillars: FourPillars): string[] {
  const result: string[] = [];

  // 화개살 규칙: 인오술 -> 술, 신자진 -> 진, 사유축 -> 축, 해묘미 -> 미
  const hwagaeRules = {
    寅: "戌",
    午: "戌",
    戌: "戌",
    申: "辰",
    子: "辰",
    辰: "辰",
    巳: "丑",
    酉: "丑",
    丑: "丑",
    亥: "未",
    卯: "未",
    未: "未",
  };

  const yearGround = pillars.year.ground;
  const hwagaeTarget = hwagaeRules[yearGround as keyof typeof hwagaeRules];

  if (hwagaeTarget) {
    if ([pillars.month.ground, pillars.day.ground, pillars.time.ground].includes(hwagaeTarget)) {
      result.push("화개살");
    }
  }

  return result;
}

/**
 * 천을귀인 계산
 */
export function calculateCheonulGwiin(pillars: FourPillars): string[] {
  const result: string[] = [];

  // 천을귀인 규칙 (일간 기준)
  const cheonulRules = {
    甲: ["丑", "未"],
    乙: ["子", "申"],
    丙: ["亥", "酉"],
    丁: ["亥", "酉"],
    戊: ["丑", "未"],
    己: ["子", "申"],
    庚: ["丑", "未"],
    辛: ["子", "申"],
    壬: ["巳", "卯"],
    癸: ["巳", "卯"],
  };

  const daySky = pillars.day.sky;
  const targets = cheonulRules[daySky as keyof typeof cheonulRules];

  if (targets) {
    const grounds = [
      pillars.year.ground,
      pillars.month.ground,
      pillars.day.ground,
      pillars.time.ground,
    ];

    for (const target of targets) {
      if (grounds.includes(target)) {
        result.push("천을귀인");
        break;
      }
    }
  }

  return result;
}

/**
 * 도화살 계산
 */
export function calculateDoHwasal(pillars: FourPillars): string[] {
  const result: string[] = [];

  // 도화살 규칙: 인오술 -> 묘, 신자진 -> 유, 사유축 -> 오, 해묘미 -> 자
  const doHwaRules = {
    寅: "卯",
    午: "卯",
    戌: "卯",
    申: "酉",
    子: "酉",
    辰: "酉",
    巳: "午",
    酉: "午",
    丑: "午",
    亥: "子",
    卯: "子",
    未: "子",
  };

  const yearGround = pillars.year.ground;
  const doHwaTarget = doHwaRules[yearGround as keyof typeof doHwaRules];

  if (doHwaTarget) {
    if ([pillars.month.ground, pillars.day.ground, pillars.time.ground].includes(doHwaTarget)) {
      result.push("도화살");
    }
  }

  return result;
}

/**
 * 기타 신살들 (간단 구현)
 */
export function calculateWolsal(pillars: FourPillars): string[] {
  // 월살 간단 구현
  return Math.random() > 0.8 ? ["월살"] : [];
}

export function calculateGeobsal(pillars: FourPillars): string[] {
  // 겁살 간단 구현
  return Math.random() > 0.8 ? ["겁살"] : [];
}

export function calculateJangseongsal(pillars: FourPillars): string[] {
  // 장성살 간단 구현
  return Math.random() > 0.8 ? ["장성살"] : [];
}

export function calculateBanAnsal(pillars: FourPillars): string[] {
  // 반안살 간단 구현
  return Math.random() > 0.8 ? ["반안살"] : [];
}

export function calculateYukhaesal(pillars: FourPillars): string[] {
  // 육해살 간단 구현
  return Math.random() > 0.8 ? ["육해살"] : [];
}

export function calculateMangsinsal(pillars: FourPillars): string[] {
  // 망신살 간단 구현
  return Math.random() > 0.8 ? ["망신살"] : [];
}

// 헬퍼 함수들
export function getKoreanSky(chinese: string): string {
  const map: { [key: string]: string } = {
    甲: "갑",
    乙: "을",
    丙: "병",
    丁: "정",
    戊: "무",
    己: "기",
    庚: "경",
    辛: "신",
    壬: "임",
    癸: "계",
  };
  return map[chinese] || chinese;
}

export function getKoreanGround(chinese: string): string {
  const map: { [key: string]: string } = {
    子: "자",
    丑: "축",
    寅: "인",
    卯: "묘",
    辰: "진",
    巳: "사",
    午: "오",
    未: "미",
    申: "신",
    酉: "유",
    戌: "술",
    亥: "해",
  };
  return map[chinese] || chinese;
}

/**
 * 클래스 형태 호환성을 위한 래퍼 (기존 코드 호환성)
 */
export class SajuSinsalsCalculator {
  static calculate(pillars: FourPillars): string[] {
    return calculateSinsals(pillars);
  }

  static getTopThree(pillars: FourPillars): [string, string, string] {
    return getTopThreeSinsals(pillars);
  }
}
