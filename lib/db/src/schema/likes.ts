import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

// Likes for one person on one day (in their time zone). The daily allowance
// comes from their level; `extra` is likes earned that day, e.g. from ads.
export const likeAllowancesTable = pgTable(
  "like_allowances",
  {
    userId: text("user_id").notNull(),
    day: text("day").notNull(), // YYYY-MM-DD
    used: integer("used").notNull().default(0),
    extra: integer("extra").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.day] })],
);

export type LikeAllowance = typeof likeAllowancesTable.$inferSelect;
