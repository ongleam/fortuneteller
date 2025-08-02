# getSajuInfo 함수 개발 기능 명세서

## 1. 프로젝트 개요

### 1.1 목표
- **목적**: 기존 fetchSaju 함수를 대체하는 자체 구현 getSajuInfo 함수 개발
- **배경**: 외부 API 의존성 제거하고 자체 알고리즘으로 사주 계산 수행
- **요구사항**: fetchSaju와 동일한 정확도 보장하되, 구조적 복잡성 개선
- **핵심 개선점**: 복잡한 중첩 구조 단순화 및 개발 효율성 향상

### 1.2 입력 파라미터
```typescript
getSajuInfo(
  name: string,           // 이름 (예: "김은식")
  gender: string,         // 성별 (MALE/FEMALE)
  birthType: string,      // 생일 타입 (SOLAR/LUNAR)
  birthYear: string,      // 출생년도 (예: "1995")
  birthMonth: string,     // 출생월 (예: "04")
  birthDay: string,       // 출생일 (예: "25")
  birthTime: string       // 출생시간 (예: "08:30")
): Promise<SajuOutput>
```

### 1.3 출력 구조 개요

#### 1.3.1 단순화된 기본 구조 (권장)
```typescript
interface SimplifiedSajuOutput {
  basic: {
    name: string;
    gender: 'MALE' | 'FEMALE';
    birthDate: string;
    birthTime: string;
    birthType: 'SOLAR' | 'LUNAR';
  };
  
  pillars: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    time: { stem: string; branch: string };
  };
  
  tenStars: {
    yearStem: string; yearBranch: string;
    monthStem: string; monthBranch: string;
    dayStem: string; dayBranch: string;
    timeStem: string; timeBranch: string;
  };
  
  elements: { wood: number; fire: number; earth: number; metal: number; water: number };
  fortune: { currentAge: number; bigFortune: { current: any; next: any }; yearFortune: any };
  sinsals: [string, string, string];
}
```

#### 1.3.2 fetchSaju 호환 구조 (호환성 필요시)
- 기존 fetchSaju와 동일한 복잡한 구조
- 어댑터를 통해 단순 구조에서 변환 생성

## 2. fetchSaju 응답 구조 분석 및 개선 방향

### 2.1 기존 구조의 문제점
1. **과도한 중첩**: `saju.fortuneList.storedUnse` 등 불필요한 depth
2. **데이터 중복**: 같은 정보가 여러 곳에 다른 형태로 저장  
3. **복잡한 필드명**: `manseYearSkyRelation` 등 직관적이지 않은 네이밍
4. **UI 데이터 혼재**: 색상, 포맷팅 정보가 핵심 데이터와 섞임

### 2.2 기본 사주 정보 (기존 `saju.fortuneList.storedUnse`)
```json
{
  "gender": "MALE",
  "birthday": "1995-04-25", 
  "solarBirthday": "1995-04-25",
  "birthType": "SOLAR",
  "birthTime": "08:30",
  "targetYear": 2025,
  "yearSky": "乙", "yearGround": "亥",     // 년주: 을해
  "monthSky": "庚", "monthGround": "辰",   // 월주: 경진  
  "daySky": "丙", "dayGround": "戌",       // 일주: 병술
  "timeSky": "壬", "timeGround": "辰",     // 시주: 임진
  "bigFortuneNumber": 7,                   // 대운 순번
  "bigFortuneStartYear": "2002",           // 대운 시작년도
  "manseYearSkyRelation": "정인",          // 년간 십성
  "manseYearGroundRelation": "편관",       // 년지 십성
  "manseMonthSkyRelation": "편재",         // 월간 십성
  "manseMonthGroundRelation": "식신",      // 월지 십성
  "manseDaySkyRelation": "비견",           // 일간 십성 (자기 자신)
  "manseDayGroundRelation": "식신",        // 일지 십성
  "manseTimeSkyRelation": "편관",          // 시간 십성
  "manseTimeGroundRelation": "식신",       // 시지 십성
  "fiveTreeNum": 1,                        // 목 개수
  "fiveFireNum": 1,                        // 화 개수
  "fiveSoilNum": 3,                        // 토 개수
  "fiveIronNum": 1,                        // 금 개수
  "fiveWaterNum": 2                        // 수 개수
}
```

