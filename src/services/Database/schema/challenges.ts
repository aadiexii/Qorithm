import {
  date,
  integer,
  pgTable,
  timestamp,
  uuid,
  text,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { problems } from "./problems";

export const userDailyChallenges = pgTable("user_daily_challenges", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  problemId: uuid("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  targetRating: integer("target_rating"),
  basis: text("basis"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
