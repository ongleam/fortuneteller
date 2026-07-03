// chat UoW 팩토리 — 트랜잭션에 ChatRepos 를 바인딩한다.
import { db, type DbClient } from "@fortuneteller/db/client";
import {
  createUnitOfWork,
  type Transactional,
} from "@fortuneteller/shared/application/unit-of-work";
import type { ChatRepos } from "@fortuneteller/modules/chat/domain/ports";
import { createChatRepository } from "@fortuneteller/modules/chat/infra/repository";

export const chatUowFactory = createUnitOfWork<ChatRepos>(db as unknown as Transactional, (tx) => ({
  chatRepo: createChatRepository(tx as DbClient),
}));
