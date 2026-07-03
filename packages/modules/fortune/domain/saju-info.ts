// 사주 계산 메인 오케스트레이터 (핵심 4종).
//
// 생년월일시(양/음력) → 사주팔자(四柱) → 십성(十星) → 오행(五行) 분포를 계산한다.
// 절기 기준 연/월 경계는 calendar.ts가 번들된 만세력(solar_terms.json)으로 판정한다.

import { getFourPillars } from "./four-pillars";
import { getTenStars } from "./ten-stars";
import { getFiveElements } from "./five-elements";
import { getStemInfo, getGroundInfo } from "./constants";
import { getHiddenStems, getTwelveFortune, getZodiac } from "./chart-extras";
import { getFourSinsal } from "./sinsal";
import { getDaeun } from "./daeun";
import { computePoints } from "./points";
import type { BirthInput, FourPillars, Pillar } from "./value-objects";

const STRONGEST_KO: Record<keyof ReturnType<typeof getFiveElements>, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

/**
 * 기둥(천간+지지)을 한글/오행 메타 + 지장간 + 12운성 으로 풀어준다.
 * @param pillar 풀어줄 기둥
 * @param dayStem 일간(나 자신) — 12운성은 일간 기준
 */
function describePillar(pillar: Pillar, dayStem: string) {
  const skyInfo = getStemInfo(pillar.sky);
  const groundInfo = getGroundInfo(pillar.ground);
  const fortune = getTwelveFortune(dayStem, pillar.ground);
  return {
    sky: pillar.sky,
    ground: pillar.ground,
    skyKorean: skyInfo?.korean ?? "",
    groundKorean: groundInfo?.korean ?? "",
    gapja: `${pillar.sky}${pillar.ground}`,
    gapjaKorean: `${skyInfo?.korean ?? ""}${groundInfo?.korean ?? ""}`,
    skyElement: skyInfo?.fiveElement ?? "",
    groundElement: groundInfo?.fiveElement ?? "",
    skyYangYin: skyInfo?.yangYin ?? "",
    groundYangYin: groundInfo?.yangYin ?? "",
    hiddenStems: getHiddenStems(pillar.ground),
    twelveFortune: fortune,
  };
}

/**
 * 사주 정보 계산 메인 함수
 * @param birthInput 생년월일시 정보
 * @returns 사주팔자 · 십성 · 오행(분포 + 일간 + 최강/최약 오행)
 */
export async function getSajuInfo(birthInput: BirthInput) {
  const pillars: FourPillars = await getFourPillars(birthInput);
  const tenStars = getTenStars(pillars);
  const elements = getFiveElements(pillars);

  const entries = Object.entries(elements) as [keyof typeof elements, number][];
  const strongest = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const weakest = entries.reduce((a, b) => (b[1] < a[1] ? b : a));

  const dayMaster = getStemInfo(pillars.day.sky); // 일간(나 자신)
  // 띠는 forceteller SSOT 호환: 일주(day pillar) 기준.
  const zodiac = getZodiac(pillars.day.sky, pillars.day.ground);
  const sinsal = getFourSinsal(pillars);

  // 대운(大運): 10년 단위 운의 흐름 · 점수(오행/십성 가중치).
  const daeun = await getDaeun(birthInput);
  const points = computePoints(pillars);

  // 현재 시점 맥락: 올해 나이 기준 현재 대운 entry.
  const birthYear = parseInt(birthInput.year, 10);
  const currentYear = new Date().getFullYear();
  const currentAge = Number.isFinite(birthYear) ? currentYear - birthYear + 1 : 0; // 세는나이 근사
  const currentDaeun =
    daeun.entries.length > 0
      ? daeun.entries
          .filter((e) => e.age <= currentAge)
          .reduce((a, b) => (b.age > a.age ? b : a), daeun.entries[0])
      : null;

  return {
    input: birthInput,
    pillars: {
      year: describePillar(pillars.year, pillars.day.sky),
      month: describePillar(pillars.month, pillars.day.sky),
      day: describePillar(pillars.day, pillars.day.sky),
      time: describePillar(pillars.time, pillars.day.sky),
    },
    dayMaster: {
      sky: pillars.day.sky,
      korean: dayMaster?.korean ?? "",
      element: dayMaster?.fiveElement ?? "",
      yangYin: dayMaster?.yangYin ?? "",
    },
    zodiac,
    sinsal,
    tenStars,
    elements: {
      distribution: elements,
      strongest: {
        key: strongest[0],
        korean: STRONGEST_KO[strongest[0]],
        count: strongest[1],
      },
      weakest: {
        key: weakest[0],
        korean: STRONGEST_KO[weakest[0]],
        count: weakest[1],
      },
    },
    points,
    daeun: {
      startAge: daeun.startAge,
      direction: daeun.direction,
      entries: daeun.entries,
    },
    now: {
      year: currentYear,
      age: currentAge,
      currentDaeun,
    },
  };
}
