// chat/message/vote 쿼리 (standalone). ongleam infra 패턴 — 모듈이 SQL 소유.
import { and, asc, count, desc, eq, gt, gte, inArray, lt, type SQL } from "drizzle-orm";
import { db } from "@fortuneteller/db/client";
import { chat, message, vote, type Chat, type DBMessage } from "@fortuneteller/db/schema";
import { generateUUID } from "@fortuneteller/shared/utils";

export async function createChat({
  id,
  userId,
  title,
  channel,
}: {
  id: string;
  userId: string;
  title: string;
  channel?: "kakao" | "web";
}) {
  try {
    const [newChat] = await db
      .insert(chat)
      .values({
        id,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: userId,
        title,
        channel,
      })
      .returning();
    return newChat;
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chat_id, id));
    await db.delete(message).where(eq(message.chat_id, id));
    const [chatsDeleted] = await db.delete(chat).where(eq(chat.id, id)).returning();
    return chatsDeleted;
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;
    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(whereCondition ? and(whereCondition, eq(chat.user_id, id)) : eq(chat.user_id, id))
        .orderBy(desc(chat.created_at))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);
      if (!selectedChat) throw new Error(`Chat with id ${startingAfter} not found`);
      filteredChats = await query(gt(chat.created_at, selectedChat.created_at));
    } else if (endingBefore) {
      const [selectedChat] = await db.select().from(chat).where(eq(chat.id, endingBefore)).limit(1);
      if (!selectedChat) throw new Error(`Chat with id ${endingBefore} not found`);
      filteredChats = await query(lt(chat.created_at, selectedChat.created_at));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;
    return { chats: hasMore ? filteredChats.slice(0, limit) : filteredChats, hasMore };
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function getOrCreateKakaoChatByUserId({
  userId,
  title,
}: {
  userId: string;
  title: string;
}) {
  const existingChat = await db
    .select()
    .from(chat)
    .where(and(eq(chat.user_id, userId), eq(chat.channel, "kakao")))
    .orderBy(desc(chat.updated_at))
    .limit(1);

  if (existingChat.length > 0) return existingChat[0];

  return createChat({ id: generateUUID(), userId, title, channel: "kakao" });
}

export async function createMessages({ messages }: { messages: Array<DBMessage> }) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error("Failed to save messages in database", error);
    throw error;
  }
}

export async function getMessagesByChatId({ id, limit }: { id: string; limit?: number }) {
  try {
    if (limit) {
      const latestMessages = await db
        .select()
        .from(message)
        .where(eq(message.chat_id, id))
        .orderBy(desc(message.created_at))
        .limit(limit);
      return latestMessages.reverse();
    }
    return await db
      .select()
      .from(message)
      .where(eq(message.chat_id, id))
      .orderBy(asc(message.created_at));
  } catch (error) {
    console.error("Failed to get messages by chat id from database", error);
    throw error;
  }
}

export async function upsertVote({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.message_id, messageId)));
    if (existingVote) {
      return await db
        .update(vote)
        .set({ is_upvoted: type === "up" })
        .where(and(eq(vote.message_id, messageId), eq(vote.chat_id, chatId)));
    }
    return await db
      .insert(vote)
      .values({ chat_id: chatId, message_id: messageId, is_upvoted: type === "up" });
  } catch (error) {
    console.error("Failed to upvote message in database", error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chat_id, id));
  } catch (error) {
    console.error("Failed to get votes by chat id from database", error);
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error("Failed to get message by id from database");
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(and(eq(message.chat_id, chatId), gte(message.created_at, timestamp)));

    const messageIds = messagesToDelete.map((m) => m.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(and(eq(vote.chat_id, chatId), inArray(vote.message_id, messageIds)));
      return await db
        .delete(message)
        .where(and(eq(message.chat_id, chatId), inArray(message.id, messageIds)));
    }
  } catch (error) {
    console.error("Failed to delete messages by id after timestamp from database");
    throw error;
  }
}

export async function countUserMessages({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const since = new Date(Date.now() - differenceInHours * 60 * 60 * 1000);
    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chat_id, chat.id))
      .where(and(eq(chat.user_id, id), gte(message.created_at, since), eq(message.role, "user")))
      .execute();
    return stats?.count ?? 0;
  } catch (error) {
    console.error("Failed to get message count by user id from database");
    throw error;
  }
}
