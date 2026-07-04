# Architecture

> **이 문서는 프로젝트의 아키텍처와 폴더 구조에 대한 SSOT(Single Source Of Truth)입니다.**
>
> 디렉토리 구조, 레이어 구성, 의존성 방향, 주요 API, 데이터베이스 스키마 등 아키텍처에 관한 내용은 이 문서에만 기록합니다.
> `CLAUDE.md`를 포함한 다른 문서는 이 파일을 참조만 하며, 동일한 내용을 중복해서 기술하지 않습니다.
>
> **⚠️ 갱신 규칙: 아키텍처가 바뀔 때마다(디렉토리 추가/이동, 레이어 변경, 새 도메인 추가, 주요 API·DB 스키마 변경 등) 반드시 이 문서를 함께 업데이트해야 합니다.**

## Overview

This is a Next.js 15 fortune-telling/saju (Korean traditional fortune-telling) chatbot application that integrates with Kakao chatbot API.

> **ongleam형 DDD 모노레포.** bun workspaces 기반. **`apps/web`이 유일 배포 앱**(Vercel)이자 얇은 어댑터 레이어이고, 비즈니스 로직은 `packages/modules/<도메인>`, 기반 관심사는 concern별 패키지에 둔다.
>
> - **`apps/web`(`@fortuneteller/web`)** — 유일 배포 앱. `src/{app,actions,tools,agents,lib,components,hooks}` 어댑터 레이어. 카카오 엔드포인트(`/api/kakao` + callback)를 흡수했다(구 `apps/kakao` 제거).
> - **`packages/modules`(`@fortuneteller/modules`)** — 도메인 모듈 `fortune·profile·chat`. 각 모듈은 `domain/`(순수)·`application/`(handlers·views·dtos). fortune/domain 이 사주 계산 엔진(구 `@fortuneteller/saju` 흡수).
> - **`packages/db`(`@fortuneteller/db`)** — Drizzle 스키마·쿼리·마이그레이션.
> - **`packages/clients`(`@fortuneteller/clients`)** — 도메인-무지 외부 클라이언트(Supabase·Gemini).
> - **`packages/config`(`@fortuneteller/config`)** — 프롬프트·모델·사이트·엔타이틀먼트 (순수 데이터). provider 조립(registry)은 앱이 소유.
> - **`packages/shared`(`@fortuneteller/shared`)** — 공유 커널(타입·유틸·상수). leaf.
>
> 의존성 방향: **`apps/web → modules → {clients, db, config, shared}`**. `shared`·`domain` 은 leaf. 규칙은 `tests/architecture/`(bun test, `bun run test:arch`)가 강제한다. 데이터 저장소는 당분간 Postgres(Supabase)를 유지한다.

## Layering & Naming Convention (레이어·네이밍 규칙)

> Clean Architecture / DDD 링을 레포 위치에 매핑한다. **네이밍 중의성 해소**를 위해 "adapter"는 폴더명이 아니라 *역할*로만 쓰고, 링마다 고유 이름을 부여한다.

| CA 링                                      | 정체                                                         | 레포 위치                                         |
| ------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------- |
| Entities / Use Cases                       | 순수 도메인·유스케이스 + ports(인터페이스)                   | `packages/modules/<domain>/{domain, application}` |
| Interface Adapters — **inbound** (driving) | controller·delivery. use-case를 *호출*한다. **얇게 유지**    | `apps/<app>/src/{actions, tools, app/api/*}`      |
| Interface Adapters — **outbound** (driven) | 도메인 port 구현체(repository·gateway 조립). 컨텍스트에 종속 | `packages/modules/<domain>/infra`                 |
| Frameworks & Drivers                       | 도메인-무지 공유 기술 클라이언트(벤더 SDK 래퍼)              | `packages/clients/<system>`                       |
| Primary datastore                          | 앱 자체 Postgres(Drizzle 스키마·마이그레이션)                | `packages/db`                                     |

**네이밍 규칙:**