### 2.2 상세 사주 정보 (`saju.fortuneList.saju`)
각 주(년월일시)별로 다음 정보 포함:
```json
{
  "yearSky": {
    "chinese": "乙",           // 한자
    "korean": "을",            // 한글
    "fiveCircle": "목",        // 오행
    "fiveCircleColor": "#84d696",           // 색상
    "fiveCircleFrontColor": "#000000",      // 글자색
    "tenStar": "정인",         // 십성
    "minusPlus": "음"          // 음양
  },
  "yearGround": {
    // 천간과 동일한 구조 + 추가 정보
    "jijangGan": {             // 지장간
      "first": { "chinese": "戊", "korean": "무", "fiveCircle": "토", "rate": 7 },
      "second": { "chinese": "甲", "korean": "갑", "fiveCircle": "목", "rate": 7 },
      "third": { "chinese": "壬", "korean": "임", "fiveCircle": "수", "rate": 16 }
    },
    "sinsal": "겁살",          // 신살
    "unsung": "절",            // 십이운성
    "etcSinsal": ["천을귀인"]  // 기타 신살들
  }
}
```

### 2.3 운세 정보 (`saju.fortuneList.list`)
- **대운** (`bigFortune`): 0-10번까지 각 10년 주기 운세
- **소운** (`smallFortune`): 2021-2030년 각 년도 운세  
- **월운** (`monthFortune`): 1-12월 각 월 운세

각 운세는 천간/지지의 상세 정보를 동일한 구조로 포함

### 2.4 신살 정보 (`sinsals`)
```json
{
  "firstSinsal": "망신살",
  "secondSinsal": "장성살", 
  "thirdSinsal": "반안살"
}
```

## 3. 개선된 모듈 구조 설계

### 3.1 새로운 모듈 아키텍처
```
lib/saju/
├── core/                   # 핵심 계산 모듈
│   ├── pillars.ts         # 사주 팔자 계산
│   ├── ten-stars.ts       # 십성 계산  
│   ├── elements.ts        # 오행 분석
│   ├── fortunes.ts        # 운세 계산
│   └── sinsals.ts         # 신살 계산
├── adapters/              # 출력 형식 변환
│   ├── simple.ts          # 단순화된 구조
│   ├── fetchsaju.ts       # fetchSaju 호환
│   └── ui.ts              # UI 전용 구조  
├── utils/                 # 유틸리티
│   ├── calendar.ts        # 달력 변환
│   ├── constants.ts       # 상수 정의
│   └── validators.ts      # 입력 검증
└── index.ts               # 메인 함수
```

### 3.2 핵심 계산 모듈 (`lib/saju/core/`)

#### 3.2.1 사주 팔자 계산 (`pillars.ts`)
```typescript
export class SajuPillars {
  static calculate(birthData: BirthData): Pillars {
    return {
      year: { stem: '乙', branch: '亥' },
      month: { stem: '庚', branch: '辰' },
      day: { stem: '丙', branch: '戌' },
      time: { stem: '壬', branch: '辰' }
    };
  }
}
```

#### 3.2.2 십성 계산 (`ten-stars.ts`)
```typescript
export class SajuTenStars {
  static calculate(pillars: Pillars): TenStars {
    const dayStem = pillars.day.stem; // 일간 기준
    
    return {
      yearStem: this.getTenStar(dayStem, pillars.year.stem),
      yearBranch: this.getTenStar(dayStem, pillars.year.branch),
      // ... 나머지 계산
    };
  }
}
```

### 3.3 어댑터 모듈 (`lib/saju/adapters/`)

#### 3.3.1 단순 구조 어댑터 (`simple.ts`)
```typescript
export class SimpleAdapter {
  static convert(coreResult: SajuCoreResult): SimplifiedSajuOutput {
    return {
      basic: coreResult.basic,
      pillars: coreResult.pillars,
      tenStars: coreResult.tenStars,
      elements: coreResult.elements,
      fortune: coreResult.fortune,
      sinsals: coreResult.sinsals.slice(0, 3) as [string, string, string]
    };
  }
}
```

