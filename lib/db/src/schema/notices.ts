import { pgTable, serial, integer, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const noticesTable = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull().default("관리자"),
  viewCount: integer("view_count").notNull().default(0),
  pinned: boolean("pinned").notNull().default(false),
  hidden: boolean("hidden").notNull().default(false),
  attachments: jsonb("attachments").$type<{ name: string; url: string }[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertNoticeSchema = createInsertSchema(noticesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type Notice = typeof noticesTable.$inferSelect;

export const noticeCommentsTable = pgTable("notice_comments", {
  id: serial("id").primaryKey(),
  noticeId: integer("notice_id").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNoticeCommentSchema = createInsertSchema(noticeCommentsTable).omit({ id: true, createdAt: true });
export type InsertNoticeComment = z.infer<typeof insertNoticeCommentSchema>;
export type NoticeComment = typeof noticeCommentsTable.$inferSelect;
