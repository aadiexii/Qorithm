import { date, integer, pgEnum, pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { problems } from "./problems";

export const dailyChallengeStatusEnum = pgEnum("daily_challenge_status", ["pending", "completed", "skipped"]);

export const dailyChallenges = pgTable("daily_challenges", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull().unique(), // YYYY-MM-DD
  problemId: uuid("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
  targetRating: integer("target_rating").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userDailyChallenges = pgTable("user_daily_challenges", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(), // To quickly query for "today"
  problemId: uuid("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
  targetRating: integer("target_rating"),
  basis: text("basis"),
  status: dailyChallengeStatusEnum("status").notNull().default("pending"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userStreaks = pgTable("user_streaks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: date("last_active_date"), // YYYY-MM-DD
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
