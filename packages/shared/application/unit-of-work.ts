// Unit of Work (ongleam shared/application/unit-of-work 이식).
// UoW 는 repos 를 트랜잭션에 바인딩해 제공하고, 핸들러가 발행한 도메인 이벤트를 버퍼링한다.
import type { DomainEvent } from "../domain/message";

export type UnitOfWork<TRepositories> = {
  <R>(fn: (repositories: TRepositories) => Promise<R>): Promise<R>;
  readonly addEvent: (event: DomainEvent) => void;
  readonly collectNewEvents: () => DomainEvent[];
};

export type UnitOfWorkFactory<TRepositories> = () => UnitOfWork<TRepositories>;

/** run(트랜잭션 실행기)에 이벤트 버퍼(addEvent/collectNewEvents)를 부착한다. */
export function withEventBuffer<TRepos>(
  run: <R>(fn: (repos: TRepos) => Promise<R>) => Promise<R>,
): UnitOfWork<TRepos> {
  const events: DomainEvent[] = [];
  return Object.assign(run, {
    addEvent: (e: DomainEvent) => {
      events.push(e);
    },
    collectNewEvents: () => {
      const out = [...events];
      events.length = 0;
      return out;
    },
  });
}

/** 트랜잭션을 지원하는 최소 DB 계약(구조적) — shared 를 leaf 로 유지한다. */
export interface Transactional {
  transaction<R>(fn: (tx: unknown) => Promise<R>): Promise<R>;
}

/**
 * db + repo 빌더로 UoW 팩토리를 만든다.
 *   const uow = createUnitOfWork(db, (tx) => ({ profileRepo: createProfileRepository(tx) }));
 *   await uow()(async (repos) => { ... });
 */
export function createUnitOfWork<TRepos>(
  db: Transactional,
  buildRepos: (tx: unknown) => TRepos,
): UnitOfWorkFactory<TRepos> {
  return () => withEventBuffer<TRepos>((fn) => db.transaction((tx) => fn(buildRepos(tx))));
}
