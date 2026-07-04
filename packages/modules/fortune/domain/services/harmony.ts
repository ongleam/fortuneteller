// 규칙 기반 궁합(harmony) 엔진 — 두 사주의 궁합을 0–100 결정적 점수로 산출한다.
// 순수 도메인 서비스: 동일 입력 → 동일 출력, 대칭(h(a,b)===h(b,a)). LLM 미사용.
import { getSajuInfo } from "./saju-info";
import { FIVE_ELEMENT_GENERATE, FIVE_ELEMENT_OVERCOME } from "../enums";
import type { BirthInput, FiveElements } from "../value-objects";

export interface HarmonyResult {
  score: number; // 0–100
  breakdown: {
    fiveElements: number; // 오행 상생/상극 균형 (0–40)
    branches: number; // 지지(일지) 합/충 (0–30)
    dayMaster: number; // 일간 음양·오행 궁합 (0–30)
  };
  summary: string; // 규칙 기반 짧은 설명
}

// === 지지 관계 테이블 (한글 지지 기준) ===
// 육합(六合): 두 지지가 만나 화합.
const SIX_HARMONY: ReadonlyArray<[string, string]> = [
  ["자", "축"],
  ["인", "해"],
  ["묘", "술"],
  ["진", "유"],
  ["사", "신"],
  ["오", "미"],
];
// 삼합(三合): 같은 국(局)에 속하면 화합.
const THREE_HARMONY_GROUPS: ReadonlyArray<ReadonlyArray<string>> = [
  ["신", "자", "진"], // 수국
  ["인", "오", "술"], // 화국
  ["사", "유", "축"], // 금국
  ["해", "묘", "미"], // 목국
];
// 충(沖): 정면 충돌.
const CLASH: ReadonlyArray<[string, string]> = [
  ["자", "오"],
  ["축", "미"],
  ["인", "신"],
  ["묘", "유"],
  ["진", "술"],
  ["사", "해"],
];

function pairMatches(table: ReadonlyArray<[string, string]>, x: string, y: string): boolean {
  return table.some(([p, q]) => (p === x && q === y) || (p === y && q === x));
}

function sameThreeHarmony(x: string, y: string): boolean {
  return THREE_HARMONY_GROUPS.some((g) => g.includes(x) && g.includes(y));
}

// 지지 한글 오행 → 지지 한글은 saju-info 의 groundKorean 을 쓴다.
// 일지(day branch) = 배우자궁(spouse palace) — 궁합의 핵심 축.
function scoreBranches(dayGroundA: string, dayGroundB: string): number {
  if (pairMatches(SIX_HARMONY, dayGroundA, dayGroundB)) return 30; // 육합
  if (sameThreeHarmony(dayGroundA, dayGroundB)) return 27; // 삼합
  if (pairMatches(CLASH, dayGroundA, dayGroundB)) return 6; // 충 — 긴장
  return 18; // 무관 — 중립
}

// 오행 상생/상극 관계로 일간 궁합 점수(0–30).
function scoreDayMaster(elA: string, yinYangA: string, elB: string, yinYangB: string): number {
  const generates =
    FIVE_ELEMENT_GENERATE[elA as keyof typeof FIVE_ELEMENT_GENERATE] === elB ||
    FIVE_ELEMENT_GENERATE[elB as keyof typeof FIVE_ELEMENT_GENERATE] === elA;
  if (generates) return 30; // 상생 — 최상
  if (elA === elB) return yinYangA !== yinYangB ? 24 : 18; // 동일 오행: 음양 조화 우대
  const overcomes =
    FIVE_ELEMENT_OVERCOME[elA as keyof typeof FIVE_ELEMENT_OVERCOME] === elB ||
    FIVE_ELEMENT_OVERCOME[elB as keyof typeof FIVE_ELEMENT_OVERCOME] === elA;
  if (overcomes) return 12; // 상극 — 긴장
  return 18; // 그 외 — 중립
}

// 두 사람의 오행 분포를 합산해 균형도(0–40)를 잰다. 고를수록 궁합 ↑.
function scoreFiveElements(a: FiveElements, b: FiveElements): number {
  const keys: (keyof FiveElements)[] = ["wood", "fire", "earth", "metal", "water"];
  const combined = keys.map((k) => a[k] + b[k]);
  const total = combined.reduce((s, v) => s + v, 0);
  if (total === 0) return 20;
  const avg = total / keys.length;
  const deviation = combined.reduce((s, v) => s + Math.abs(v - avg), 0);
  // 최대 편차: 전량이 한 오행에 몰릴 때 = (total-avg) + (keys-1)*avg = 2*(total-avg).
  const maxDeviation = 2 * (total - avg);
  const balance = maxDeviation === 0 ? 1 : 1 - deviation / maxDeviation;
  return 40 * balance;
}

/**
 * 두 사주의 궁합을 계산한다. 대칭·결정적·규칙 기반.
 * @param a 첫 번째 사람의 생년월일시
 * @param b 두 번째 사람의 생년월일시
 */
export async function computeHarmony(a: BirthInput, b: BirthInput): Promise<HarmonyResult> {
  const [sajuA, sajuB] = await Promise.all([getSajuInfo(a), getSajuInfo(b)]);

  const fiveElements = scoreFiveElements(sajuA.elements.distribution, sajuB.elements.distribution);
  const branches = scoreBranches(sajuA.pillars.day.groundKorean, sajuB.pillars.day.groundKorean);
  const dayMaster = scoreDayMaster(
    sajuA.dayMaster.element,
    sajuA.dayMaster.yangYin,
    sajuB.dayMaster.element,
    sajuB.dayMaster.yangYin,
  );

  const rawScore = fiveElements + branches + dayMaster;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    score,
    breakdown: {
      fiveElements: Math.round(fiveElements),
      branches: Math.round(branches),
      dayMaster: Math.round(dayMaster),
    },
    summary: buildSummary(score, { fiveElements, branches, dayMaster }),
  };
}

function buildSummary(
  score: number,
  parts: { fiveElements: number; branches: number; dayMaster: number },
): string {
  const grade =
    score >= 80
      ? "천생연분"
      : score >= 65
        ? "좋은 궁합"
        : score >= 45
          ? "무난한 궁합"
          : "노력이 필요한 궁합";
  const top = (
    [
      ["오행 균형", parts.fiveElements / 40],
      ["지지 조화", parts.branches / 30],
      ["일간 궁합", parts.dayMaster / 30],
    ] as [string, number][]
  ).reduce((best, cur) => (cur[1] > best[1] ? cur : best));
  return `${grade} · ${top[0]}이(가) 돋보입니다`;
}
