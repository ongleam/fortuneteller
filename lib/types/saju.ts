// 타입 정의
interface UserInfo {
  name: string;
  gender: string;
  birthType: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTime: string;
}

interface Order3MakeResponse {
  statusCode: number;
  message: string;
  order3Id: number;
}

interface Order3FreePayload {
  order3Id: number;
}

interface SajuOutput {
  saju: any | null;
  sinsals: any | null;
}

// === 새로운 getSajuInfo 관련 타입 정의 ===

// 기본 입력 데이터
interface BirthInput {
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthType: 'SOLAR' | 'LUNAR';
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTime: string;
}

// 사주 팔자
interface SajuPillar {
  stem: string; // 천간
  branch: string; // 지지
}

interface SajuPillars {
  year: SajuPillar; // 년주
  month: SajuPillar; // 월주
  day: SajuPillar; // 일주
  time: SajuPillar; // 시주
}

// 십성 분석
interface TenStars {
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
interface FiveElements {
  wood: number; // 목
  fire: number; // 화
  earth: number; // 토
  metal: number; // 금
  water: number; // 수
}

// 운세 정보
interface FortuneInfo {
  currentAge: number;
  bigFortune: {
    current: any;
    next: any;
  };
  yearFortune: any;
}

// 신살 정보
type TopThreeSinsals = [string, string, string];

// 단순화된 출력 구조 (권장)
interface SimplifiedSajuOutput {
  basic: BirthInput;
  pillars: SajuPillars;
  tenStars: TenStars;
  elements: FiveElements;
  fortune: FortuneInfo;
  sinsals: TopThreeSinsals;
}

// Core 계산 결과 (내부 사용)
interface SajuCoreResult {
  basic: BirthInput;
  pillars: SajuPillars;
  tenStars: TenStars;
  elements: FiveElements;
  fortune: FortuneInfo;
  sinsals: string[];
}
