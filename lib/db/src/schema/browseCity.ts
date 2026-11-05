import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// The other city someone browses in Discover. A different city is allowed
// once a week (or early with a city-skip ad); going back home always is.
export const browseCitiesTable = pgTable("browse_cities", {
  userId: text("user_id").primaryKey(),
  // The city browsed now; null means their own area.
  city: text("city"),
  // The last city they switched to, and when. The weekly limit counts from
  // here; picking this same city again is always fine.
  lastCity: text("last_city"),
  changedAt: timestamp("changed_at", { withTimezone: true }),
});

export type BrowseCity = typeof browseCitiesTable.$inferSelect;
