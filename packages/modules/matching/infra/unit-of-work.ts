// matching UoW 팩토리 — 트랜잭션에 MatchingRepos 를 바인딩한다.
import { db } from "@fortuneteller/db/client";
import type { DbClient } from "@fortuneteller/db/client";
import {
  createUnitOfWork,
  type Transactional,
} from "@fortuneteller/shared/application/unit-of-work";
import type { MatchingRepos } from "@fortuneteller/modules/matching/domain/ports";
import { createMatchRepository } from "@fortuneteller/modules/matching/infra/repository";

export const matchingUowFactory = createUnitOfWork<MatchingRepos>(
  db as unknown as Transactional,
  (tx) => ({ matchRepo: createMatchRepository(tx as DbClient) }),
);