- **`packages/clients/<system>`** — 여러 모듈이 공유하는 외부 시스템 클라이언트. 도메인을 모른다. subpath export. **구 `packages/infra`에서 리네임 완료. 현 점유자: supabase✅, gemini✅.** 추출 후보: kakao. (aifortunedoctor·geonames·open-meteo 는 fortune 단독 소비라 `packages/clients` 대신 `fortune/infra` 에 둠 — 다중 소비자 생기면 clients 로 승격.)
- **provider 조립(composition root)** — `config`(inner)는 DAG상 `clients`(outer)를 import할 수 없으므로, `modelConfig`(config) + `google`(clients/gemini)를 묶는 `myProvider` registry는 **`apps/web/src/lib/registry.ts`(앱)**가 소유한다. `chat` 모듈 handler는 model을 **주입받는다**(inbound adapter `actions/chat.ts`가 `myProvider.languageModel(...)`을 넘김) — 모듈이 registry를 직접 import하지 않는다.
- **`packages/modules/<domain>/infra`** — 그 바운디드 컨텍스트의 **outbound/driven adapter** 계층. `domain`의 port를 `clients`·`db`(또는 inline HTTP)로 구현한다. 재사용 불가(컨텍스트 전용). _현 점유자: `fortune/infra`(saju-reference-client·weather-client·geonames-client) — 외부 I/O 를 `domain`·`application` 에서 격리 완료._
- **`apps/*`의 actions·tools·routes** = **inbound/driving adapter**(presentation). 마샬링만 하고 로직은 `application`으로.
- "adapter"는 역할 명칭일 뿐 폴더로 만들지 않는다. inbound는 apps, outbound는 `modules/*/infra`.
- **중의성 해소 핵심:** 공유 기술 계층과 컨텍스트 infra 계층이 같은 단어(`infra`)라 혼동되던 문제를, 공유 계층을 **`packages/clients`로 리네임**하여 해소했다. `infra`는 오직 모듈의 driven-adapter 계층 이름으로만 쓴다.

## Directory Structure

**모노레포 최상위:**

```
fortuneteller/
├── apps/
│   └── web/                    # ✅ 유일 배포 앱 (@fortuneteller/web) — kakao 챗봇 포함
│       ├── src/
│       │   ├── app/            # App Router (아래 라우트 그룹 참조)
│       │   ├── actions/        # inbound adapter — "use server" 서버 액션
│       │   ├── tools/          # inbound adapter — AI SDK tool 정의(LLM에 use-case 노출)
│       │   ├── agents/         # AI 에이전트 설정 (base.ts)
│       │   ├── lib/            # 프레임워크 글루 · registry.ts(provider 조립 = composition root)
│       │   ├── components/ hooks/ data/
│       ├── tests/              # jest(core/infrastructure/interfaces/shared) + playwright(e2e)
│       ├── drizzle.config.ts   # db:* 스크립트 소유 (packages/db 경로 지정)
│       ├── next.config.ts · tailwind.config.ts · jest.config.js · playwright.config.ts
│       └── package.json
├── packages/
│   ├── shared/                 # ✅ 공유 커널 (@fortuneteller/shared) — leaf, 워크스페이스 무의존
│   ├── config/                 # ✅ 런타임 설정 (@fortuneteller/config)  → shared
│   ├── db/                     # ✅ 데이터 접근 (@fortuneteller/db)      → shared
│   ├── clients/                # ✅ 외부 클라이언트 (@fortuneteller/clients) — Supabase
│   └── modules/                # ✅ 도메인 모듈 (@fortuneteller/modules) — fortune·profile·chat
├── tests/architecture/         # 레이어 의존성 규칙 테스트 (bun run test:arch)
├── docs/ · CLAUDE.md · turbo.json
├── bun.lock                    # 단일 락파일(워크스페이스 전체)
└── package.json                # 워크스페이스 루트: globs + 위임 스크립트 + prettier
```

- 워크스페이스: `bun` workspaces (`["apps/*", "packages/*"]`). 루트 스크립트는 `bun --filter`로 위임. (`turbo`는 미설치 — `turbo.json`은 향후용)
- 소비 방식: 앱·패키지는 `@fortuneteller/<pkg>/<subpath>` 로 서로를 import한다(각 패키지 `exports: {"./*": "./*.ts"}`). tsconfig `paths` + Next.js `transpilePackages`로 매핑.
- DB 마이그레이션: 스키마·마이그레이션은 `packages/db`에 있고 `migrate.ts`는 실행 CWD와 무관하게 모듈 기준으로 migrations 폴더를 찾는다. drizzle 설정·`db:*` 스크립트는 `apps/web`이 소유하며 패키지 경로(`../../packages/db/...`)를 가리킨다.

**`apps/web/src/app` 라우트 그룹:**

```
app/
├── (auth)/
│   ├── login/ · register/               # 로그인·회원가입 페이지
│   └── api/auth/kakao/route.ts          # Kakao OAuth 콜백(Supabase 세션 교환)
├── (root)/
│   ├── page.tsx · chat/[id]/ · saju/    # 메인 채팅·사주 페이지
│   └── api/{chat, history, vote}/route.ts
├── (debug)/debug/calendar/              # 디버그 페이지
├── api/kakao/{route.ts, callback/route.ts}   # Kakao 챗봇 스킬 콜백(백그라운드 처리)
└── layout.tsx
```

**`packages/modules` 구조 (도메인별 DDD 레이어):**

