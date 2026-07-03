// profile UoW 팩토리 — 트랜잭션에 ProfileRepos 를 바인딩한다.
import { db } from "@fortuneteller/db/client";
import type { DbClient } from "@fortuneteller/db/client";
import {
  createUnitOfWork,
  type Transactional,
} from "@fortuneteller/shared/application/unit-of-work";
import type { ProfileRepos } from "@fortuneteller/modules/profile/domain/ports";
import { createProfileRepository } from "@fortuneteller/modules/profile/infra/repository";

export const profileUowFactory = createUnitOfWork<ProfileRepos>(
  db as unknown as Transactional,
  (tx) => ({ profileRepo: createProfileRepository(tx as DbClient) }),
);