#### 3.3.2 fetchSaju 호환 어댑터 (`fetchsaju.ts`)
```typescript
export class FetchSajuAdapter {
  static convert(coreResult: SajuCoreResult): FetchSajuOutput {
    // 복잡한 중첩 구조로 변환
    return {
      saju: {
        fortuneList: {
          storedUnse: this.buildStoredUnse(coreResult),
          saju: this.buildDetailedSaju(coreResult),
          list: this.buildFortuneList(coreResult),
          fortune: this.buildCurrentFortune(coreResult)
        },
        formatUnse: this.buildFormatUnse(coreResult)
      },
      sinsals: this.buildSinsals(coreResult),
      order: this.buildMockOrder(coreResult)
    };
  }
}
```

### 3.4 메인 함수 개선 (`index.ts`)
```typescript
export async function getSajuInfo(
  name: string,
  gender: string,
  birthType: string,
  birthYear: string,
  birthMonth: string,
  birthDay: string,
  birthTime: string,
  options: {
    format?: 'simple' | 'fetchSaju' | 'ui';
    includeMetadata?: boolean;
    targetYear?: number;
  } = {}
): Promise<SajuOutput> {
  
  // 1. 입력 검증 및 정규화
  const birthInput = {
    name, gender, birthType, birthYear, birthMonth, birthDay, birthTime
  };
  const validInput = validateInput(birthInput);
  
  // 2. 핵심 계산 수행 (단순화된 구조)
  const coreResult = {
    basic: validInput,
    pillars: SajuPillars.calculate(validInput),
    tenStars: SajuTenStars.calculate(pillars),
    elements: SajuElements.calculate(pillars),
    fortune: SajuFortunes.calculate(pillars, options.targetYear),
    sinsals: SajuSinsals.calculate(pillars)
  };
  
  // 3. 형식에 맞게 변환 (기본값: 단순화된 구조)
  switch (options.format) {
    case 'fetchSaju':
      return FetchSajuAdapter.convert(coreResult); // 호환성 필요시에만
    case 'ui':
      return UIAdapter.convert(coreResult); // UI 전용 메타데이터 포함
    case 'simple':
    default:
      return SimpleAdapter.convert(coreResult); // 권장 기본 구조
  }
}
```

### 3.5 기본 데이터 구조 모듈 (`utils/constants.ts`)

#### 3.5.1 천간지지 데이터
```typescript
// 천간 (10개)
const HEAVENLY_STEMS = [
  { chinese: '甲', korean: '갑', fiveElement: '목', yangYin: '양' },
  { chinese: '乙', korean: '을', fiveElement: '목', yangYin: '음' },
  // ... 10개 전체
];

// 지지 (12개)  
const EARTHLY_BRANCHES = [
  { chinese: '子', korean: '자', fiveElement: '수', yangYin: '양' },
  { chinese: '丑', korean: '축', fiveElement: '토', yangYin: '음' },
  // ... 12개 전체
];
```

#### 3.5.2 오행 관계
```typescript
// 오행 상생: 목→화→토→금→수→목
const FIVE_ELEMENT_GENERATE = {
  '목': '화', '화': '토', '토': '금', '금': '수', '수': '목'
};

// 오행 상극: 목→토, 화→금, 토→수, 금→목, 수→화  
const FIVE_ELEMENT_OVERCOME = {
  '목': '토', '화': '금', '토': '수', '금': '목', '수': '화'
};
```

#### 3.5.3 십성 관계 테이블
```typescript
// 일간 기준 십성 계산 테이블
const TEN_STARS_TABLE = {
  // 같은 오행
  same_yang: '비견',    // 같은 양
  same_yin: '겁재',     // 같은 음
  // 일간이 생하는 오행  
  generate_yang: '식신', // 양을 생함
  generate_yin: '상관',  // 음을 생함
  // ... 나머지 관계들
};
```

### 3.6 달력 변환 모듈
**파일**: `lib/saju/utils/calendar.ts`

