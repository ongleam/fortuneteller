// daeun.ts — 대운(大運) · 연운(年運) · 월운(月運) 계산.
//
// 대운 알고리즘:
//   1. 방향: 양남음녀(陽男陰女) 순행 / 음남양녀 역행.
//      - 양남: 년주 천간이 양(甲丙戊庚壬) + 남성  → 순행
//      - 음녀: 년주 천간이 음(乙丁己辛癸) + 여성  → 순행
//      - 그 외 → 역행
//   2. 대운수(startAge): 출생 시각 ↔ (다음 또는 이전) 절기 시각의 일수 / 3.
//      순행이면 다음 절기, 역행이면 직전 절기까지 일수.
//   3. 시퀀스: 월주 60갑자 인덱스에서 ±1 씩 10개 (순행=+, 역행=-).
//
// 연운: 시작 연도(보통 활성 대운 시작 나이의 해)부터 10개의 양력 연도 60갑자.
// 월운: 시작 연도·월부터 12개월 60갑자 (월주 공식 적용).
//
// 각 entry 에 십성 + 12운성 + 지장간 정보가 함께 들어간다.

import { getFourPillars, getYearPillar } from "./four-pillars";
import {
  getStemInfo,
  getGroundInfo,
  getStemIndex,
  SIXTY_GAPJA,
} from "./constants";
import { getHiddenStems, getTwelveFortune } from "./chart-extras";
import { getTenStar, getMainSky } from "./ten-stars";
import { applyTimeCorrections } from "./time-correction";
import { lunarToSolar, normalizeCalendarType, getSajuYear } from "./calendar";
import type { BirthInput } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

// 대운수 계산에 사용하는 12 월건(月建) 절기. 중기 12개는 제외.
const MONTH_BUILDING_TERMS: ReadonlyArray<string> = [
  "입춘",
  "경칩",
  "청명",
  "입하",
  "망종",
  "소서",
  "입추",
  "백로",
  "한로",
  "입동",
  "대설",
  "소한",
];

function sixtyGapjaIndex(sky: string, ground: string): number {
  return SIXTY_GAPJA.findIndex((g) => g[0] === sky && g[1] === ground);
}

function decorateEntry(sky: string, ground: string, dayStem: string) {
  const skyInfo = getStemInfo(sky);
  const groundInfo = getGroundInfo(ground);
  return {
    sky,
    ground,
    gapja: `${sky}${ground}`,
    gapjaKorean: `${skyInfo?.korean ?? ""}${groundInfo?.korean ?? ""}`,
    skyElement: skyInfo?.fiveElement ?? "",
    groundElement: groundInfo?.fiveElement ?? "",
    tenStarSky: getTenStar(dayStem, sky),
    tenStarGround: getTenStar(dayStem, getMainSky(ground)),
    twelveFortune: getTwelveFortune(dayStem, ground),
    hiddenStems: getHiddenStems(ground),
  };
}

// 연 천간 → 그 해 정월(寅月)의 천간 시작 (오두법, 五頭法)
// 갑/기년 → 丙寅으로 시작, 을/경년 → 戊寅, 병/신년 → 庚寅, 정/임년 → 壬寅, 무/계년 → 甲寅
const YEAR_TO_FIRST_MONTH_STEM: Record<string, string> = {
  甲: "丙",
  己: "丙",
  乙: "戊",
  庚: "戊",
  丙: "庚",
  辛: "庚",
  丁: "壬",
  壬: "壬",
  戊: "甲",
  癸: "甲",
};

/** 양력 출생 시각을 BirthInput 에서 추출한다 (보정 전). */
function getSolarBirth(birthInput: BirthInput): Date {
  const y = parseInt(birthInput.year, 10);
  const m = parseInt(birthInput.month, 10);
  const d = parseInt(birthInput.day, 10);
  const h = parseInt(birthInput.hour, 10);
  const min = birthInput.minute ? parseInt(birthInput.minute, 10) : 0;
  const cal = normalizeCalendarType(birthInput.calendar);
  if (cal === "lunar") {
    const conv = lunarToSolar(y, m, d, birthInput.isLeapMonth || false);
    if (!conv) throw new Error("Invalid lunar date");
    return new Date(conv.year, conv.month - 1, conv.day, h, min);
  }
  return new Date(y, m - 1, d, h, min);
}

