# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Common Scripts

- `pnpm dev` - Start development server with turbo and logging to logs/debug.txt
- `pnpm build` - Run database migrations and build Next.js app
- `pnpm start` - Start production server
- `pnpm format` - Format code with Prettier

### Database Operations

- `pnpm db:generate` - Generate Drizzle schema
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio (with TLS disabled)
- `pnpm db:push` - Push schema changes to database
- `pnpm db:pull` - Pull schema from database

### Testing

- `pnpm test:jest` - Run Jest tests for Supabase queries
- `pnpm test:playwright` - Run Playwright e2e tests
- `pnpm test:promptfoo` - Run prompt evaluation tests
- `pnpm test:promptfoo:view` - View prompt test results

## Project Architecture

This is a Next.js 15 fortune-telling/saju (Korean traditional fortune-telling) chatbot application that integrates with Kakao chatbot API.

### Key Components

**Core Architecture:**

- Next.js App Router with grouped routes: `(auth)` and `(root)`
- Supabase for database with Postgres
- Drizzle ORM for type-safe database operations
- AI SDK for LLM integration with tools
- Redis for caching (Upstash)

**Main Features:**

- Saju (사주) fortune-telling with birth data analysis
- Kakao chatbot integration with skill responses
- User profile management and chat history
- AI agent with specialized tools for fortune-telling

### Directory Structure

**Current Implementation (도메인 중심 아키텍처 적용 완료):**

**lib/ 구조:**

```
lib/
├── core/                    # 핵심 비즈니스 로직
│   ├── saju/               # 사주 도메인 (✅ 완료)
│   │   ├── adapters.ts     # 출력 형식 어댑터
│   │   ├── calendar.ts     # 달력 변환 유틸리티
│   │   ├── constants.ts    # 사주 상수 및 매핑
│   │   ├── five-elements.ts # 오행 분석
│   │   ├── fortunes.ts     # 운세 계산
│   │   ├── index.ts        # 메인 진입점
│   │   ├── pillars.ts      # 사주 팔자 계산
│   │   ├── sinsals.ts      # 신살 분석
│   │   └── ten-stars.ts    # 십성 계산
│   ├── chat/               # 채팅 도메인
│   │   └── chat.ts
│   └── profile/            # 프로필 도메인
├── infra/         # 외부 의존성 및 데이터 접근 계층
│   ├── db/                 # 데이터베이스 스키마, 마이그레이션
│   │   ├── migrate.ts
│   │   ├── queries.ts
│   │   ├── schema.ts
│   │   └── migrations/
│   ├── redis/              # 캐시 관리
│   │   └── client.ts
│   ├── supabase/           # Supabase 클라이언트 및 쿼리
│   │   ├── client.ts
│   │   ├── queries.ts
│   │   └── server.ts
│   └── notion/             # Notion API 통합
│       └── client.ts
├── interfaces/             # 어댑터 계층 (외부 인터페이스)
│   ├── tools/              # AI 도구 (AI SDK 통합)
│   │   ├── saju.ts
│   │   ├── fortune.ts
│   │   ├── harmony.ts
│   │   ├── profile.ts
│   │   ├── get-weather.ts
│   │   └── test.ts
│   ├── actions/            # 서버 액션 (Next.js)
│   │   ├── chat.ts
│   │   ├── kakao.ts
│   │   ├── profile.ts
│   │   ├── redis.ts
│   │   ├── report.ts
│   │   └── slack.ts
│   └── agents/             # AI 에이전트 설정
│       └── base.ts
├── shared/                 # 공통 유틸리티 및 공유 리소스
│   ├── types/              # TypeScript 타입 정의
│   │   ├── ai.ts
│   │   ├── kakao.ts
│   │   ├── models.ts
│   │   ├── notion.ts
│   │   ├── saju.ts
│   │   └── certifcationDetail.ts
│   ├── constants/          # 애플리케이션 상수
│   │   └── index.ts
│   └── utils/              # 순수 유틸리티 함수
│       ├── index.ts
│       ├── db.ts
│       ├── embedding.ts
│       ├── errorHandler.ts
│       ├── registry.ts
│       ├── text.ts
│       └── textPreprocess.ts
└── response/               # 응답 처리 및 포맷팅
    └── create-tool-calling-stream.ts
```

