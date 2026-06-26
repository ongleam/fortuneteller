# Architecture

> **이 문서는 프로젝트의 아키텍처와 폴더 구조에 대한 SSOT(Single Source Of Truth)입니다.**
>
> 디렉토리 구조, 레이어 구성, 의존성 방향, 주요 API, 데이터베이스 스키마 등 아키텍처에 관한 내용은 이 문서에만 기록합니다.
> `CLAUDE.md`를 포함한 다른 문서는 이 파일을 참조만 하며, 동일한 내용을 중복해서 기술하지 않습니다.
>
> **⚠️ 갱신 규칙: 아키텍처가 바뀔 때마다(디렉토리 추가/이동, 레이어 변경, 새 도메인 추가, 주요 API·DB 스키마 변경 등) 반드시 이 문서를 함께 업데이트해야 합니다.**

## Overview

This is a Next.js 15 fortune-telling/saju (Korean traditional fortune-telling) chatbot application that integrates with Kakao chatbot API.

> **모노레포 전환 진행 중 (target: 사주팔자 소개팅).** bun workspaces 기반 모노레포로 재편 중이다. 배포 가능한 앱은 `apps/*`(web·kakao·ios·android), 공유 코드는 `packages/*`에 둔다. 완료 상태:
>
> - **`apps/web`(`@fortuneteller/web`)** — 소개팅 웹앱(이전 완료).
> - **`apps/kakao`(`@fortuneteller/kakao`)** — Kakao 챗봇 라우트(`/api/kakao` + callback) 분리 완료. _배포·웹훅 URL 전환은 별도 ops 단계_ (`apps/kakao/README.md`).
> - **`packages/core`(`@fortuneteller/core`)** — 공유 백엔드(AI 에이전트·tools·Drizzle DB·Supabase·도메인 액션·config) 추출 완료. web·kakao가 `@/lib`·`@/config` alias로 소비.
> - **`packages/saju`(`@fortuneteller/saju`)** — 사주 계산 엔진(추출 완료).
>
> 루트는 순수 워크스페이스 루트(글롭 + 위임 스크립트 + 공용 prettier)다. 데이터 저장소는 당분간 Postgres를 유지하며 이후 Firebase(Auth/FCM/Firestore)로 이전 예정이다.

## Key Components

**Core Architecture:**

- Next.js App Router with grouped routes: `(auth)` and `(root)`
- Supabase for database with Postgres
- Drizzle ORM for type-safe database operations
- AI SDK for LLM integration with tools

**Main Features:**

- Saju (사주) fortune-telling with birth data analysis
- Kakao chatbot integration with skill responses
- User profile management and chat history
- AI agent with specialized tools for fortune-telling

## Directory Structure

**Current Implementation (도메인 중심 아키텍처 적용 완료):**

**모노레포 최상위 구조 (전환 중):**

```
fortuneteller/
├── apps/                    # 배포 가능한 앱 (apps/README.md 참조)
│   ├── web/                # ✅ Next.js 소개팅 웹앱 (@fortuneteller/web)
│   │   ├── app/ components/ data/ hooks/ public/ scripts/ tests/
│   │   ├── next.config.ts · tailwind.config.ts · drizzle.config.ts
│   │   ├── jest.config.js · playwright.config.ts · tsconfig.json
│   │   └── package.json    #   앱 의존성·스크립트(dev/build/db:*/test)
│   ├── kakao/              # ✅ Kakao 챗봇 (@fortuneteller/kakao)
│   │   ├── app/api/kakao/{route.ts, callback/route.ts}
│   │   └── next.config.ts · tsconfig.json · package.json (포트 3001)
│   ├── ios/                #   🔜 Swift / SwiftUI
│   └── android/            #   🔜 Kotlin / Compose
├── packages/
│   ├── core/               # ✅ 공유 백엔드 (@fortuneteller/core)
│   │   ├── lib/            #    interfaces(agents·tools·actions)·infra(db·supabase)·shared·response
│   │   └── config/         #    prompts·models·site·entitlements
│   └── saju/               # ✅ 사주 엔진 (@fortuneteller/saju, 순수 TS·무의존)
│       └── src/            #    lib/core/saju 에서 추출. output-types.ts 포함
├── services/
│   └── functions/          # 🔜 Firebase Cloud Functions (네이티브용 computeSaju 등)
├── docs/ · CLAUDE.md · turbo.json
├── bun.lock                # 단일 락파일(워크스페이스 전체)
└── package.json            # 워크스페이스 루트: globs + 위임 스크립트 + prettier
```

