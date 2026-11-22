import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  reportedProfileId: text("reported_profile_id").notNull(),
  reporterId: text("reporter_id").notNull(),
  category: text("category").notNull(),
  note: text("note").notNull().default(""),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  /** Set when the report has been reviewed; open reports have none. */
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  /** What the review decided: "no_action" or "action_taken". */
  outcome: text("outcome"),
});

/** One row per day the daily report email went out, so it's sent only once. */
export const reportDigestsTable = pgTable("report_digests", {
  day: text("day").primaryKey(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  timestamp: true,
  reviewedAt: true,
  outcome: true,
});
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;