#### 3.6.1 양력↔음력 변환
```typescript
interface CalendarConverter {
  solarToLunar(year: number, month: number, day: number): LunarDate;
  lunarToSolar(year: number, month: number, day: number, isLeap: boolean): SolarDate;
  getSolarTerms(year: number): SolarTerm[]; // 24절기
}
```

#### 3.6.2 절기 기준 월 계산
```typescript
// 사주에서는 입춘 기준으로 년이 바뀜
// 각 월은 절기 기준 (예: 3월 = 경칩~청명)
function getSajuMonth(solarDate: Date): number {
  const solarTerms = getSolarTerms(solarDate.getFullYear());
  // 절기 기준으로 월 계산 로직
}
```

### 3.7 사주 계산 엔진 통합
**파일**: `lib/saju/core/pillars.ts` (기존 calculator.ts 대체)

#### 3.7.1 사주 팔자 도출 (단순화)
```typescript
interface SajuCalculator {
  calculateSaju(
    solarDate: Date,
    birthTime: string,
    gender: 'MALE' | 'FEMALE'
  ): SajuBasic;
}

interface SajuBasic {
  year: { sky: string; ground: string };   // 년주
  month: { sky: string; ground: string };  // 월주  
  day: { sky: string; ground: string };    // 일주
  time: { sky: string; ground: string };   // 시주
}
```

#### 3.7.2 십성 계산 (단순화)
```typescript
function calculateTenStars(saju: SajuBasic): TenStarAnalysis {
  const daySky = saju.day.sky; // 일간이 기준
  
  return {
    yearSky: getTenStar(daySky, saju.year.sky),
    yearGround: getTenStar(daySky, getMainStem(saju.year.ground)),
    // ... 나머지 계산
  };
}
```

#### 3.7.3 오행 통계 (단순화)
```typescript
function calculateFiveElements(saju: SajuBasic): FiveElementCount {
  // 천간 4개 + 지지의 지장간들을 모두 합산
  const allStems = [
    saju.year.sky, saju.month.sky, saju.day.sky, saju.time.sky,
    ...getHiddenStems(saju.year.ground),
    ...getHiddenStems(saju.month.ground),
    ...getHiddenStems(saju.day.ground),  
    ...getHiddenStems(saju.time.ground)
  ];
  
  return countFiveElements(allStems);
}
```

### 3.8 운세 계산 모듈
**파일**: `lib/saju/core/fortunes.ts`

#### 3.8.1 대운 계산 (단순화)
```typescript
interface FortuneCalculator {
  calculateBigFortune(
    saju: SajuBasic,
    gender: 'MALE' | 'FEMALE',
    birthYear: number
  ): BigFortuneInfo[];
}

// 대운 계산 규칙:
// 남성 + 양년 또는 여성 + 음년 → 순행 (월주 다음 순서)
// 남성 + 음년 또는 여성 + 양년 → 역행 (월주 이전 순서)
```

#### 3.8.2 소운/월운 계산 (단순화)
```typescript
function calculateSmallFortune(baseYear: number, targetYear: number): SmallFortuneInfo {
  // 매년 갑자에서 시작하여 순차 진행
}

function calculateMonthlyFortune(year: number, month: number): MonthlyFortuneInfo {
  // 년간과 월지 조합으로 월주 계산
}
```

### 3.9 신살 분석 모듈  
**파일**: `lib/saju/core/sinsals.ts`

#### 3.9.1 신살 계산 규칙 (단순화)
```typescript
interface SinsalCalculator {
  calculateAllSinsals(saju: SajuBasic): SinsalResult[];
  getTopThreeSinsals(sinsals: SinsalResult[]): TopThreeSinsals;
}

// 주요 신살들의 계산 규칙 예시:
const SINSAL_RULES = {
  '겁살': (saju) => checkGeobsal(saju),      // 년지 기준 특정 지지
  '천을귀인': (saju) => checkCheonul(saju), // 일간 기준 특정 지지
  '화개살': (saju) => checkHwagae(saju),    // 년지 기준 계산
  // ... 200여개 신살 규칙
};
```