- 워크스페이스: `bun` workspaces (`["apps/*", "packages/*"]`). 루트 스크립트는 `bun --filter`로 각 워크스페이스에 위임한다. (`turbo`는 미설치 — `turbo.json`은 향후용)
- **공유 코드 소비 방식:** `apps/web`·`apps/kakao`는 `@/lib/*`·`@/config/*` alias를 `packages/core`로, `@fortuneteller/saju`를 `packages/saju/src`로 매핑한다 — tsconfig `paths` + Next.js `transpilePackages` + (web) jest `moduleNameMapper` 3곳에 동일하게 설정. 덕분에 패키지로 옮긴 코드의 `@/lib`·`@/config` import를 **한 줄도 고치지 않고** 그대로 쓴다.
- `packages/core`는 자신이 import하는 npm 의존성(ai·zod·drizzle-orm·postgres·@supabase/\*·@ai-sdk/google 등)을 **직접 선언**한다(패키지 위생). `@fortuneteller/saju`를 의존한다.
- DB 마이그레이션: 스키마/마이그레이션은 `packages/core/lib/infra/db`에 있고, `migrate.ts`는 실행 CWD와 무관하게 모듈 기준으로 migrations 폴더를 찾는다. drizzle 설정·`db:*` 스크립트는 `apps/web`이 소유하며 패키지 경로(`../../packages/core/...`)를 가리킨다.
- 아래 `lib/` 구조는 이제 **`packages/core/lib/`** 기준이다(과거 `apps/web/lib`에서 이전). `tests/`는 여전히 `apps/web/tests/`에 있다.

**lib/ 구조 (`packages/core/lib/`):**

```
lib/
├── core/                    # 핵심 비즈니스 로직
│   ├── saju/               # ⛔ packages/saju (@fortuneteller/saju) 로 이전 완료
│   ├── chat/               # 채팅 도메인
│   │   └── chat.ts
│   └── profile/            # 프로필 도메인
├── infra/         # 외부 의존성 및 데이터 접근 계층
│   ├── db/                 # 데이터베이스 스키마, 마이그레이션
│   │   ├── migrate.ts
│   │   ├── queries.ts
│   │   ├── schema.ts
│   │   └── migrations/
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
│   └── supabase-queries.test.ts
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

## Important APIs

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

## Database Schema

Key tables managed through Drizzle:

- `profiles` - User profiles with birth data for saju calculations, includes `user_kakao_id` for Kakao integration
- `chats` - Chat conversations with `channel` field for different communication channels
- `messages` - Chat messages with parts/attachments structure
- `votes` - User interaction tracking

## @lib and @tests/ Structure

- **@lib 구조 (예정):**

  - `core/`: 핵심 비즈니스 로직 도메인별 분리
    - `saju/`: 사주 계산, 유효성 검증
    - `chat/`: 메시지 처리, 세션 관리
    - `profile/`: 사용자 정보, 설정 관리
  - `infra/`: 외부 의존성 및 데이터 접근 계층
    - `db/`: 데이터베이스 스키마, 마이그레이션
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
  - `pages/`: Playwright 페이지 객체
  - `prompts/`: 프롬프트 테스트 유틸리티
  - `fixtures.ts`: 테스트 고정값
  - `helpers.ts`: 테스트 헬퍼 함수
  - `setup.ts`: 테스트 환경 설정
