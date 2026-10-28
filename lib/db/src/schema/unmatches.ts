import { pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// An unmatch ends the conversation without blocking. It also means the match
// no longer counts toward the Slow to reply badge.
export const unmatchesTable = pgTable(
  "unmatches",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    unmatchedProfileId: text("unmatched_profile_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("unmatches_pair_idx").on(table.userId, table.unmatchedProfileId)],
);

export type Unmatch = typeof unmatchesTable.$inferSelect;
