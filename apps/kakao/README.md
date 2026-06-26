# @fortuneteller/kakao

Kakao 챗봇 앱. 사주 웹훅을 수신하고 LLM 응답을 비동기로 콜백한다. 비즈니스 로직은 직접 갖지 않고 전부 `@fortuneteller/core`(에이전트·tools·DB)에 위임한다.

## 라우트

| 경로                       | 역할                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `POST /api/kakao`          | 웹훅 수신부(얇음). 즉시 "생성 중" 응답을 돌려주고 `/api/kakao/callback`로 위임.       |
| `POST /api/kakao/callback` | 무거운 처리. `@fortuneteller/core`의 baseAgent로 LLM 호출 → Kakao callbackUrl로 응답. |

## 로컬 실행

```bash
bun dev:kakao        # 루트에서 (포트 3001)
# 또는
cd apps/kakao && bun dev
```

> web(3000)과 포트가 겹치지 않도록 **3001**을 쓴다.

## 환경변수

`@fortuneteller/core`가 DB(Postgres)·Supabase·AI 공급자를 사용하므로 web과 **동일한 env**가 필요하다
(`POSTGRES_URL`, Supabase 키, AI 키 등). `/ongleam-setup`으로 `apps/kakao/.env.local`을 생성한다.

## ⚠️ 배포 / 운영 (코드 분리와 별개의 ops 단계)

이 앱을 만들면서 챗봇 라우트는 web에서 이리로 **이전**되었다(단일 소스). 실제 운영 전환에는 다음이 필요하다:

1. **apps/kakao 배포** — 별도 호스트(예: 별도 Vercel 프로젝트)로 배포.
2. **Kakao 웹훅 URL 재설정** — Kakao 비즈니스 콘솔의 스킬 서버 URL을 새 배포 도메인의 `/api/kakao`로 변경.
3. **`packages/core/config/site.ts`의 `urls`** — 콜백 호스트가 kakao 배포 도메인을 가리키도록 갱신
   (`/api/kakao/callback`은 이 호스트 기준으로 구성된다).
4. **E2E/ngrok** — `tests` 및 ngrok 터널을 web(3000)이 아닌 kakao(3001)로 포워딩하도록 조정.

> 이 단계들을 완료하기 전까지 prod의 라이브 챗봇은 기존 web 배포 경로에 의존한다. dev에서 먼저 검증 후 promote.
