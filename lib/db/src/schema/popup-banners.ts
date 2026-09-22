import { pgTable, serial, text, boolean, date, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const popupBannersTable = pgTable("popup_banners", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  published: boolean("published").notNull().default(true),
  startDate: date("start_date"),
  endDate: date("end_date"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPopupBannerSchema = createInsertSchema(popupBannersTable).omit({ id: true, createdAt: true });
export type InsertPopupBanner = z.infer<typeof insertPopupBannerSchema>;
export type PopupBanner = typeof popupBannersTable.$inferSelect;
