import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Which push notifications someone wants. No row means everything is on.
export const notificationSettingsTable = pgTable("notification_settings", {
  userId: text("user_id").primaryKey(),
  matches: boolean("matches").notNull().default(true),
  messages: boolean("messages").notNull().default(true),
  pebbles: boolean("pebbles").notNull().default(true),
  slowReply: boolean("slow_reply").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type NotificationSettingsRow = typeof notificationSettingsTable.$inferSelect;