/**
 * 가장 가까운 24절기를 찾는다 (월주 경계가 되는 12개 主絶氣 + 中氣 모두 포함).
 * dataset 인덱스 효율을 위해 출생 연도 ±1 까지만 스캔.
 */
async function getNearestSolarTerms(solarBirth: Date): Promise<{
  prev: { date: Date; name: string } | null;
  next: { date: Date; name: string } | null;
}> {
  const y = solarBirth.getFullYear();
  const candidates: Array<{ date: Date; name: string }> = [];
  const { getSolarTermsByYear } = await import("./solar-terms");
  for (const yr of [y - 1, y, y + 1]) {
    const terms = getSolarTermsByYear(yr);
    for (const t of terms) {
      if (!MONTH_BUILDING_TERMS.includes(t.term_name)) continue;
      candidates.push({
        date: new Date(t.year, t.month - 1, t.day, t.hour, t.minute),
        name: t.term_name,
      });
    }
  }
  candidates.sort((a, b) => a.date.getTime() - b.date.getTime());
  let prev: { date: Date; name: string } | null = null;
  let next: { date: Date; name: string } | null = null;
  for (const c of candidates) {
    if (c.date.getTime() <= solarBirth.getTime()) prev = c;
    else if (next === null) {
      next = c;
      break;
    }
  }
  return { prev, next };
}

export interface DaeunEntry {
  sky: string;
  ground: string;
  gapja: string;
  gapjaKorean: string;
  skyElement: string;
  groundElement: string;
  tenStarSky: string;
  tenStarGround: string;
  twelveFortune: { korean: string; chinese: string } | null;
  hiddenStems: ReadonlyArray<string>;
  age: number;
  year: number;
}

export interface YearLuckEntry extends DaeunEntry {}
export interface MonthLuckEntry extends DaeunEntry {
  month: number;
}

export interface DaeunResult {
  startAge: number;
  direction: "순행" | "역행";
  isForward: boolean;
  entries: DaeunEntry[];
  yearLuck: YearLuckEntry[];
  monthLuck: MonthLuckEntry[];
}

export interface DaeunOptions {
  /** 연운/월운 시작 양력 연도. 생략 시 startAge + 출생연 (= 첫 대운 시작 해). */
  yearLuckStart?: number;
  /** 월운 시작 (연, 월). 생략 시 (yearLuckStart, 1). */
  monthLuckStart?: { year: number; month: number };
  /** 연운 개수 (기본 10). */
  yearLuckCount?: number;
  /** 월운 개수 (기본 12). */
  monthLuckCount?: number;
}