**tests/ 구조:**

```
tests/
├── core/                   # Core 모듈 테스트
│   └── saju/               # 사주 모듈 테스트 (✅ 완료)
│       ├── adapters.test.ts
│       ├── calendar.test.ts
│       ├── five-elements.test.ts
│       ├── index.test.ts
│       ├── pillars.test.ts
│       └── ten-stars.test.ts
├── infra/         # infra 테스트
│   ├── supabase-queries.test.ts
│   └── redis-client.test.ts
├── interfaces/             # Interfaces 테스트
│   ├── tools-saju.test.ts
│   └── actions-chat.test.ts
├── shared/                 # Shared 유틸리티 테스트
│   ├── utils.test.ts
│   └── types.test.ts
├── e2e/                    # E2E 테스트 (Playwright)
│   ├── chat.test.ts
│   ├── db.test.ts
│   ├── reasoning.test.ts
│   └── session.test.ts
├── promptfoo/              # AI 프롬프트 평가
├── fixtures/               # 테스트 공통 파일들
│   ├── setup.ts
│   ├── helpers.ts
│   ├── fixtures.ts
│   └── data/
├── pages/                  # Playwright 페이지 객체
└── prompts/                # 테스트용 프롬프트
```

**이전 구조 (마이그레이션 완료):**

```
lib/
├── core/                    # 핵심 비즈니스 로직 (도메인별 분리)
│   ├── saju/               # 사주 도메인: 계산 로직, 유효성 검증, 변환 로직
│   ├── chat/               # 채팅 도메인: 메시지 처리, 세션 관리
│   └── profile/            # 프로필 도메인: 사용자 정보, 설정 관리
├── infra/         # 외부 의존성 및 데이터 접근 계층
│   ├── db/                 # 데이터베이스 스키마, 마이그레이션
│   ├── redis/              # 캐시 관리
│   ├── supabase/           # Supabase 클라이언트 및 쿼리
│   └── notion/             # Notion API 통합
├── interfaces/             # 어댑터 계층 (외부 인터페이스)
│   ├── tools/              # AI 도구 (AI SDK 통합)
│   ├── actions/            # 서버 액션 (Next.js)
│   └── agents/             # AI 에이전트 설정
├── shared/                 # 공통 유틸리티 및 공유 리소스
│   ├── types/              # TypeScript 타입 정의
│   ├── constants/          # 애플리케이션 상수
│   └── utils/              # 순수 유틸리티 함수
└── response/               # 응답 처리 및 포맷팅
```

**마이그레이션 원칙:**

- 도메인별 응집성: 관련 기능을 같은 도메인 폴더에 배치
- 의존성 방향: core ← infra, interfaces → core
- 관심사 분리: 비즈니스 로직과 인프라 코드 분리
- 확장성: 새로운 도메인이나 기능 추가 시 명확한 배치 위치

### Important APIs

**Kakao Integration:**

- `/api/kakao/callback` - Handles Kakao chatbot responses with background processing and timeout handling
- Processes user messages through AI agent and returns formatted responses
- Manages chat history and user profiles with `user_kakao_id` integration
- Supports quick replies and interactive UI elements
- Background task processing with configurable callback URLs
- Message format conversion between DB and UI structures

**Fortune-telling Tools:**

- `getSaju()` - Takes user birth data and returns saju analysis (can accept user input parameters or use stored profile)
- `getUserSaju()` - Retrieves stored saju information for existing users
- `updateSajuProfile()` - Updates/stores user birth data and saju information in profile
- `getTodayFortune()` - Daily fortune based on stored user profile
- `getYearFortune()` - Yearly fortune predictions
- `getHarmony()` - Analyzes compatibility between two people based on their saju information
- Tools expect Korean format dates and gender (`남성`/`여성`)
- Tools support both kakao_user_id for Kakao integration and standalone usage

### Database Schema

Key tables managed through Drizzle:

- `profiles` - User profiles with birth data for saju calculations, includes `user_kakao_id` for Kakao integration
- `chats` - Chat conversations with `channel` field for different communication channels
- `messages` - Chat messages with parts/attachments structure
- `votes` - User interaction tracking

### Development Notes

