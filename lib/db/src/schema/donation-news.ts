import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const donationNewsTable = pgTable("donation_news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  imageAlign: text("image_align").notNull().default("left"),
  attachments: jsonb("attachments").$type<{ name: string; url: string }[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDonationNewsSchema = createInsertSchema(donationNewsTable).omit({ id: true, createdAt: true });
export type InsertDonationNews = z.infer<typeof insertDonationNewsSchema>;
export type DonationNews = typeof donationNewsTable.$inferSelect;
