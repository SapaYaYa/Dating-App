import { pgTable, text, integer, doublePrecision, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  age: integer("age"),
  birthday: text("birthday"),
  gender: text("gender"),
  lookingFor: text("looking_for").array().notNull().default(["Everyone"]),
  bio: text("bio").notNull().default(""),
  photos: text("photos").array().notNull().default([]),
  interests: text("interests").array().notNull().default([]),
  occupation: text("occupation").notNull().default(""),
  // Hidden from Discover while true (the person paused their account).
  paused: boolean("paused").notNull().default(false),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