export async function getDaeun(
  birthInput: BirthInput,
  options: DaeunOptions = {},
): Promise<DaeunResult> {
  const pillars = await getFourPillars(birthInput);
  const yearStemInfo = getStemInfo(pillars.year.sky);
  if (!yearStemInfo) throw new Error("Invalid year stem");
  const isYang = yearStemInfo.yangYin === "양";
  const gender = birthInput.gender || "";
  const isMale = gender === "남성" || gender === "M" || gender === "남";
  const isForward = (isYang && isMale) || (!isYang && !isMale);

  // 보정된 시각으로 절기와의 일수 차이 계산.
  const solarBirth = getSolarBirth(birthInput);
  const correctedBirth = applyTimeCorrections(
    solarBirth,
    birthInput.longitudeE,
  );
  const { prev, next } = await getNearestSolarTerms(correctedBirth);
  // forceteller 룰: 일수는 절기일과 출생일의 *날짜 차이만* (시각 무시).
  // 통계 검증(N=10000): 보정 *전* 시각의 dayOf 가 보정 후보다 약간 정합률 높음.
  const dayOf = (d: Date): number =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const birthDay = dayOf(solarBirth);

  // 1차: 표준 방향. 순행=다음 절기, 역행=직전 절기까지의 일수.
  let daysToTerm = 0;
  if (isForward && next) {
    daysToTerm = (dayOf(next.date) - birthDay) / DAY_MS;
  } else if (!isForward && prev) {
    daysToTerm = (birthDay - dayOf(prev.date)) / DAY_MS;
  }
  // 절기 경계 보정: 차이가 1일 미만이면 반대 방향 절기까지 측정.
  // 이 경우 첫 대운 entry 의 나이는 0으로 시작.
  let boundaryHit = false;
  if (daysToTerm < 1) {
    boundaryHit = true;
    if (isForward && prev) {
      daysToTerm = (birthDay - dayOf(prev.date)) / DAY_MS;
    } else if (!isForward && next) {
      daysToTerm = (dayOf(next.date) - birthDay) / DAY_MS;
    }
  }
  const startAge = Math.round(daysToTerm / 3);
  const firstAge = boundaryHit ? 0 : startAge;

  const dayStem = pillars.day.sky;
  const monthGapjaIdx = sixtyGapjaIndex(
    pillars.month.sky,
    pillars.month.ground,
  );
  if (monthGapjaIdx < 0)
    throw new Error("Invalid month pillar in 60-gapja lookup");

  const entries: DaeunEntry[] = [];
  const solarYear = solarBirth.getFullYear();
  for (let i = 0; i < 10; i++) {
    const offset = i + 1;
    const idx = isForward
      ? (monthGapjaIdx + offset) % 60
      : (((monthGapjaIdx - offset) % 60) + 60) % 60;
    const [sky, ground] = SIXTY_GAPJA[idx];
    const age = firstAge + i * 10;
    entries.push({
      ...decorateEntry(sky, ground, dayStem),
      age,
      // forceteller 호환: age=0 인 boundary 케이스는 출생해 그대로,
      // age>0 인 일반 케이스는 한국 나이 기준 (출생해 1세 → age=N 은 solarYear + N - 1).
      year: age === 0 ? solarYear : solarYear + age - 1,
    });
  }

  // 연운: 시작 연도 기본값 = 첫 대운 시작 해 (한국 나이 기준).
  const yearLuckStart = options.yearLuckStart ?? solarYear + startAge - 1;
  const yearLuckCount = options.yearLuckCount ?? 10;
  const yearLuck: YearLuckEntry[] = [];
  for (let i = 0; i < yearLuckCount; i++) {
    const y = yearLuckStart + i;
    // 입춘 한참 후인 7월 1일 기준으로 사주년 결정 → 60갑자.
    const sajuYear = await getSajuYear(new Date(y, 6, 1));
    const yearGapja = getYearPillar(sajuYear);
    yearLuck.push({
      ...decorateEntry(yearGapja.sky, yearGapja.ground, dayStem),
      age: y - solarYear + 1,
      year: y,
    });
  }

  // 월운: 시작 (연, 월) 기본값 = (yearLuckStart, 1).
  const monthLuckStart = options.monthLuckStart ?? {
    year: yearLuckStart,
    month: 1,
  };
  const monthLuckCount = options.monthLuckCount ?? 12;
  // 월운의 사주년 천간은 *시퀀스 시작 시점의 사주년 컨텍스트*로 고정한다.
  // forceteller 룰: 12개 entries 가 한 사주년 흐름(寅 ~ 丑)에 묶여 있어서, 양력
  // 1월 entry 도 *직전 사주년이 아닌* 같은 사주년 천간으로 표시한다.
  const baseSajuYear = await getSajuYear(new Date(monthLuckStart.year, 5, 1));
  const baseYearPillar = getYearPillar(baseSajuYear);
  const firstMonthStem = YEAR_TO_FIRST_MONTH_STEM[baseYearPillar.sky];
  const baseFirstStemIdx = getStemIndex(firstMonthStem);
  const monthBranches = [
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
    "子",
    "丑",
  ];
  const monthLuck: MonthLuckEntry[] = [];
  for (let i = 0; i < monthLuckCount; i++) {
    const total = monthLuckStart.month - 1 + i;
    const y = monthLuckStart.year + Math.floor(total / 12);
    const m = (total % 12) + 1;
    // 사주월 인덱스: 양력 m → 사주월. 寅(2월절)부터 시작이라 sajuMonthOffset = (m - 2 + 12) % 12
    const sajuMonthOffset = (m - 2 + 12) % 12;
    const mSkyIdx = (baseFirstStemIdx + sajuMonthOffset) % 10;
    const mSky = SIXTY_GAPJA[mSkyIdx][0];
    const mGround = monthBranches[sajuMonthOffset];
    monthLuck.push({
      ...decorateEntry(mSky, mGround, dayStem),
      age: y - solarYear + 1,
      year: y,
      month: m,
    });
  }

  return {
    startAge,
    direction: isForward ? "순행" : "역행",
    isForward,
    entries,
    yearLuck,
    monthLuck,
  };
}