```
modules/
├── fortune/                    # 사주 엔진 + 운세 도메인
│   ├── domain/                 # 순수 계산(무 I/O): four-pillars·five-elements·ten-stars·sinsal·
│   │   │                       #   daeun·calendar·solar-terms·fortunes·time-correction 등
│   │   ├── value-objects.ts    #   입력·결과 타입(구 types.ts + output-types.ts 통합)
│   │   └── ports.ts            #   외부 I/O 계약(SajuReferenceClient·WeatherClient)
│   ├── infra/                  # outbound adapter — domain ports 구현(외부 I/O 격리)
│   │   ├── saju-reference-client.ts  #   외부 사주 API(aifortunedoctor)
│   │   ├── weather-client.ts         #   날씨(open-meteo)
│   │   └── geonames-client.ts        #   좌표 조회(geonames)
│   └── application/            # handlers(use-cases)·views
├── profile/application/        # handlers·views (프로필 CRUD)
└── chat/application/           # handlers·dtos  ⚠️ getKakaoUserInfo(kakao API) 포함
```

**나머지 패키지 파일 구성:**

```
shared/    types/ (ai·chat·kakao·models·attachment·certifcationDetail) · constants/ · utils/ (index·db·text·textPreprocess)
config/    prompts.ts · models.ts · registry.ts(provider 조립) · site.ts · entitlements.ts
db/        schema.ts · queries.ts(server-only) · migrate.ts · migrations/ · helpers/
clients/   supabase/{client, server, queries}.ts · gemini/client.ts
```

> ⚠️ 표시는 [Layering & Naming Convention](#layering--naming-convention-레이어네이밍-규칙)에 따라 `packages/clients` 또는 모듈 `infra`로 추출 예정인 외부 I/O 코드다.

**패키지 의존성 방향 (안쪽 ← 바깥쪽):**

```
shared (leaf)
  ↑
  ├── config      (→ shared)
  └── db          (→ shared)
        ↑
        ├── clients   (→ db)
        └── modules   (→ shared, config, db)
              ↑
              apps/web (→ shared, config, db, clients, modules)
```

원칙: 도메인별 응집성 · 의존성은 항상 안쪽(도메인)을 향한다 · 비즈니스 로직과 인프라 코드 분리. (`tests/architecture/`가 강제)

## Important APIs

**Kakao Integration:**

- `/api/kakao` + `/api/kakao/callback` — Kakao 챗봇 스킬 콜백. 백그라운드 처리 + 타임아웃(1000ms), quick replies·인터랙티브 UI 지원, DB↔UI 메시지 포맷 변환, `user_kakao_id` 연동.
- `/api/auth/kakao` — Kakao 로그인 OAuth 콜백(Supabase 세션 교환 + 카카오 프로필 조회).

**Fortune-telling Tools** (`apps/web/src/tools/*`, `packages/modules/fortune`):

- `getSaju()` — 생년월일 입력(또는 저장된 프로필)으로 사주 분석
- `getIdealTypeImage()` — 사주 부족 오행을 보완하는 '이상형' 이미지 생성(gemini-2.5-flash-image) → public Supabase Storage(`ideal-types` 버킷) 업로드 → 공개 URL 반환. 카카오는 `simpleImage` 로 대화창에 인라인 렌더.
- `getUserSaju()` — 저장된 사주 조회 · `updateSajuProfile()` — 생년월일·사주 저장
- `getTodayFortune()` / `getYearFortune()` — 일일·연간 운세
- `getHarmony()` — 두 사람 사주 궁합 분석
- 도구는 한국어 날짜·성별(`남성`/`여성`) 포맷을 기대하며, kakao_user_id 연동과 단독 사용 모두 지원.

## Database Schema

Drizzle로 관리하는 주요 테이블 (`packages/db/schema.ts`):

- `profiles` — 사주 계산용 생년월일 프로필. Kakao 연동용 `user_kakao_id` 포함
- `chats` — 대화. 채널 구분용 `channel` 필드
- `messages` — parts/attachments 구조의 메시지
- `votes` — 사용자 상호작용(up/down) 추적

## Tests

```
tests/architecture/            # 루트 — 레이어 의존성 규칙 강제 (bun run test:arch)
apps/web/tests/
├── core · infrastructure · interfaces · shared   # (jest) 단위/통합
├── kakao-api.test.ts                              # kakao 콜백 통합
├── e2e/                                           # (playwright) chat·db·reasoning·session
└── fixtures/ · pages/ · prompts/ · stubs/         # 테스트 지원
```

- 실행: `bun test`(jest) · `bun run test:arch`(아키텍처 규칙) · `bun test:playwright`(e2e). 상세 스크립트·게이트는 `CLAUDE.md` 참조.