### 3.10 결과 포매팅 모듈
**파일**: `lib/saju/adapters/` (기존 formatter.ts를 어댑터 패턴으로 분리)

#### 3.10.1 fetchSaju 호환 구조 생성 (어댑터 패턴)
```typescript
interface SajuFormatter {
  formatToFetchSajuStructure(
    basicInfo: SajuBasic,
    analysis: SajuAnalysis,
    fortunes: FortuneInfo,
    sinsals: SinsalResult[]
  ): SajuOutput;
}

// fetchSaju와 정확히 동일한 JSON 구조 생성
// 색상, 한자/한글 변환, UI 데이터 등 모든 필드 포함
```

## 4. 상세 구현 사양

### 4.1 사주 팔자 계산 예시
```
입력: 1995-04-25 08:30 (양력, 남성)

처리 과정:
1. 절기 계산: 1995년 청명(4/5) ~ 입하(5/6) → 3월
2. 만세력 계산:
   - 1995년 = 을해년 (乙亥)
   - 3월 = 경진월 (庚辰) 
   - 4월 25일 = 병술일 (丙戌)
   - 오전 8:30 = 진시 → 임진시 (壬辰)

결과: 乙亥 庚辰 丙戌 壬辰
```

### 4.2 십성 계산 상세
```
일간: 丙 (병화)를 기준으로:

년간 乙 (을목): 
- 목생화 → 인성계열
- 음목이 양화를 생함 → 정인

월간 庚 (경금):  
- 화극금 → 재성계열
- 양금이 양화에게 극당함 → 편재

시간 壬 (임수):
- 수극화 → 관성계열  
- 양수가 양화를 극함 → 편관
```

### 4.3 지장간 계산
```
지지별 지장간:
亥 (해): 壬水(16) + 甲木(7) + 戊土(7) = 30
辰 (진): 戊土(18) + 乙木(9) + 癸水(3) = 30  
戌 (술): 戊土(18) + 辛金(9) + 丁火(3) = 30
辰 (진): 戊土(18) + 乙木(9) + 癸水(3) = 30

비율은 각 지지별로 고정된 세력 분배
```

### 4.4 대운 계산 상세
```
남성 + 양년(1995) → 순행
월주 庚辰(3월) 다음 순서:

1운(7세, 2002년): 辛巳 (4월)
2운(17세, 2012년): 壬午 (5월)  
3운(27세, 2022년): 癸未 (6월)
4운(37세, 2032년): 甲申 (7월)
...

현재 2025년(31세) → 3운 癸未 중
```

## 5. 테스트 전략

### 5.1 개선된 테스트 전략

#### 5.1.1 단위 테스트 (핵심 모듈별)
```typescript
// 각 핵심 모듈 개별 테스트
describe('SajuPillars', () => {
  test('pillars calculation', () => {
    const pillars = SajuPillars.calculate(testInput);
    expect(pillars.year.stem).toBe('乙');
    expect(pillars.year.branch).toBe('亥');
  });
});

describe('SajuTenStars', () => {
  test('ten stars calculation', () => {
    const tenStars = SajuTenStars.calculate(testPillars);
    expect(tenStars.yearStem).toBe('정인');
  });
});
```

#### 5.1.2 어댑터 테스트
```typescript
describe('SimpleAdapter', () => {
  test('core to simple format conversion', () => {
    const simple = SimpleAdapter.convert(coreResult);
    expect(simple.pillars.year.stem).toBe('乙');
    expect(simple.tenStars.yearStem).toBe('정인');
  });
});
```

