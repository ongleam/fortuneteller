// chat 영속성 repository — 도메인 포트(ChatRepository)를 tx 바인딩으로 구현한다.
import type { DbClient } from "@fortuneteller/db/client";
import { message, chat, vote } from "@fortuneteller/db/schema";
import { and, eq, gte, inArray } from "drizzle-orm";
import type { ChatRepository } from "@fortuneteller/modules/chat/domain/ports";

/** tx(트랜잭션)에 바인딩된 ChatRepository 를 만든다. */
export function createChatRepository(tx: DbClient): ChatRepository {
  return {
    async createMessages({ messages }) {
      // NewMessage(도메인)는 parts/attachments 가 unknown — DB 컬럼 타입으로 위임.
      await tx.insert(message).values(messages as never);
    },

    async getMessageById({ id }) {
      return tx.select().from(message).where(eq(message.id, id));
    },

    async deleteMessagesByChatIdAfterTimestamp({ chatId, timestamp }) {
      const toDelete = await tx
        .select({ id: message.id })
        .from(message)
        .where(and(eq(message.chat_id, chatId), gte(message.created_at, timestamp)));
      const ids = toDelete.map((m) => m.id);
      if (ids.length > 0) {
        await tx.delete(vote).where(and(eq(vote.chat_id, chatId), inArray(vote.message_id, ids)));
        await tx.delete(message).where(and(eq(message.chat_id, chatId), inArray(message.id, ids)));
      }
    },

    async updateChatVisibility({ chatId, visibility }) {
      await tx.update(chat).set({ visibility }).where(eq(chat.id, chatId));
    },
  };
}
