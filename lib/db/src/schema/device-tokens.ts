import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const deviceTokensTable = pgTable("device_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  platform: text("platform").notNull(),
  adminUsername: text("admin_username"),
  memberEmail: text("member_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type DeviceToken = typeof deviceTokensTable.$inferSelect;
