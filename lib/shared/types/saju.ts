// 타입 정의
export interface UserInfo {
  name: string;
  gender: string;
  calendar: string;
  year: string;
  month: string;
  day: string;
  hour: string;
}

export interface Order3MakeResponse {
  statusCode: number;
  message: string;
  order3Id: number;
}

export interface Order3FreePayload {
  order3Id: number;
}

export interface SajuOutput {
  saju: any | null;
  sinsals: any | null;
}

// === 새로운 getSajuInfo 관련 타입 정의 ===

// 기본 입력 데이터
export interface BirthInput {
  name?: string;
  gender: string;
  calendar: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute?: string;
  isLeapMonth?: boolean;
}

// 사주 팔자
export interface SajuPillar {
  stem: string; // 천간
  branch: string; // 지지
}

export interface SajuPillars {
  year: SajuPillar; // 년주
  month: SajuPillar; // 월주
  day: SajuPillar; // 일주
  time: SajuPillar; // 시주
}

// 십성 분석
export interface PillarsTenStar {
  yearStem: string; // 년간 십성
  yearBranch: string; // 년지 십성
  monthStem: string; // 월간 십성
  monthBranch: string; // 월지 십성
  dayStem: string; // 일간 십성 (비견 고정)
  dayBranch: string; // 일지 십성
  timeStem: string; // 시간 십성
  timeBranch: string; // 시지 십성
}

// 오행 분석
export interface FiveElements {
  wood: number; // 목
  fire: number; // 화
  earth: number; // 토
  metal: number; // 금
  water: number; // 수
}

// 운세 정보
export interface FortuneInfo {
  currentAge: number;
  bigFortune: {
    current: any;
    next: any;
  };
  yearFortune: any;
}

// 신살 정보
export type TopThreeSinsals = [string, string, string];

// 단순화된 출력 구조 (권장)
export interface SimplifiedSajuOutput {
  basic: BirthInput;
  pillars: SajuPillars;
  tenStars: PillarsTenStar;
  elements: FiveElements;
  fortune: FortuneInfo;
  sinsals: TopThreeSinsals;
}

// Core 계산 결과 (내부 사용)
export interface SajuCoreResult {
  basic: BirthInput;
  pillars: SajuPillars;
  tenStars: PillarsTenStar;
  elements: FiveElements;
  fortune: FortuneInfo;
  sinsals: string[];
}

// fetchSaju 호환 출력 구조
export interface FetchSajuCompatibleOutput {
  name?: string;
  gender?: string;
  birth?: {
    type: string;
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  saju: any;
  sinsals: any;
  [key: string]: any; // Allow additional properties
}

// UI 최적화 출력 구조
export interface UiOptimizedSajuOutput {
  summary?: {
    name: string;
    birthInfo: string;
    calendar: string;
    gender: string;
    age: number;
  };
  user?: BirthInput;
  sajuPillars?: string;
  tenStarsGrid?: any[];
  elementsBalance?: FiveElements;
  currentFortune?: any;
  topSinsals?: TopThreeSinsals;
  [key: string]: any; // Allow additional properties
}

// getSajuInfo 옵션
export interface GetSajuInfoOptions {
  targetYear?: number;
}
