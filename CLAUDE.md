# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Common Scripts

- `bun dev` - Start development server with turbo and logging to logs/server.log
- `bun build` - Run database migrations and build Next.js app
- `bun start` - Start production server
- `bun format` - Format code with Prettier

### Database Operations

- `bun db:generate` - Generate Drizzle schema
- `bun db:migrate` - Run database migrations
- `bun db:studio` - Open Drizzle Studio (with TLS disabled)
- `bun db:push` - Push schema changes to database
- `bun db:pull` - Pull schema from database

### Testing

- `bun test:jest` - Run Jest tests for Supabase queries
- `bun test:playwright` - Run Playwright e2e tests

#### E2E Kakao Endpoints

E2E tests hit the Kakao callback (`/api/kakao`) against one of two stages:

| Stage       | E2E URL                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------- |
| local (dev) | `https://ibrahim-unresemblant-edwin.ngrok-free.dev/api/kakao` (ngrok tunnel → `localhost:3000`) |
| prod        | `https://saju.ongleam.com/api/kakao`                                                            |

- **local**: run `bun dev` first so the ngrok tunnel forwards to `localhost:3000`.
- **prod**: hits the live deployment directly.
- Default to the **local** endpoint (DEV is SSOT); target prod only to verify after promotion.

## Stages

There are exactly two stages: **dev** and **prod**.

- **dev** and **prod** share the **same database** (single shared DB). There is no separate dev DB — schema/data changes are immediately visible across both stages.
- Every feature **always starts from dev**: develop and verify on dev first, then promote the same change to prod. Never start a feature directly on prod.

## Project Architecture

> **아키텍처와 폴더 구조의 SSOT(Single Source Of Truth)는 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)입니다.**
>
> 디렉토리 구조(`lib/`·`tests/`), 레이어 구성과 의존성 방향, 주요 API(Kakao 연동·Fortune-telling Tools), 데이터베이스 스키마 등 아키텍처 관련 내용은 모두 해당 문서를 참조하세요.
>
> **아키텍처가 변경될 때마다 반드시 `docs/ARCHITECTURE.md`를 함께 업데이트해야 합니다.**

### Development Notes

- Uses `bun` as package manager
- TypeScript with strict configuration
- Tailwind CSS for styling with custom components in `components/ui/`
- Logs development output to `logs/server.log`
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
├── pages/                   # Playwright 페이지 객체 패턴
├── prompts/                 # 프롬프트 테스트 유틸리티
├── fixtures.ts              # Playwright 픽스처 (인증된 컨텍스트)
├── helpers.ts               # 테스트 헬퍼 함수
└── setup.ts                 # Jest 환경 설정
```

**테스트 실행 명령어:**

```bash
# 단위 테스트 (Jest)
bun test:jest                # Supabase 쿼리 단위 테스트
bun test:unit               # 모든 단위 테스트 (향후)
bun test:unit:saju          # Saju 모듈만 (향후)
bun test:unit:watch         # Watch 모드 (향후)

# E2E 테스트 (Playwright)
bun test:playwright         # E2E 테스트 실행

# 전체 테스트
bun test:all                # 모든 테스트 실행 (향후)
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
- ✅ 통합 테스트: `tests/routes/`, `tests/models/` 완료
- 🔄 사주 모듈 단위 테스트: `lib/core/saju/*.test.ts` → `tests/unit/core/saju/` 이동 예정
- 🔄 Package.json 스크립트 업데이트 예정
- 🔄 Jest 설정 최적화 예정 (커버리지, 테스트 매칭 패턴)

### @lib and @tests/ Structure

> `lib/`·`tests/`의 상세 디렉토리 구조는 SSOT인 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)를 참조하세요.
