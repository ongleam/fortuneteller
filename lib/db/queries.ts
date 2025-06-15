import 'server-only';

import {
  and,
  asc,
  cosineDistance,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  sql,
  type SQL,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  chat,
  faq,
  message,
  profile,
  vote,
  type Chat,
  type DBMessage,
  type Profile,
} from './schema';
import { getEmbedding } from '@/lib/utils/embedding';
import { type UUID } from 'crypto';
import { generateUUID } from '../utils';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

const DEFAULT_MATCH_THRESHOLD = 0.7;
const DEFAULT_MATCH_COUNT = 5;

// Profile Queries
export async function getProfileByUserId({ id }: { id: string }): Promise<Profile | null> {
  try {
    const [result] = await db.select().from(profile).where(eq(profile.user_id, id));
    return result;
  } catch (error) {
    console.error('Failed to get profile by user id from database');
    throw error;
  }
}

export async function createProfile({
  id,
  name,
  user_kakao_id,
  avatar_url,
}: {
  id: string;
  name: string;
  user_kakao_id?: string;
  avatar_url?: string;
}) {
  try {
    const avatarUrl = avatar_url || `https://avatar.vercel.sh/${id}.png`;
    const [newProfile] = await db
      .insert(profile)
      .values({ user_id: id, name, avatar_url: avatarUrl, user_kakao_id })
      .returning();

    return newProfile;
  } catch (error) {
    console.error('Failed to create profile in database');
    throw error;
  }
}

export async function getOrCreateProfileByUserKakaoId({
  user_kakao_id,
}: {
  user_kakao_id: string;
}): Promise<Profile> {
  const existingProfile = await db
    .select()
    .from(profile)
    .where(eq(profile.user_kakao_id, user_kakao_id))
    .limit(1);

  if (existingProfile.length > 0) {
    return existingProfile[0];
  }

  // 카카오 챗봇 유저 프로필 생성
  try {
    const newProfile = await createProfile({
      id: generateUUID(),
      name: `Kakao-${user_kakao_id.substring(0, 8)}`,
      user_kakao_id,
    });

    return newProfile;
  } catch (error) {
    console.error('Failed `getOrCreateProfileByUserKakaoId`: ', error);
    throw error;
  }
}

// Chat Queries
export async function saveChat({
  id,
  userId,
  title,
  channel,
}: {
  id: string;
  userId: string;
  title: string;
  channel?: 'kakao' | 'web';
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
    console.error('Failed to save chat in database');
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
    console.error('Failed to delete chat by id from database');
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

      if (!selectedChat) {
        throw new Error(`Chat with id ${startingAfter} not found`);
      }

      filteredChats = await query(gt(chat.created_at, selectedChat.created_at));
    } else if (endingBefore) {
      const [selectedChat] = await db.select().from(chat).where(eq(chat.id, endingBefore)).limit(1);

      if (!selectedChat) {
        throw new Error(`Chat with id ${endingBefore} not found`);
      }

      filteredChats = await query(lt(chat.created_at, selectedChat.created_at));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
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
    .where(and(eq(chat.user_id, userId), eq(chat.channel, 'kakao')))
    .orderBy(desc(chat.updated_at))
    .limit(1);

  if (existingChat.length > 0) {
    return existingChat[0];
  }

  const newChat = await saveChat({
    id: generateUUID(),
    userId,
    title,
    channel: 'kakao',
  });

  console.log('newChat:', newChat);

  return newChat;
}

export async function updateChatVisiblityById({
  chat_id,
  visibility,
}: {
  chat_id: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chat_id));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

// Message & Vote Queries
export async function saveMessages({ messages }: { messages: Array<DBMessage> }) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id, limit }: { id: string; limit?: number }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chat_id, id))
      .orderBy(asc(message.created_at));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.message_id, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ is_upvoted: type === 'up' })
        .where(and(eq(vote.message_id, messageId), eq(vote.chat_id, chatId)));
    }
    return await db.insert(vote).values({
      chat_id: chatId,
      message_id: messageId,
      is_upvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chat_id, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
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

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(and(eq(vote.chat_id, chatId), inArray(vote.message_id, messageIds)));

      return await db
        .delete(message)
        .where(and(eq(message.chat_id, chatId), inArray(message.id, messageIds)));
    }
  } catch (error) {
    console.error('Failed to delete messages by id after timestamp from database');
    throw error;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - differenceInHours * 60 * 60 * 1000);

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chat_id, chat.id))
      .where(
        and(
          eq(chat.user_id, id),
          gte(message.created_at, twentyFourHoursAgo),
          eq(message.role, 'user')
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    console.error('Failed to get message count by user id for the last 24 hours from database');
    throw error;
  }
}

// FAQ Queries
export async function getFaqsByVector(
  query: string,
  threshold = DEFAULT_MATCH_THRESHOLD,
  count = DEFAULT_MATCH_COUNT
) {
  let queryEmbedding: number[] | null;

  try {
    queryEmbedding = await getEmbedding(query);
  } catch (error) {
    console.error('Failed to get Vertex AI embedding:', error);
    throw error;
  }
  if (!queryEmbedding) {
    console.error('Query embedding is null or undefined.');
    throw new Error('Failed to generate query embedding (result is null).');
  }

  try {
    const similarity = sql<number>`1 - (${cosineDistance(faq.embedding, queryEmbedding)})`;

    const faqs = await db
      .select({
        question: faq.question,
        answer: faq.answer,
      })
      .from(faq)
      .where(gte(similarity, threshold))
      .orderBy(desc(similarity))
      .limit(count);
    // console.log('[INFO] Vector search faqs:', faqs);
    return faqs;
  } catch (error) {
    console.error('Failed to get Vertex AI embedding:', error);
    throw error;
  }
}
