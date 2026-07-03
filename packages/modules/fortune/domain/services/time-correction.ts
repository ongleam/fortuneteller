import type { CityCoord } from "../value-objects";
import { KOREAN_CITIES } from "../data/korean-cities";
// time-correction.ts — 한국 사주 시각 보정 (진태양시 환산).
//
// 입력 시각(현지 시계 표시)을 출생지 진태양시(local mean solar time)로 변환한다.
// 일주(자정 경계)와 시주(30분 시지 경계)에 영향. 월주는 절기 입절 시각 SSOT 가
// 한국 표준시 기준일 가능성이 커 보정에서 제외(현 N=100 회귀에서 월주 갭 0).
//
// 적용 보정 3종:
//   1. Longitude offset       : (longitudeE - 135) * 4 분 (표준자오선 동경 135°)
//   2. 한국 표준시 변경        : 1954-08-10 00:00 ~ 1961-08-09 24:00 KST = UTC+8:30
//                               → 표준자오선 135° 환산엔 +30분 보정
//   3. 한국 일광 절약시(DST)   : 정해진 기간 동안 시계가 1시간 앞당겨졌으므로 -60분
//
// 적용 순서: 입력 시각 = 보정된 시각 + (longitude + historical-KST + DST)
//   → 보정된 시각 = 입력 시각 + (longitude offset + historical-KST + DST)
//   (longitude offset 자체가 음수 가능)

const STANDARD_MERIDIAN_E = 135;

// 한국 표준시가 UTC+8:30 이었던 기간 [start, end). KST 시계 시각 기준.
// 자료: 위키 한국 표준시 — 1954-03-21 ~ 1961-08-09 (실제 적용 시각 00:30 부근이나
// 사주 정합 기준 N=1000 회귀에서 일자 단위 경계로 충분).
const HISTORICAL_KST_PLUS_8H30_START = new Date(1954, 2, 21, 0, 0).getTime();
const HISTORICAL_KST_PLUS_8H30_END = new Date(1961, 7, 10, 0, 0).getTime();

// 한국 일광 절약시(DST) 기간들 [start, end). KST 시계 시각 기준.
// 자료: 한국 표준시 위키 + IANA tz database (Asia/Seoul).
const DST_RANGES_KST: ReadonlyArray<readonly [Date, Date]> = [
  [new Date(1948, 4, 31, 24, 0), new Date(1948, 8, 12, 24, 0)],
  [new Date(1949, 3, 2, 24, 0), new Date(1949, 8, 10, 24, 0)],
  [new Date(1950, 2, 31, 24, 0), new Date(1950, 8, 9, 24, 0)],
  [new Date(1951, 4, 6, 0, 0), new Date(1951, 8, 8, 24, 0)],
  [new Date(1955, 4, 5, 0, 0), new Date(1955, 8, 8, 24, 0)],
  [new Date(1956, 4, 20, 0, 0), new Date(1956, 8, 29, 24, 0)],
  [new Date(1957, 4, 5, 0, 0), new Date(1957, 8, 21, 24, 0)],
  [new Date(1958, 4, 4, 0, 0), new Date(1958, 8, 20, 24, 0)],
  [new Date(1959, 4, 3, 0, 0), new Date(1959, 8, 19, 24, 0)],
  [new Date(1960, 4, 1, 0, 0), new Date(1960, 8, 17, 24, 0)],
  [new Date(1987, 4, 10, 2, 0), new Date(1987, 9, 11, 3, 0)],
  [new Date(1988, 4, 8, 2, 0), new Date(1988, 9, 9, 3, 0)],
];

/** 출생지 동경(degrees E) 기준으로 표준자오선(135°E) 대비 분 차이를 반환한다. */
export function getLongitudeOffsetMinutes(longitudeE: number): number {
  return (longitudeE - STANDARD_MERIDIAN_E) * 4;
}

// ─────────────────────────────────────────────────────────────────────────────
// 지역명 / locationId → longitude lookup
//
// 한국 주요 시·도 좌표 매핑. locationId 는 GeoNames ID 와 동일 (forceteller 확인).
// 사용자가 도시명을 입력하면 해당 좌표를 반환하고, 매핑에 없으면 null. 외부 의존
// 없이 즉시 응답하기 위한 정적 테이블이며, fetchLongitudeFromGeoNames 로 동적 확장 가능.
// 좌표는 시청·구청 위치 근사. 사주 longitude offset 은 분 단위라 ±0.1° 오차는 무관.


/** GeoNames ID(=forceteller locationId)로 longitude(degrees E) 조회. */
export function getLongitudeByGeoNamesId(id: number): number | null {
  const hit = KOREAN_CITIES.find((c) => c.geoNamesId === id);
  return hit ? hit.longitudeE : null;
}

/** 한글·영문 도시명으로 longitude(degrees E) 조회. 대소문자·공백 무시. */
export function getLongitudeByCityName(name: string): number | null {
  const normalized = name.trim().toLowerCase();
  const hit = KOREAN_CITIES.find(
    (c) => c.korean === name.trim() || c.english.toLowerCase() === normalized,
  );
  return hit ? hit.longitudeE : null;
}

/** 등록된 도시 좌표 매핑 (read-only view). */
export function getAllCityCoords(): ReadonlyArray<CityCoord> {
  return KOREAN_CITIES;
}

/** 한국 표준시(UTC+8:30) 기간이면 +30, 아니면 0. */
export function getHistoricalKstShiftMinutes(date: Date): number {
  const t = date.getTime();
  if (t >= HISTORICAL_KST_PLUS_8H30_START && t < HISTORICAL_KST_PLUS_8H30_END) return 30;
  return 0;
}

/** 한국 DST 적용 기간이면 -60, 아니면 0. */
export function getDstShiftMinutes(date: Date): number {
  const t = date.getTime();
  for (const [start, end] of DST_RANGES_KST) {
    if (t >= start.getTime() && t < end.getTime()) return -60;
  }
  return 0;
}

/**
 * 입력 시각(KST 시계)을 진태양시로 변환한다.
 * longitudeE 가 undefined 면 longitude 보정은 적용하지 않는다(역사·DST 만 적용).
 */
export function applyTimeCorrections(date: Date, longitudeE?: number): Date {
  let totalShiftMinutes = 0;
  if (longitudeE !== undefined) totalShiftMinutes += getLongitudeOffsetMinutes(longitudeE);
  totalShiftMinutes += getHistoricalKstShiftMinutes(date);
  totalShiftMinutes += getDstShiftMinutes(date);
  return new Date(date.getTime() + totalShiftMinutes * 60 * 1000);
}
