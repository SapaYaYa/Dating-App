import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// One rewarded-ad request: the app asks for one before playing the ad(s),
// and AdMob's signed "ad finished" message completes it. The reward is
// granted only when every ad in the session has finished.
export const adSessionsTable = pgTable(
  "ad_sessions",
  {
    id: text("id").primaryKey(), // random; sent to AdMob as custom_data
    userId: text("user_id").notNull(),
    placement: text("placement").notNull(), // extraLikes | undoPass | citySkip
    adsRequired: integer("ads_required").notNull(),
    adsCompleted: integer("ads_completed").notNull().default(0),
    grantedAt: timestamp("granted_at", { withTimezone: true }),
    // The person's day when granted, for daily limits.
    grantedDay: text("granted_day"),
    // When the reward was used up (city skip).
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("ad_sessions_user_idx").on(table.userId, table.placement)],
);

// Every "ad finished" message, by AdMob's transaction ID, so a repeated
// message is only counted once.
export const adViewsTable = pgTable("ad_views", {
  transactionId: text("transaction_id").primaryKey(),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdSession = typeof adSessionsTable.$inferSelect;
