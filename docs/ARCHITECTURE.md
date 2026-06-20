# Architecture

> **이 문서는 프로젝트의 아키텍처와 폴더 구조에 대한 SSOT(Single Source Of Truth)입니다.**
>
> 디렉토리 구조, 레이어 구성, 의존성 방향, 주요 API, 데이터베이스 스키마 등 아키텍처에 관한 내용은 이 문서에만 기록합니다.
> `CLAUDE.md`를 포함한 다른 문서는 이 파일을 참조만 하며, 동일한 내용을 중복해서 기술하지 않습니다.
>
> **⚠️ 갱신 규칙: 아키텍처가 바뀔 때마다(디렉토리 추가/이동, 레이어 변경, 새 도메인 추가, 주요 API·DB 스키마 변경 등) 반드시 이 문서를 함께 업데이트해야 합니다.**

## Overview

This is a Next.js 15 fortune-telling/saju (Korean traditional fortune-telling) chatbot application that integrates with Kakao chatbot API.

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
