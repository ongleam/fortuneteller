# 리팩토링 플랜 — ongleam형 DDD (어댑터 앱 + 도메인 모듈)

## 목표

ongleam-monorepo 구조에 맞춰: **`apps/web`은 얇은 어댑터 레이어**(Next 라우트·server actions·AI SDK tools·UI), **비즈니스 로직은 `packages/modules/<도메인>/application`(handlers·views)+`domain`**. kakao 앱은 제거해 web 엔드포인트로 흡수. Vercel은 web만 배포.

## 진행 상태 — ✅ 전부 완료

- ✅ `packages/{shared,config,db,clients}` 추출 (`infra`→`clients` 리네이밍 완료).
- ✅ `packages/modules/{fortune,profile,chat}` — domain + application(handlers·views·dtos). saju 엔진 → `fortune/domain` 흡수.
- ✅ 어댑터를 `apps/web/src/{tools,actions,agents,lib}` 로 이동, 얇은 래퍼로 모듈 handler/view 호출.
- ✅ `apps/web` → `src/` 레이아웃. kakao 엔드포인트 흡수(`apps/kakao` 제거). web-only 배포(`vercel.json`).
- ✅ `packages/core`·`packages/saju` 삭제.
- ✅ `tests/architecture/` 하네스 이식 — `bun run test:arch` 21/21 PASS.
- ✅ 검증: typecheck 6패키지 그린 · jest 40 PASS · Next `Compiled successfully`.

**최종 구조**: `apps/web` + `packages/{clients,config,db,modules,shared}` + `tests/architecture`. 의존성: `apps/web → modules → {clients,db,config,shared}`, shared·domain leaf.

## Phase 2 — ongleam CQRS/message-bus 이식 (진행 중)

**Foundation (✅ 완료·그린)**

- `packages/shared/domain/message.ts` — `Message`·`DomainCommand`·`DomainEvent`·`createCommand("Verb")<P>()`·`createEvent`.
- `packages/shared/application/unit-of-work.ts` — `UnitOfWork`·`UnitOfWorkFactory`·`withEventBuffer`·`createUnitOfWork(db, buildRepos)`(구조적 `Transactional`으로 shared leaf 유지).
- `packages/shared/application/message-bus.ts` — `createMessageBus`(command 단일·event best-effort·세대 cascade·event 버퍼) + `createCommandEntry`/`createEventEntry`. ongleam 대비 audit/tracer/error-notifier는 lean 제외.
- 도메인 포트: `modules/{fortune,profile,chat}/domain/ports.ts` (repo·client 계약).

**Phase 2 배선 (남음 — 사용자와 동시 편집 중이라 조율 필요)**

1. `packages/db/client.ts` — `DbClient` 타입(트랜잭션).
2. 모듈별 `domain/commands.ts`·`events.ts`(VERB 패턴), `infra/repository.ts`(포트 구현·tx 바인딩), `infra/unit-of-work.ts`(`create<M>Uow`).
3. 모듈 `application/handlers.ts` → command 핸들러(`createCommandEntry`)로 전환.
4. `apps/web/src/bootstrap/bus.ts` — 핸들러 레지스트리 + `createMessageBus` 조립. 어댑터(actions/tools)는 `bus.handle(UpdateSajuProfile({...}))`로 디스패치.
5. 내부 함수 네이밍 CRUD 컨벤션 일관화(get*/create*/update*/delete*, batch-first).

> ⚠️ 현재 사용자가 DI 리팩토링을 병행 중(registry→`apps/web/src/lib`, gemini→`packages/clients`, 핸들러 `model` 주입). Phase 2 모듈/어댑터 배선은 그 변경과 충돌하지 않게 조율 후 진행.

### 도메인 파일 구조 (ongleam 컨벤션 적용 — 완료)

ongleam 도 모듈마다 domain 파일 구성이 다르다(예: user 모듈엔 `entities.ts` 없음). fortuneteller 도 **실체가 있는 곳에만** 적용:

- **fortune/domain** — saju 계산 엔진(값·서비스). 이미 domain-rich.
- **profile/domain** — `value-objects.ts`(Gender·Calendar·BirthHour·UpdateSajuProfileInput·UpsertProfileResult). application/handlers 에서 도메인 타입을 domain 으로 내림.
- **chat** — 고유 도메인 값이 얇아 application-only(wire schema 는 `application/dtos.ts`).
- **commands.ts·events.ts (CQRS)** — 메시지 버스가 없어 **미적용**(YAGNI). 도입 시 `shared/domain` 에 `createCommand`/`createEvent` 커널 + 버스부터 필요.

