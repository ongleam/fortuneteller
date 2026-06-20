// 사주 계산 타입 정의 (핵심 4종: 사주팔자 · 십성 · 오행 · 음양력/절기)

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
