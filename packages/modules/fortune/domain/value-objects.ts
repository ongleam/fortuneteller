// fortune 도메인 값 객체 — 사주 계산 입력·결과의 원시 타입.
// (구 types.ts + output-types.ts 통합. 중복 정의였던 BirthInput·Pillar·FourPillars·
//  TenStars·FiveElements 를 단일 정의로 합쳤다. BirthInput 은 longitudeE 포함 superset.)

// === 핵심 입력·계산 결과 (사주팔자·십성·오행·절기) ===

// 기본 입력 데이터
export interface BirthInput {
  name?: string;
  gender: string; // "남성" | "여성" (대운 방향 등에 사용; 핵심 4종 계산엔 미사용)
  calendar: string; // "양력" | "음력" | "solar" | "lunar"
  year: string;
  month: string;
  day: string;
  hour: string;
  minute?: string;
  isLeapMonth?: boolean;
  // 출생지 동경(degrees E). 주면 진태양시 보정 적용 (longitude offset). 없으면 미적용.
  longitudeE?: number;
}

// 기둥(천간 + 지지)
export interface Pillar {
  sky: string; // 천간 (예: 甲)
  ground: string; // 지지 (예: 子)
}

// 사주(四柱) 팔자
export interface FourPillars {
  year: Pillar; // 년주
  month: Pillar; // 월주
  day: Pillar; // 일주
  time: Pillar; // 시주
}

// 십성(十星)
export interface TenStars {
  yearSky: string;
  yearGround: string;
  monthSky: string;
  monthGround: string;
  daySky: string; // 일간은 항상 비견
  dayGround: string;
  timeSky: string;
  timeGround: string;
}

// 오행(五行) 분포
export interface FiveElements {
  wood: number; // 목
  fire: number; // 화
  earth: number; // 토
  metal: number; // 금
  water: number; // 수
}

// 절기(SolarTerm) — 만세력 데이터 1행
export interface SolarTerm {
  year: number;
  term_name: string;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

// === 계산 파생 값 객체 (도메인 서비스가 산출) ===

// 띠(zodiac) 정보
export interface ZodiacInfo {
  gapjaKorean: string;
  animal: string;
  color: string;
  display: string;
}

// 대운/연운/월운
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
  yearLuckStart?: number;
  monthLuckStart?: { year: number; month: number };
  yearLuckCount?: number;
  monthLuckCount?: number;
}

// 점수(오행·십성 가중치)
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

// 신살(神煞)
export interface SinsalInfo {
  korean: string;
  chinese: string;
}
export interface FourSinsal {
  year: SinsalInfo | null;
  month: SinsalInfo | null;
  day: SinsalInfo | null;
  time: SinsalInfo | null;
}

// 도시 좌표 (진태양시 보정용)
export interface CityCoord {
  geoNamesId: number;
  korean: string;
  english: string;
  longitudeE: number;
  latitudeN: number;
}
