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

interface CityCoord {
  /** GeoNames ID (forceteller locationId 와 동일). */
  geoNamesId: number;
  /** 한글 도시명. */
  korean: string;
  /** 영문 도시명. */
  english: string;
  /** 동경(degrees E). */
  longitudeE: number;
  /** 북위(degrees N). 참고용. */
  latitudeN: number;
}

const KOREAN_CITIES: ReadonlyArray<CityCoord> = [
  {
    geoNamesId: 1835847,
    korean: "서울",
    english: "Seoul",
    longitudeE: 126.978,
    latitudeN: 37.566,
  },
  {
    geoNamesId: 1838524,
    korean: "부산",
    english: "Busan",
    longitudeE: 129.075,
    latitudeN: 35.18,
  },
  {
    geoNamesId: 1843564,
    korean: "인천",
    english: "Incheon",
    longitudeE: 126.705,
    latitudeN: 37.456,
  },
  {
    geoNamesId: 1835327,
    korean: "대구",
    english: "Daegu",
    longitudeE: 128.601,
    latitudeN: 35.871,
  },
  {
    geoNamesId: 1841808,
    korean: "광주",
    english: "Gwangju",
    longitudeE: 126.852,
    latitudeN: 35.16,
  },
  {
    geoNamesId: 1835224,
    korean: "대전",
    english: "Daejeon",
    longitudeE: 127.385,
    latitudeN: 36.351,
  },
  {
    geoNamesId: 1833747,
    korean: "울산",
    english: "Ulsan",
    longitudeE: 129.311,
    latitudeN: 35.539,
  },
  {
    geoNamesId: 1841610,
    korean: "수원",
    english: "Suwon",
    longitudeE: 127.029,
    latitudeN: 37.264,
  },
  {
    geoNamesId: 1839726,
    korean: "성남",
    english: "Seongnam",
    longitudeE: 127.137,
    latitudeN: 37.444,
  },
  {
    geoNamesId: 1841066,
    korean: "고양",
    english: "Goyang",
    longitudeE: 126.832,
    latitudeN: 37.658,
  },
  {
    geoNamesId: 1841811,
    korean: "용인",
    english: "Yongin",
    longitudeE: 127.178,
    latitudeN: 37.241,
  },
  {
    geoNamesId: 1841603,
    korean: "부천",
    english: "Bucheon",
    longitudeE: 126.783,
    latitudeN: 37.504,
  },
  {
    geoNamesId: 1845136,
    korean: "안산",
    english: "Ansan",
    longitudeE: 126.83,
    latitudeN: 37.322,
  },
  {
    geoNamesId: 1845604,
    korean: "안양",
    english: "Anyang",
    longitudeE: 126.957,
    latitudeN: 37.394,
  },
  {
    geoNamesId: 1842616,
    korean: "전주",
    english: "Jeonju",
    longitudeE: 127.148,
    latitudeN: 35.824,
  },
  {
    geoNamesId: 1845789,
    korean: "천안",
    english: "Cheonan",
    longitudeE: 127.114,
    latitudeN: 36.815,
  },
  {
    geoNamesId: 1843137,
    korean: "청주",
    english: "Cheongju",
    longitudeE: 127.491,
    latitudeN: 36.642,
  },
  {
    geoNamesId: 1843841,
    korean: "춘천",
    english: "Chuncheon",
    longitudeE: 127.73,
    latitudeN: 37.881,
  },
  {
    geoNamesId: 1838716,
    korean: "포항",
    english: "Pohang",
    longitudeE: 129.343,
    latitudeN: 36.019,
  },
  {
    geoNamesId: 1832939,
    korean: "여수",
    english: "Yeosu",
    longitudeE: 127.662,
    latitudeN: 34.76,
  },
  {
    geoNamesId: 1832240,
    korean: "원주",
    english: "Wonju",
    longitudeE: 127.946,
    latitudeN: 37.342,
  },
  {
    geoNamesId: 1839068,
    korean: "포항시",
    english: "Pohang-si",
    longitudeE: 129.343,
    latitudeN: 36.019,
  },
  {
    geoNamesId: 1846326,
    korean: "강릉",
    english: "Gangneung",
    longitudeE: 128.876,
    latitudeN: 37.752,
  },
  {
    geoNamesId: 1839726,
    korean: "분당",
    english: "Bundang",
    longitudeE: 127.137,
    latitudeN: 37.444,
  },
  {
    geoNamesId: 1846114,
    korean: "김해",
    english: "Gimhae",
    longitudeE: 128.882,
    latitudeN: 35.235,
  },
  {
    geoNamesId: 1832906,
    korean: "제주",
    english: "Jeju",
    longitudeE: 126.523,
    latitudeN: 33.5,
  },
];

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

// 동적 좌표 조회(GeoNames REST API)는 외부 I/O 라 infra/geonames-client.ts 로 추출됨.

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
