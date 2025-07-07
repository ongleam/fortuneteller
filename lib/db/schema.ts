import type { InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  integer,
  json,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
  vector,
} from 'drizzle-orm/pg-core';

// 사용자 프로필 테이블 (Supabase auth.users와 연동)
export const profile = pgTable('profiles', {
  user_id: uuid('user_id').primaryKey().notNull(),
  user_kakao_id: text('user_kakao_id').unique(),
  name: text('name').notNull(),
  avatar_url: text('avatar_url'),
  theme: varchar('theme', { enum: ['light', 'dark', 'system'] })
    .default('system')
    .notNull(),

  gender: varchar('gender', { enum: ['남성', '여성'] }),
  birth_type: varchar('birth_type', { enum: ['양력', '음력'] }),
  birth_year: integer('birth_year'),
  birth_month: integer('birth_month'),
  birth_day: integer('birth_day'),
  birth_time: varchar('birth_time', {
    enum: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24'],
  }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export type Profile = InferSelectModel<typeof profile>;

// 채팅방 테이블
export const chat = pgTable('chats', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  title: text('title').notNull(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => profile.user_id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
  channel: varchar('channel', { enum: ['kakao', 'web'] })
    .notNull()
    .default('web'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export type Chat = InferSelectModel<typeof chat>;

// 메시지 테이블
export const message = pgTable('messages', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chat_id: uuid('chat_id')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export type DBMessage = InferSelectModel<typeof message>;

// 투표 테이블
export const vote = pgTable(
  'votes',
  {
    chat_id: uuid('chat_id')
      .notNull()
      .references(() => chat.id),
    message_id: uuid('message_id')
      .notNull()
      .references(() => message.id),
    is_upvoted: boolean('is_upvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chat_id, table.message_id] }),
    };
  }
);
export type Vote = InferSelectModel<typeof vote>;