- Uses `pnpm` as package manager
- TypeScript with strict configuration
- Tailwind CSS for styling with custom components in `components/ui/`
- Logs development output to `logs/debug.txt`
- Environment requires TLS disabled for local database operations (`NODE_TLS_REJECT_UNAUTHORIZED=0`)
- Uses Korean language for user-facing content and fortune-telling responses
- Background processing for Kakao API with timeout handling (1000ms)
- Markdown removal utilities for clean message formatting
- Supports quick replies and interactive elements for Kakao chatbot

### File Encoding Guidelines (CRITICAL - 중요)

#### UTF-8 Encoding Requirements

- **ALWAYS use UTF-8 encoding** for ALL files without exception
- **ALWAYS verify UTF-8 encoding** after creating or modifying any file containing Korean text
- **NEVER use other encodings** (EUC-KR, CP949, etc.) - only UTF-8 is acceptable
- **CHECK encoding** immediately after file creation to prevent corruption

#### Korean Text Handling

- When creating files with Korean content:
  1. Ensure editor/IDE is set to UTF-8
  2. Save file explicitly as UTF-8
  3. Verify Korean characters display correctly
  4. Test by reopening the file
- Common Korean text that should display correctly:
  - 사주 (saju)
  - 년주, 월주, 일주, 시주 (year/month/day/hour pillars)
  - 양력/음력 (solar/lunar)
  - 남성/여성 (male/female)

#### Troubleshooting UTF-8 Issues

- If Korean text appears as `???`, `ì‚¬ì£¼`, or other garbled characters:
  1. File was not saved as UTF-8
  2. Recreate the file with proper UTF-8 encoding
  3. Copy content to new UTF-8 file
  4. Delete the corrupted file
- Use `file -I filename` command to check encoding on macOS
- Use `chardet` or similar tools to detect current encoding

#### Code Generation Rules

- **ALWAYS generate code with UTF-8 encoding in mind**
- **ALWAYS include UTF-8 BOM for files that will be opened in various editors**
- **VERIFY Korean text** in generated code displays correctly
- **TEST generated files** by reading them back to ensure encoding is preserved

#### File Types Requiring Special Attention

- `.tsx`, `.ts` - React/TypeScript files with Korean UI text
- `.json` - Data files with Korean content
- `.md` - Documentation with Korean examples
- `.sql` - Database scripts with Korean data
- `.env` - Configuration with Korean values

### Code Design Principles

**Function-First Design (함수 중심 설계):**

- **PREFER functions over classes** whenever possible for better modularity and testability
- Use pure functions that are predictable, testable, and side-effect free
- Organize code into small, composable functions rather than large class hierarchies
- Each function should have a single responsibility and clear input/output contract

**Function Design Guidelines:**

```typescript
// ✅ GOOD: Pure function with clear purpose
export function calculateSajuPillars(birthData: BirthInput): SajuPillars {
  // Single responsibility, no side effects, predictable output
}

// ✅ GOOD: Composed functions for complex operations
export function getSajuAnalysis(birthData: BirthInput): SajuAnalysis {
  const pillars = calculateSajuPillars(birthData);
  const elements = analyzeElements(pillars);
  const fortune = calculateFortune(pillars);
  return combineAnalysis(pillars, elements, fortune);
}

// ❌ AVOID: Large classes with multiple responsibilities
class SajuCalculator {
  calculatePillars() {
    /* ... */
  }
  analyzeElements() {
    /* ... */
  }
  calculateFortune() {
    /* ... */
  }
  generateReport() {
    /* ... */
  }
  saveToDatabase() {
    /* ... */
  }
}
```

**When to Use Classes vs Functions:**

- **Use functions for**: Business logic, calculations, data transformations, utilities
- **Use classes for**: UI components (React), database models, API clients with state
- **Consider objects for**: Configuration, data containers, complex state management

**Module Organization:**

- Group related functions in modules rather than classes
- Export individual functions for better tree-shaking and testing
- Use namespace objects sparingly, prefer direct function exports
- Keep side effects isolated in separate modules (database, API calls)

**Import Guidelines:**

- **ALWAYS use absolute imports** with the `@/` alias instead of relative imports
- ✅ GOOD: `import { calculateSaju } from '@/lib/utils/saju'`
- ❌ AVOID: `import { calculateSaju } from '../../utils/saju'`
- This improves code readability and prevents import path issues when files are moved
- Absolute imports make dependency relationships clearer and more maintainable

