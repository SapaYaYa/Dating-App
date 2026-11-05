import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Each person's points (which set their level) and the time zone their day
// resets in. Points will come from real challenges, checked on the server.
export const userProgressTable = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),
  points: integer("points").notNull().default(0),
  // IANA name, e.g. "America/New_York". Daily likes and daily ad limits
  // reset at midnight here.
  timeZone: text("time_zone").notNull().default("UTC"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type UserProgress = typeof userProgressTable.$inferSelect;
