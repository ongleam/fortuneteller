import { relations } from "drizzle-orm/relations";
import { chats, messages, profiles, votes } from "./schema";

export const messagesRelations = relations(messages, ({ one, many }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  votes: many(votes),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  messages: many(messages),
  profile: one(profiles, {
    fields: [chats.userId],
    references: [profiles.userId],
  }),
  votes: many(votes),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  chats: many(chats),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  chat: one(chats, {
    fields: [votes.chatId],
    references: [chats.id],
  }),
  message: one(messages, {
    fields: [votes.messageId],
    references: [messages.id],
  }),
}));
