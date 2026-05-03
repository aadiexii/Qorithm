import { relations, sql } from "drizzle-orm";
import { boolean, index, integer, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const platformEnum = pgEnum("platform", ["custom", "codeforces", "atcoder"]);

export const problems = pgTable(
  "problems",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    source: text("source").notNull(),
    rating: integer("rating"),
    externalDifficulty: integer("external_difficulty"),
    platform: platformEnum("platform").notNull().default("custom"),
    externalContestId: integer("external_contest_id"),
    externalProblemIndex: text("external_problem_index"),
    isPublished: boolean("is_published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx: index("problems_source_idx").on(table.source),
    ratingIdx: index("problems_rating_idx").on(table.rating),
    externalIndex: uniqueIndex("problems_external_idx").on(
      table.platform,
      table.externalContestId,
      table.externalProblemIndex
    ).where(sql`${table.platform} != 'custom'`),
  }),
);

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const problemTopics = pgTable(
  "problem_topics",
  {
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.problemId, table.topicId] }),
    topicIdIdx: index("problem_topics_topic_id_idx").on(table.topicId),
  }),
);

export const problemsRelations = relations(problems, ({ many }) => ({
  problemTopics: many(problemTopics),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  problemTopics: many(problemTopics),
}));

export const problemTopicsRelations = relations(problemTopics, ({ one }) => ({
  problem: one(problems, {
    fields: [problemTopics.problemId],
    references: [problems.id],
  }),
  topic: one(topics, {
    fields: [problemTopics.topicId],
    references: [topics.id],
  }),
}));
