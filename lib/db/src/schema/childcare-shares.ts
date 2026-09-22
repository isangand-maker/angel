import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const childcareSharesTable = pgTable("childcare_shares", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  attachments: jsonb("attachments").$type<{ name: string; url: string }[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertChildcareShareSchema = createInsertSchema(childcareSharesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertChildcareShare = z.infer<typeof insertChildcareShareSchema>;
export type ChildcareShare = typeof childcareSharesTable.$inferSelect;
