import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Why people delete their accounts, for product feedback. Deliberately holds
// no user ID or anything else that identifies the person.
export const accountDeletionsTable = pgTable("account_deletions", {
  id: serial("id").primaryKey(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
