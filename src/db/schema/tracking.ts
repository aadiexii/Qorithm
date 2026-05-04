import { relations } from "drizzle-orm";
import { boolean, index, pgEnum, pgTable, timestamp, uniqueIndex, uuid, text } from "drizzle-orm/pg-core";

import { users } from "./auth";
import { problems } from "./problems";

export const problemStatusEnum = pgEnum("problem_status", ["not_started", "tried", "solved"]);

export const userProblemStates = pgTable(
  "user_problem_states",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    status: problemStatusEnum("status").notNull().default("not_started"),
    bookmarked: boolean("bookmarked").notNull().default(false),
    note: text("note"),
    solvedAt: timestamp("solved_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userProblemIdx: uniqueIndex("user_problem_states_user_problem_idx").on(
      table.userId,
      table.problemId,
    ),
    userIdIdx: index("user_problem_states_user_id_idx").on(table.userId),
    // Performance indices for leaderboard aggregations
    statusSolvedAtIdx: index("user_problem_states_status_solved_at_idx").on(table.status, table.solvedAt),
    userStatusIdx: index("user_problem_states_user_status_idx").on(table.userId, table.status),
  }),
);

export const userProblemStatesRelations = relations(userProblemStates, ({ one }) => ({
  user: one(users, {
    fields: [userProblemStates.userId],
    references: [users.id],
  }),
  problem: one(problems, {
    fields: [userProblemStates.problemId],
    references: [problems.id],
  }),
}));
