import type { InferSelectModel } from "drizzle-orm";
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
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// 사용자 프로필 테이블 (Supabase auth.users와 연동)
export const profile = pgTable("profiles", {
  user_id: uuid("user_id").primaryKey().notNull(),
  user_kakao_id: text("user_kakao_id").unique(),
  name: text("name").notNull(),
  avatar_url: text("avatar_url"),
  theme: varchar("theme", { enum: ["light", "dark", "system"] })
    .default("system")
    .notNull(),

  gender: varchar("gender", { enum: ["남성", "여성"] }),
  birth_type: varchar("birth_type", { enum: ["양력", "음력"] }),
  birth_year: integer("birth_year"),
  birth_month: integer("birth_month"),
  birth_day: integer("birth_day"),
  birth_time: varchar("birth_time", {
    enum: ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22", "24"],
  }),

  // 소개팅 프로필 필드 (전부 nullable/기본값 — 기존 행 보존).
  bio: text("bio"),
  region: varchar("region", { length: 40 }),
  photo_urls: jsonb("photo_urls").$type<string[]>().default([]).notNull(),
  pref_gender: varchar("pref_gender", { enum: ["남성", "여성", "무관"] })
    .default("무관")
    .notNull(),
  pref_age_min: integer("pref_age_min"),
  pref_age_max: integer("pref_age_max"),
  // draft=미완성(비노출) active=노출 hidden=숨김. 기본 draft라 옵트인 전 비노출.
  status: varchar("status", { enum: ["draft", "active", "hidden"] })
    .default("draft")
    .notNull(),

  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
export type Profile = InferSelectModel<typeof profile>;

// 채팅방 테이블
export const chat = pgTable("chats", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: text("title").notNull(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => profile.user_id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  channel: varchar("channel", { enum: ["kakao", "web"] })
    .notNull()
    .default("web"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
export type Chat = InferSelectModel<typeof chat>;

// 메시지 테이블
export const message = pgTable("messages", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chat_id: uuid("chat_id")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
export type DBMessage = InferSelectModel<typeof message>;

// 투표 테이블
export const vote = pgTable(
  "votes",
  {
    chat_id: uuid("chat_id")
      .notNull()
      .references(() => chat.id),
    message_id: uuid("message_id")
      .notNull()
      .references(() => message.id),
    is_upvoted: boolean("is_upvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chat_id, table.message_id] }),
    };
  },
);
export type Vote = InferSelectModel<typeof vote>;

// 매칭 테이블 — 각 행 = 두 유저 쌍(canonical 정렬)의 관계 상태.
// 별도 likes 테이블 없음. 방향은 어느 쪽 *_liked_at 이 찼는가로 표현한다.
export const match = pgTable(
  "matches",
  {
    user_a_id: uuid("user_a_id")
      .notNull()
      .references(() => profile.user_id), // canonical: min(user_id)
    user_b_id: uuid("user_b_id")
      .notNull()
      .references(() => profile.user_id), // canonical: max(user_id)
    a_liked_at: timestamp("a_liked_at", { withTimezone: true }), // a가 b를 좋아요한 시점
    b_liked_at: timestamp("b_liked_at", { withTimezone: true }), // b가 a를 좋아요한 시점
    matched_at: timestamp("matched_at", { withTimezone: true }), // 양쪽 다 차면 세팅 = 매칭 성립
    score: integer("score").notNull(), // computeHarmony 궁합 점수
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.user_a_id, t.user_b_id] }) }),
);
export type Match = InferSelectModel<typeof match>;
