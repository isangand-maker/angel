import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const partnerLogosTable = pgTable("partner_logos", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  url: text("url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPartnerLogoSchema = createInsertSchema(partnerLogosTable).omit({ id: true, createdAt: true });
export type InsertPartnerLogo = z.infer<typeof insertPartnerLogoSchema>;
export type PartnerLogo = typeof partnerLogosTable.$inferSelect;