## ongleam 레이어 규칙 (확인 완료)

```
apps/web/src/           # 어댑터 — 프레임워크·전송 종속
  app/                  #   Next 라우트 (api/kakao 포함)
  actions/              #   "use server" 서버 액션
  tools/                #   AI SDK tool() 정의
  agents/  lib/         #   baseAgent · 스트리밍 등 AI SDK glue
  components/ hooks/ config/ context/ utils/
packages/modules/<도메인>/
  domain/               # 엔티티·value-object·port (프레임워크 무관)
  application/          # handlers.ts(use-case) · views.ts(read 프로젝션) · ports.ts
  infra/                # repository 구현 (필요시)
```

흐름: **app/actions·tools (어댑터) → module/application/handlers·views → module/domain**.

## 최종 구조 (target)

```
apps/
  web/                              # 유일 배포 앱 (Vercel)
    src/
      app/
        api/kakao/route.ts          # ← apps/kakao 흡수
        api/kakao/callback/route.ts # ← apps/kakao 흡수
        (auth)/ (root)/ (debug)/ …
      actions/     # chat·profile·calendar·debug·kakao ("use server")
      tools/       # fortune·saju·harmony·profile·get-weather·test (AI SDK)
      agents/      # baseAgent
      lib/         # create-tool-calling-stream 등
      components/ hooks/ config/ …
packages/
  shared/ config/ db/ infra/        # ✅ 완료
  modules/
    fortune/  { domain(saju 엔진), application/{handlers,views,ports} }
    profile/  { application/{handlers,ports} }   # 실질 로직 있을 때만
    chat/     { application/{handlers,ports} }    # 실질 로직 있을 때만
```

## 실행 단계 (각 단계 typecheck 게이트)

### 4a. 모듈 application 정규화 (handlers/views 추출)

- 현재 tool/action 안의 **프레임워크 무관 use-case 로직**을 모듈 `application/handlers.ts`로, 결과 포맷은 `views.ts`로 추출.
- 의존(프로필 조회 등)은 `application/ports.ts` 인터페이스로 두고 app에서 db/infra 주입.
- fortune: `getTodayFortune·getYearFortune·computeHarmony·getSajuReading` 핸들러 + view.
- profile/chat: 진짜 로직 있을 때만 핸들러 생성(없으면 모듈 미생성 — YAGNI).

### 4b. 어댑터를 apps/web/src 로 이동

- `apps/web/{app,components,hooks,data,scripts}` → `apps/web/src/` 로 이동, `@/*` alias `./`→`./src/`.
- tools(AI SDK)·actions("use server")·agents(baseAgent)·lib(streaming) → `apps/web/src/{tools,actions,agents,lib}`. 각 어댑터는 모듈 handler/view 호출하는 얇은 래퍼로.

### 4c. kakao 앱 흡수

- `apps/kakao/app/api/kakao/{route,callback/route}.ts` → `apps/web/src/app/api/kakao/…`
- kakao 테스트/fixtures → web tests. `apps/kakao` 삭제, 루트 `workspaces`·스크립트·`transpilePackages`에서 kakao 제거.

### 4d. web-only 배포

- 루트 `workspaces`에서 kakao 제외(이미 흡수). Vercel 프로젝트가 `apps/web`만 빌드하도록 루트 배포 설정(`vercel.json`/build command) 확인·조정.

### 5. `core`·`saju` 패키지 삭제

- 빈 껍데기(`packages/core`, `packages/saju`) 제거. `@fortuneteller/core`·`@fortuneteller/saju` 참조를 `@fortuneteller/modules/*` 로 전면 치환(tsconfig paths·transpile·jest·deps).

### 6. 아키텍처 적합성 테스트 이식 (ongleam)

- `tests/architecture/`(bun test): 구조(모듈 디렉토리 화이트리스트·배럴 금지·테스트 위치) + 의존성 DAG(domain leaf·application→domain·app→module) + manifest honesty. `@fortuneteller/*`·우리 레이어로 적응. 루트 `test:arch` 스크립트.

### 7. `docs/ARCHITECTURE.md` 갱신

새 구조·레이어·의존성 방향·kakao 흡수·web-only 배포 기록.

## 검증 기준

- 단계별 `bun --filter '*' typecheck` PASS
- `bun run test:arch` PASS (구조·DAG·manifest 위반 0)
- 최종 web jest PASS, `bun build`(web) PASS
- 의존성 방향: `apps/web → modules → {infra,db,config,shared}`, shared/domain leaf

## 범위 밖

- `packages/ui`·`testing` 신설, turbo, Firebase 이전
