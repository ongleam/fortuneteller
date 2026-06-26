# apps/

모노레포의 배포 가능한 애플리케이션들. 각 앱은 공유 패키지(`packages/*`)를 소비한다.

| 앱        | 스택             | 상태         | 설명                                                                                                    |
| --------- | ---------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| `web`     | Next.js 15       | ✅ 완료      | 사주팔자 소개팅 웹앱(`@fortuneteller/web`).                                                             |
| `kakao`   | Next.js (API)    | ✅ 분리 완료 | Kakao 챗봇(`@fortuneteller/kakao`). `/api/kakao` + callback. 배포·웹훅 전환은 ops 단계(앱 README 참조). |
| `ios`     | Swift / SwiftUI  | 🔜 예정      | 네이티브 iOS. Firebase SDK + Cloud Function `computeSaju` 호출.                                         |
| `android` | Kotlin / Compose | 🔜 예정      | 네이티브 Android. 동일.                                                                                 |

> **코드 공유:** 공유 백엔드(`packages/core` = AI 에이전트·tools·DB·config)와 사주 엔진(`packages/saju`)을 `web`·`kakao`가 함께 소비한다. 두 앱은 `@/lib`·`@/config` alias가 `packages/core`를 가리키도록 설정돼 있다.
> 네이티브는 TS를 실행할 수 없으므로 `services/functions`의 Cloud Function이 엔진을 감싸 호출한다.
>
> 진행 단계와 전체 아키텍처는 [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) 참조.