**Refactoring Guidelines:**

- **ALWAYS refactor existing functions in-place** rather than creating new files
- Preserve existing function signatures to maintain compatibility with tests and imports
- When splitting large functions, extract helper functions within the same file first
- Only create new files when adding entirely new functionality or domains
- Maintain git history by editing existing files instead of recreating them
- Update imports and exports gradually to avoid breaking existing code
- Run tests after refactoring to ensure compatibility is maintained

### Testing Strategy

**테스트 디렉토리 구조:**

```
tests/                          # 모든 테스트 파일 위치
├── unit/                      # 단위 테스트 (Jest) - 예정
│   ├── core/                  # 비즈니스 로직 테스트
│   │   └── saju/             # 사주 모듈 테스트 (lib/core/saju/*.test.ts 이동 예정)
│   ├── infra/        # 인프라 레이어 테스트
│   │   └── supabase/         # 데이터베이스 쿼리 테스트
│   └── shared/               # 공유 유틸리티 테스트
├── integration/              # 통합 테스트
│   ├── routes/               # API 라우트 테스트 (현재 routes/chat.test.ts)
│   └── models/               # AI 모델 통합 테스트 (현재 models/models.test.ts)
├── e2e/                      # E2E 테스트 (Playwright)
│   ├── chat.test.ts         # 채팅 기능 테스트
│   ├── db.test.ts           # 데이터베이스 E2E 테스트
│   ├── reasoning.test.ts    # AI 추론 테스트
│   └── session.test.ts      # 세션 관리 테스트
├── promptfoo/               # AI 프롬프트 평가 및 설정
├── pages/                   # Playwright 페이지 객체 패턴
├── prompts/                 # 프롬프트 테스트 유틸리티
├── fixtures.ts              # Playwright 픽스처 (인증된 컨텍스트)
├── helpers.ts               # 테스트 헬퍼 함수
└── setup.ts                 # Jest 환경 설정
```

**테스트 실행 명령어:**

```bash
# 단위 테스트 (Jest)
pnpm test:jest                # Supabase 쿼리 단위 테스트
pnpm test:unit               # 모든 단위 테스트 (향후)
pnpm test:unit:saju          # Saju 모듈만 (향후)
pnpm test:unit:watch         # Watch 모드 (향후)

# E2E 테스트 (Playwright)
pnpm test:playwright         # E2E 테스트 실행

# AI 프롬프트 테스트 (Promptfoo)
pnpm test:promptfoo          # 프롬프트 평가 실행
pnpm test:promptfoo:view     # 결과 뷰어

# 전체 테스트
pnpm test:all                # 모든 테스트 실행 (향후)
```

**테스트 유형별 가이드라인:**

**1. 단위 테스트 (Jest)**

- **목적**: 순수 함수와 비즈니스 로직 검증 (사주 계산, 유틸리티 함수)
- **위치**: `tests/unit/` (향후 lib/core/saju/\*.test.ts 이동 예정)
- **설정**: `jest.config.js`에서 `@/` 절대 경로 alias 지원
- **환경**: Node.js 환경, 환경 변수는 `tests/setup.ts`에서 로드
- **원칙**:
  - Mock 사용 최소화, 실제 함수 동작 검증
  - 절대 경로 import 사용 (`@/lib/core/saju`)
  - 테스트 데이터는 별도 파일로 관리

**2. 통합 테스트**

- **목적**: API 엔드포인트, 데이터베이스 연동, AI 모델 통합 검증
- **위치**: `tests/integration/`, `tests/supabase/`, `tests/models/`
- **특징**:
  - Supabase 클라이언트 모킹으로 데이터베이스 쿼리 테스트
  - AI 모델 응답 검증
  - API 라우트 end-to-end 테스트

**3. E2E 테스트 (Playwright)**

- **목적**: 사용자 시나리오 기반 전체 플로우 검증
- **위치**: `tests/e2e/`
- **설정**: `tests/fixtures.ts`에서 인증된 사용자 컨텍스트 제공
- **페이지 객체**: `tests/pages/`에서 재사용 가능한 페이지 클래스
- **특징**:
  - 자동 회원가입 및 로그인
  - 채팅 기능, 모델 선택, 세션 관리 테스트
  - 브라우저 상태 저장으로 테스트 속도 최적화