#### 5.1.3 호환성 테스트 (핵심 필드만)
```typescript
describe('fetchSaju compatibility', () => {
  test('essential fields match', async () => {
    const result = await getSajuInfo(testInput, { format: 'fetchSaju' });
    const expected = await fetchSaju(...testInput);
    
    // 핵심 필드만 비교 (UI 메타데이터 제외)
    const resultEssentials = extractEssentials(result);
    const expectedEssentials = extractEssentials(expected);
    
    expect(resultEssentials.pillars).toEqual(expectedEssentials.pillars);
    expect(resultEssentials.tenStars).toEqual(expectedEssentials.tenStars);
    expect(resultEssentials.elements).toEqual(expectedEssentials.elements);
  });
});

function extractEssentials(sajuOutput: any) {
  return {
    pillars: {
      year: { stem: sajuOutput.saju.fortuneList.storedUnse.yearSky },
      // ... 핵심 필드만 추출
    },
    tenStars: {
      yearStem: sajuOutput.saju.fortuneList.storedUnse.manseYearSkyRelation,
      // ... 핵심 필드만 추출  
    },
    elements: {
      wood: sajuOutput.saju.fortuneList.storedUnse.fiveTreeNum,
      // ... 핵심 필드만 추출
    }
  };
}
```

### 5.2 테스트 케이스 설계
```typescript
interface TestCase {
  name: string;
  input: {
    name: string;
    gender: 'MALE' | 'FEMALE';
    birthType: 'SOLAR' | 'LUNAR';
    birthYear: string;
    birthMonth: string; 
    birthDay: string;
    birthTime: string;
  };
  expected: SajuOutput; // fetchSaju 결과
}

const testCases: TestCase[] = [
  {
    name: "양력 남성 케이스",
    input: {
      name: "김은식",
      gender: "MALE",
      birthType: "SOLAR", 
      birthYear: "1995",
      birthMonth: "04",
      birthDay: "25", 
      birthTime: "08:30"
    },
    expected: /* fetchSaju 호출 결과 */
  },
  {
    name: "음력 여성 케이스",
    input: {
      name: "이영희",
      gender: "FEMALE",
      birthType: "LUNAR",
      birthYear: "1988",
      birthMonth: "03",
      birthDay: "15",
      birthTime: "14:30"
    },
    expected: /* fetchSaju 호출 결과 */
  },
  // 다양한 경계 케이스들...
  // - 윤달 케이스
  // - 절기 경계 케이스  
  // - 자시(23:00-01:00) 케이스
  // - 다양한 년도, 월, 일 조합
];
```

### 5.3 회귀 테스트 자동화
```typescript
describe('getSajuInfo 정확도 테스트', () => {
  testCases.forEach(testCase => {
    it(`${testCase.name} 정확도 검증`, async () => {
      const result = await getSajuInfo(
        testCase.input.name,
        testCase.input.gender,
        testCase.input.birthType,
        testCase.input.birthYear,
        testCase.input.birthMonth,
        testCase.input.birthDay,
        testCase.input.birthTime
      );
      
      // 주요 필드별 비교
      expect(result.saju.fortuneList.storedUnse.yearSky)
        .toBe(testCase.expected.saju.fortuneList.storedUnse.yearSky);
      
      // 전체 일치율 계산
      const matchRate = calculateMatchRate(result, testCase.expected);
      expect(matchRate).toBeGreaterThan(0.95); // 95% 이상
    });
  });
});
```

### 5.4 성능 테스트
```typescript
describe('getSajuInfo 성능 테스트', () => {
  it('응답시간 100ms 이하', async () => {
    const startTime = Date.now();
    
    await getSajuInfo("테스트", "MALE", "SOLAR", "1995", "04", "25", "08:30");
    
    const responseTime = Date.now() - startTime;
    expect(responseTime).toBeLessThan(100);
  });
});
```

## 6. 예상 개발 일정 (구조 개선 반영)

### Phase 1: 기반 구조 구축 (2일) - 단순화로 기간 단축
- [x] 기능 명세서 작성 (1일)
- [x] TypeScript 타입 정의 및 단순화된 인터페이스 (0.5일)  
- [x] 기본 상수 및 모듈 아키텍처 설정 (0.5일)

### Phase 2: 핵심 계산 로직 (3일) - 모듈화로 개발 효율성 향상
- [x] 달력 변환 유틸리티 구현 (0.5일)
- [진행중] 사주 팔자 계산 core 모듈 (1.5일) - 기본 구조 완성, 정확도 튜닝 필요
- [ ] 십성 및 오행 분석 core 모듈 (1일)

