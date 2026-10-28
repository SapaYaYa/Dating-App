import { pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// A block hides both people from each other and ends their conversation.
// Reporting someone also blocks them.
export const blocksTable = pgTable(
  "blocks",
  {
    id: serial("id").primaryKey(),
    blockerId: text("blocker_id").notNull(),
    blockedProfileId: text("blocked_profile_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("blocks_pair_idx").on(table.blockerId, table.blockedProfileId)],
);

export type Block = typeof blocksTable.$inferSelect;
