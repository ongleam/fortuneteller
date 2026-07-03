// fortune use-cases (프레임워크 무관). 어댑터(apps/web/src/{tools,actions})가 호출한다.
// 결과 포맷은 views.ts, 사주 계산은 domain(saju 엔진)이 소유한다.
import { getOrCreateProfileByUserKakaoId } from "@fortuneteller/modules/profile/infra/queries";
import { getSajuInfo } from "../domain/saju-info";
import { solarToLunar, lunarToSolar } from "../domain/calendar";
import { getFourPillars } from "../domain/four-pillars";
import { weatherClient } from "../infra/weather-client";
import { getTenStars } from "../domain/ten-stars";
import { getFiveElements } from "../domain/five-elements";
import type { BirthInput, FourPillars, TenStars, FiveElements } from "../domain/value-objects";

type Profile = Awaited<ReturnType<typeof getOrCreateProfileByUserKakaoId>>;
type SajuResult = Awaited<ReturnType<typeof getSajuInfo>>;

export type StoredSajuReading =
  | { hasStoredInfo: false }
  | { hasStoredInfo: true; profile: Profile; sajuResult: SajuResult };

/** 카카오 유저의 저장된 프로필로 사주를 계산한다. 정보 부족 시 hasStoredInfo:false. */
export async function getStoredSajuReading(kakaoUserId: string): Promise<StoredSajuReading> {
  const profile = await getOrCreateProfileByUserKakaoId({ user_kakao_id: kakaoUserId });

  if (!profile.gender || !profile.birth_year || !profile.birth_month || !profile.birth_day) {
    return { hasStoredInfo: false };
  }

  const sajuResult = await getSajuInfo({
    name: profile.name || "",
    gender: profile.gender,
    calendar: profile.birth_type || "양력",
    year: profile.birth_year.toString(),
    month: profile.birth_month.toString(),
    day: profile.birth_day.toString(),
    hour: profile.birth_time || "12",
  });

  return { hasStoredInfo: true, profile, sajuResult };
}

/** 입력받은 생년월일시로 사주를 계산한다. */
export function computeSaju(input: BirthInput) {
  return getSajuInfo(input);
}

export interface HarmonyReading {
  userProfile: Profile;
  partnerSaju: SajuResult;
  userSaju: SajuResult;
}

/** 유저(저장된 프로필)와 상대방의 사주를 계산해 궁합 분석 재료를 만든다. */
export async function computeHarmony(
  kakaoUserId: string,
  partner: BirthInput,
): Promise<HarmonyReading> {
  const userProfile = await getOrCreateProfileByUserKakaoId({ user_kakao_id: kakaoUserId });

  if (
    !userProfile.name ||
    !userProfile.gender ||
    !userProfile.birth_type ||
    !userProfile.birth_year ||
    !userProfile.birth_month ||
    !userProfile.birth_day
  ) {
    throw new Error("사용자의 사주 정보가 부족합니다. 먼저 프로필을 완성해주세요.");
  }

  const userSaju = await getSajuInfo({
    name: userProfile.name,
    gender: userProfile.gender,
    calendar: userProfile.birth_type,
    year: userProfile.birth_year.toString(),
    month: userProfile.birth_month.toString(),
    day: userProfile.birth_day.toString(),
    hour: userProfile.birth_time || "12",
  });

  const partnerSaju = await getSajuInfo(partner);

  return { userProfile, userSaju, partnerSaju };
}

/** 양력 → 음력 변환. 실패 시 null. */
export function convertSolarToLunar(year: number, month: number, day: number) {
  const solarDate = new Date(year, month - 1, day);
  return solarToLunar(solarDate);
}

/** 음력 → 양력 변환. */
export function convertLunarToSolar(year: number, month: number, day: number, isLeapMonth = false) {
  return lunarToSolar(year, month, day, isLeapMonth);
}

export interface SajuDebugResult {
  local?: FourPillars;
  localTenStars?: TenStars;
  localFiveElements?: FiveElements;
}

/** 로컬 사주 계산(디버그용). 각 항목 실패는 undefined 로 흡수. */
export async function calculateSajuDebug(birthInput: BirthInput): Promise<SajuDebugResult> {
  const local = await getFourPillars(birthInput);

  const localTenStars = local ? tryOr(() => getTenStars(local)) : undefined;
  const localFiveElements = local ? tryOr(() => getFiveElements(local)) : undefined;

  return { local, localTenStars, localFiveElements };
}

function tryOr<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

/** 위경도로 현재 날씨를 조회한다(외부 open-meteo API — infra/weather-client). */
export function fetchWeather(latitude: number, longitude: number) {
  return weatherClient.fetchWeather(latitude, longitude);
}
