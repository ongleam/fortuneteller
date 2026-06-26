# @fortuneteller/saju

사주(四柱) 계산 엔진. 생년월일시(양/음력) → 사주팔자·십성·오행·신살·12운성·대운/연운·점수를 계산한다.

- **순수 TypeScript, 외부 npm 의존성 없음.** 절기 만세력(`solar-terms.ts`)을 번들로 포함.
- 웹(`apps/web`)·카카오 챗봇(`apps/kakao`)은 이 패키지를 직접 import 한다.
- 네이티브(iOS/Android)는 TS를 직접 실행할 수 없으므로 **Cloud Function(`services/functions`)이 이 패키지를 감싸 callable API로 노출**하고, 클라이언트는 그 결과를 호출/캐시한다.

## 사용

```ts
import { getSajuInfo } from "@fortuneteller/saju";

const saju = await getSajuInfo({
  gender: "남성",
  calendar: "양력",
  year: "1990",
  month: "5",
  day: "15",
  hour: "10",
});
```

서브경로도 노출한다: `@fortuneteller/saju/calendar`, `@fortuneteller/saju/four-pillars`, `@fortuneteller/saju/output-types` 등.

> 출력/UI 타입(`UserInfo`, `SajuOutput`, `SimplifiedSajuOutput` 등)은 `@fortuneteller/saju/output-types`에 있다.
