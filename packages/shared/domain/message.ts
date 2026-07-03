// 메시지 프리미티브 (ongleam shared/domain/message 이식).
// createCommand("Verb")<Payload>() → 커맨드 생성자. createEvent 도 동일.

export type DomainCommand = {
  readonly _kind: "command";
  readonly type: string;
  [key: string]: unknown;
};
export type DomainEvent = {
  readonly _kind: "event";
  readonly type: string;
  [key: string]: unknown;
};

export type Message = DomainCommand | DomainEvent;

// P의 모든 필드가 optional이면 argument 자체를 optional로 — `SendDailyReport()` 허용
type FactoryArgs<P> = Record<string, never> extends P ? [params?: P] : [params: P];

export function createCommand<N extends string>(name: N) {
  return function <P extends object>() {
    function factory(...args: FactoryArgs<P>): P & { readonly type: N; readonly _kind: "command" } {
      return { ...(args[0] ?? ({} as P)), type: name, _kind: "command" as const } as P & {
        readonly type: N;
        readonly _kind: "command";
      };
    }
    return Object.assign(factory, { type: name, _kind: "command" as const });
  };
}

export function createEvent<N extends string>(name: N) {
  return function <P extends object>() {
    function factory(...args: FactoryArgs<P>): P & { readonly type: N; readonly _kind: "event" } {
      return { ...(args[0] ?? ({} as P)), type: name, _kind: "event" as const } as P & {
        readonly type: N;
        readonly _kind: "event";
      };
    }
    return Object.assign(factory, { type: name, _kind: "event" as const });
  };
}