**4. AI 프롬프트 테스트 (Promptfoo)**

- **목적**: AI 프롬프트 품질 평가 및 회귀 테스트
- **위치**: `tests/promptfoo/`
- **설정**: `generated_config.yaml`로 자동 생성
- **활용**: 사주, 운세, 궁합 등 도메인별 프롬프트 성능 측정

**Jest 설정 (jest.config.js):**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup.ts'], // 환경 변수 로드
  verbose: true,
  testTimeout: 10000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // 절대 경로 alias
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // 향후 추가 예정:
  // testMatch: ['<rootDir>/tests/**/*.test.ts'],
  // collectCoverageFrom: ['lib/**/*.ts', '!lib/**/*.test.ts'],
  // coverageDirectory: 'coverage',
  // coverageReporters: ['text', 'lcov', 'html'],
};
```

**Package.json 스크립트 개선 예정:**

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:unit:saju": "jest tests/unit/core/saju",
    "test:unit:watch": "jest tests/unit --watch",
    "test:integration": "jest tests/integration tests/supabase tests/models tests/routes",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test tests/e2e",
    "test:promptfoo": "promptfoo eval -c tests/promptfoo/generated_config.yaml",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

**테스트 파일 작성 규칙:**

1. **파일명**: `*.test.ts` 확장자 사용
2. **Import 경로**: 절대 경로 사용 (`@/lib/...`)
3. **테스트 구조**: describe → test 계층 구조
4. **데이터**: 테스트 데이터는 별도 파일이나 fixtures 활용
5. **Mock**: 최소한으로 사용, 실제 구현 테스트 우선

**현재 마이그레이션 상태:**

- ✅ Playwright E2E 테스트: `tests/e2e/` 완료
- ✅ 데이터베이스 테스트: `tests/supabase/` 완료
- ✅ AI 프롬프트 테스트: `tests/promptfoo/` 완료
- ✅ 통합 테스트: `tests/routes/`, `tests/models/` 완료
- 🔄 사주 모듈 단위 테스트: `lib/core/saju/*.test.ts` → `tests/unit/core/saju/` 이동 예정
- 🔄 Package.json 스크립트 업데이트 예정
- 🔄 Jest 설정 최적화 예정 (커버리지, 테스트 매칭 패턴)

### @lib and @tests/ Structure

- **@lib 구조 (예정):**

  - `core/`: 핵심 비즈니스 로직 도메인별 분리
    - `saju/`: 사주 계산, 유효성 검증
    - `chat/`: 메시지 처리, 세션 관리
    - `profile/`: 사용자 정보, 설정 관리
  - `infra/`: 외부 의존성 및 데이터 접근 계층
    - `db/`: 데이터베이스 스키마, 마이그레이션
    - `redis/`: 캐시 관리
    - `supabase/`: Supabase 클라이언트 및 쿼리
  - `interfaces/`: 어댑터 계층
    - `tools/`: AI 도구 (AI SDK 통합)
    - `actions/`: 서버 액션 (Next.js)
    - `agents/`: AI 에이전트 설정
  - `shared/`: 공통 유틸리티
    - `types/`: TypeScript 타입 정의
    - `constants/`: 애플리케이션 상수
    - `utils/`: 순수 유틸리티 함수

- **@tests/ 구조 (현재 상태):**
  - `unit/`: 단위 테스트 (Jest)
    - `core/`: 비즈니스 로직 테스트
      - `saju/`: 사주 모듈 테스트
    - `infra/`: 인프라 레이어 테스트
    - `shared/`: 공유 유틸리티 테스트
  - `integration/`: 통합 테스트
    - `routes/`: API 라우트 테스트
    - `models/`: AI 모델 통합 테스트
  - `e2e/`: E2E 테스트 (Playwright)
  - `promptfoo/`: AI 프롬프트 평가
  - `pages/`: Playwright 페이지 객체
  - `prompts/`: 프롬프트 테스트 유틸리티
  - `fixtures.ts`: 테스트 고정값
  - `helpers.ts`: 테스트 헬퍼 함수
  - `setup.ts`: 테스트 환경 설정
