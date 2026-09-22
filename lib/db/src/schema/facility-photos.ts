import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const facilityPhotosTable = pgTable("facility_photos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFacilityPhotoSchema = createInsertSchema(facilityPhotosTable).omit({ id: true, createdAt: true });
export type InsertFacilityPhoto = z.infer<typeof insertFacilityPhotoSchema>;
export type FacilityPhoto = typeof facilityPhotosTable.$inferSelect;
