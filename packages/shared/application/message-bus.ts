// Message Bus (ongleam shared/application/message-bus 이식 — lean).
// 원본의 audit/tracer/error-notifier 인스트루멘테이션은 제외하고, 핵심 디스패치만 옮긴다:
//   - command → 단일 핸들러(결과 반환·에러 전파)
//   - event   → 등록된 핸들러들(best-effort, 예외 삼킴 + outcome 반환)
//   - cascade → 핸들러가 uow 로 발행한 이벤트를 세대별로 순차 처리(같은 세대는 병렬)
import type { DomainCommand, DomainEvent, Message } from "../domain/message";
import { withEventBuffer, type UnitOfWork, type UnitOfWorkFactory } from "./unit-of-work";

export type { DomainCommand, DomainEvent, Message };

export interface CommandHandlerEntry {
  readonly handle: (cmd: DomainCommand, uow: UnitOfWork<unknown>) => Promise<unknown>;
  readonly uowFactory?: UnitOfWorkFactory<unknown>;
  readonly name?: string;
}

export interface EventHandlerEntry {
  readonly handle: (event: DomainEvent, uow: UnitOfWork<unknown>) => Promise<unknown>;
  readonly uowFactory?: UnitOfWorkFactory<unknown>;
  readonly name?: string;
}

export type CommandHandlers = Record<string, CommandHandlerEntry>;
export type EventHandlers = Record<string, EventHandlerEntry[]>;

export interface EventDispatchOutcome {
  readonly ok: boolean;
  readonly result: unknown;
}

export interface MessageBus {
  handle<TResult = unknown>(message: Message): Promise<TResult>;
}

// uow 없는 핸들러(publish-only 등)용 대체 — run 은 금지, 이벤트 버퍼만 no-op.
const NOOP_UOW: UnitOfWork<unknown> = withEventBuffer(async () => {
  throw new Error("uow-less handler must not run a unit of work");
});

// createCommandEntry/EventEntry 는 bus 레지스트리(동적 디스패치) 경계라 타입을 느슨히 둔다.
// 핸들러 함수 자체는 (cmd: SomeCommand, uow: UnitOfWork<SomeRepos>) 로 정확히 타이핑되고,
// 등록 시점에만 any 로 소거된다.

/** command 엔트리 생성 — uowFactory + (cmd, uow) 핸들러. */
// biome-ignore lint/suspicious/noExplicitAny: bus registry boundary
export function createCommandEntry(
  uowFactory: UnitOfWorkFactory<any>,
  fn: (cmd: any, uow: any) => Promise<unknown>,
): CommandHandlerEntry {
  return { uowFactory, handle: (cmd, uow) => fn(cmd, uow), name: fn.name || undefined };
}

/** event 엔트리 생성. */
// biome-ignore lint/suspicious/noExplicitAny: bus registry boundary
export function createEventEntry(
  uowFactory: UnitOfWorkFactory<any>,
  fn: (event: any, uow: any) => Promise<unknown>,
): EventHandlerEntry {
  return { uowFactory, handle: (event, uow) => fn(event, uow), name: fn.name || undefined };
}

export interface BusLogger {
  error(message: string, error?: Error): void;
}

export function createMessageBus(
  commandHandlers: CommandHandlers,
  eventHandlers: EventHandlers,
  logger?: BusLogger,
): MessageBus {
  async function handleCommand(cmd: DomainCommand, queue: Message[]): Promise<unknown> {
    const entry = commandHandlers[cmd.type];
    if (!entry) throw new Error(`No handler for command: ${cmd.type}`);
    const uow = entry.uowFactory?.() ?? NOOP_UOW;
    const result = await entry.handle(cmd, uow);
    queue.push(...uow.collectNewEvents());
    return result;
  }

  async function handleEvent(
    event: DomainEvent,
    queue: Message[],
  ): Promise<EventDispatchOutcome[]> {
    const outcomes: EventDispatchOutcome[] = [];
    for (const entry of eventHandlers[event.type] ?? []) {
      try {
        const uow = entry.uowFactory?.() ?? NOOP_UOW;
        const result = await entry.handle(event, uow);
        queue.push(...uow.collectNewEvents());
        outcomes.push({ ok: true, result });
      } catch (err) {
        logger?.error(
          `[bus] exception handling event ${event.type}`,
          err instanceof Error ? err : undefined,
        );
        outcomes.push({ ok: false, result: err });
      }
    }
    return outcomes;
  }

  return {
    handle: async <TResult>(message: Message): Promise<TResult> => {
      const firstGen: Message[] = [];
      let firstResult: unknown;
      if (message._kind === "command") {
        firstResult = await handleCommand(message, firstGen);
      } else {
        firstResult = await handleEvent(message, firstGen);
      }

      // 이후 세대는 모두 이벤트 — 같은 세대 병렬, 세대 간 순차. cascade 는 best-effort.
      let currentGen = firstGen;
      while (currentGen.length > 0) {
        const nextGen: Message[] = [];
        await Promise.allSettled(currentGen.map((msg) => handleEvent(msg as DomainEvent, nextGen)));
        currentGen = nextGen;
      }

      return firstResult as TResult;
    },
  };
}
