import {
  pgTable,
  uuid,
  text,
  vector,
  timestamp,
  integer,
  jsonb,
  foreignKey,
  varchar,
  json,
  primaryKey,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const certState = pgEnum('cert_state', [
  '취소',
  '반납',
  '안전인증취소',
  '적합',
  '기간만료',
  '인증만료',
  '안전확인신고 효력상실',
  '청문실시',
  '개선명령',
  '-',
  '안전확인신고 효력상실 처분',
  '안전확인신고표시 사용금지 2개월',
  'nan',
  '정지',
]);
export const importDiv = pgEnum('import_div', ['수입', '제조', '3']);

export const faqs = pgTable('faqs', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  question: text().notNull(),
  answer: text().notNull(),
  embedding: vector({ dimensions: 768 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const kcCertifications = pgTable('kc_certifications', {
  idx: integer().notNull(),
  category: text().notNull(),
  factor: text().notNull(),
  certifications: text().array().notNull(),
  purchaseAgency: text('purchase_agency').array(),
  keywords: text().array(),
  embedding: vector({ dimensions: 768 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  detailIds: uuid('detail_ids').array(),
  id: uuid().defaultRandom().primaryKey().notNull(),
});

export const kcCertificationDetails = pgTable('kc_certification_details', {
  idx: integer().notNull(),
  item: jsonb().notNull(),
  id: uuid().defaultRandom().primaryKey().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const messages = pgTable(
  'messages',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    chatId: uuid('chat_id').notNull(),
    role: varchar().notNull(),
    parts: json().notNull(),
    attachments: json(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      messagesChatIdChatsIdFk: foreignKey({
        columns: [table.chatId],
        foreignColumns: [chats.id],
        name: 'messages_chat_id_chats_id_fk',
      }),
    };
  }
);

export const chats = pgTable(
  'chats',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: text().notNull(),
    userId: uuid('user_id').notNull(),
    visibility: varchar().default('private').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      chatsUserIdProfilesUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [profiles.userId],
        name: 'chats_user_id_profiles_user_id_fk',
      }),
    };
  }
);

export const profiles = pgTable('profiles', {
  userId: uuid('user_id').primaryKey().notNull(),
  name: text().notNull(),
  avatarUrl: text('avatar_url'),
  theme: varchar().default('system').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const votes = pgTable(
  'votes',
  {
    chatId: uuid('chat_id').notNull(),
    messageId: uuid('message_id').notNull(),
    isUpvoted: boolean('is_upvoted').notNull(),
  },
  (table) => {
    return {
      votesChatIdChatsIdFk: foreignKey({
        columns: [table.chatId],
        foreignColumns: [chats.id],
        name: 'votes_chat_id_chats_id_fk',
      }),
      votesMessageIdMessagesIdFk: foreignKey({
        columns: [table.messageId],
        foreignColumns: [messages.id],
        name: 'votes_message_id_messages_id_fk',
      }),
      votesChatIdMessageIdPk: primaryKey({
        columns: [table.chatId, table.messageId],
        name: 'votes_chat_id_message_id_pk',
      }),
    };
  }
);