### Phase 3: 운세 및 신살 계산 (2일) - 단순화된 구조로 기간 단축  
- [ ] 대운/소운/월운 계산 core 모듈 (1일)
- [ ] 신살 계산 core 모듈 (1일)

### Phase 4: 어댑터 및 포매팅 (2일) - 새로운 어댑터 패턴
- [ ] Simple 어댑터 구현 (0.5일)
- [ ] FetchSaju 호환 어댑터 구현 (1일)
- [ ] UI 전용 어댑터 구현 (0.5일)

### Phase 5: 테스트 및 검증 (2일)
- [ ] 핵심 필드 테스트 케이스 생성 (0.5일)
- [ ] 어댑터 호환성 테스트 (1일)
- [ ] 성능 및 정확도 튜닝 (0.5일)

**총 예상 기간: 11일** (기존 15일 대비 27% 단축)

## 7. 성공 기준 및 검증 방법 (구조 개선 반영)

### 7.1 기능적 요구사항
- ✅ **정확도**: fetchSaju 핵심 필드와 95% 이상 일치
- ✅ **호환성**: 어댑터를 통한 기존 API 완전 호환  
- ✅ **완성도**: 모든 핵심 계산 로직 정확 구현
- ✅ **구조 개선**: 단순화된 내부 구조로 개발 효율성 향상

### 7.2 비기능적 요구사항  
- ✅ **성능**: 응답시간 50ms 이하 (구조 단순화로 개선)
- ✅ **안정성**: 모듈별 독립적 에러 처리
- ✅ **유지보수성**: 모듈화된 아키텍처로 유지보수 용이성 확보
- ✅ **확장성**: 새로운 출력 형식 추가 시 어댑터 패턴으로 쉬운 확장

### 7.3 검증 방법 (구조 개선 기반)
1. **모듈별 단위 테스트**: core 모듈 개별 기능 검증
2. **어댑터 테스트**: 각 출력 형식별 변환 로직 검증  
3. **호환성 테스트**: fetchSaju 핵심 필드 일치율 검증
4. **성능 테스트**: 단순화된 구조의 성능 개선 측정
5. **구조 품질 테스트**: 모듈 간 의존성 및 확장성 검증

## 8. 위험 요소 및 대응 방안 (구조 개선 기반)

### 8.1 주요 위험 요소
1. **사주 계산의 복잡성**: 전통 지식의 정확한 구현
2. **구조 단순화 과정**: 기능 손실 없는 구조 개선
3. **어댑터 호환성**: fetchSaju 완벽 호환성 유지
4. **모듈 간 의존성**: 과도한 결합도 방지

### 8.2 대응 방안 (구조 개선 전략)
1. **점진적 리팩토링**: core 모듈부터 단계적 구조 개선
2. **어댑터 우선 개발**: 호환성 보장을 위한 어댑터 패턴 우선 적용
3. **모듈별 독립 테스트**: 각 core 모듈의 독립적 검증
4. **구조 품질 모니터링**: 의존성 그래프 및 복잡도 지속 관찰

## 9. 결론

이 명세서는 fetchSaju의 복잡한 구조를 단순화하면서도 완벽한 호환성을 유지하는 getSajuInfo 함수 개발을 위한 종합적인 계획을 제시합니다.

### 9.1 주요 개선 사항
- **구조 단순화**: 중첩된 복잡 구조를 직관적인 형태로 개선
- **모듈화 아키텍처**: core/adapters/utils로 명확한 역할 분리
- **어댑터 패턴**: 다양한 출력 형식 지원으로 확장성 확보
- **개발 효율성**: 27% 개발 기간 단축 및 유지보수성 향상

### 9.2 기대 효과
- fetchSaju 대비 50% 성능 향상 (구조 단순화)
- 새로운 출력 형식 추가 시 어댑터만 개발하면 되는 확장성
- 모듈별 독립 개발 및 테스트 가능한 구조
- 향후 사주 관련 기능 확장 시 재사용 가능한 core 모듈

이 명세서를 바탕으로 체계적이고 효율적인 getSajuInfo 함수를 개발할 수 있을 것입니다.