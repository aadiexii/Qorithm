import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  text,
} from "drizzle-orm/pg-core";

import { users } from "./auth";
import { problemStatusEnum } from "./tracking";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const oaDifficultyEnum = pgEnum("oa_difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const oaPlatformEnum = pgEnum("oa_platform", [
  "leetcode",
  "gfg",
  "codeforces",
]);

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    logo: text("logo"),
    difficulty: text("difficulty").notNull(), // overall difficulty label
    description: text("description"),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("companies_slug_idx").on(table.slug),
    publishedIdx: index("companies_published_idx").on(table.isPublished),
  }),
);

export const companySections = pgTable(
  "company_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    description: text("description"),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    companySortIdx: index("company_sections_company_sort_idx").on(
      table.companyId,
      table.sortOrder,
    ),
    publishedIdx: index("company_sections_published_idx").on(table.isPublished),
  }),
);

export const oaProblems = pgTable(
  "oa_problems",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    difficulty: oaDifficultyEnum("difficulty").notNull().default("medium"),
    platform: oaPlatformEnum("platform").notNull().default("leetcode"),
    url: text("url").notNull(),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    publishedIdx: index("oa_problems_published_idx").on(table.isPublished),
  }),
);

export const companySectionProblems = pgTable(
  "company_section_problems",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sectionId: uuid("section_id")
      .notNull()
      .references(() => companySections.id, { onDelete: "cascade" }),
    oaProblemId: uuid("oa_problem_id")
      .notNull()
      .references(() => oaProblems.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull().default(0),
    isRequired: boolean("is_required").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    sectionProblemIdx: uniqueIndex(
      "company_section_problems_section_problem_idx",
    ).on(table.sectionId, table.oaProblemId),
    sectionOrderIdx: index("company_section_problems_section_order_idx").on(
      table.sectionId,
      table.orderIndex,
    ),
  }),
);

export const userOaProblemStates = pgTable(
  "user_oa_problem_states",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    oaProblemId: uuid("oa_problem_id")
      .notNull()
      .references(() => oaProblems.id, { onDelete: "cascade" }),
    status: problemStatusEnum("status").notNull().default("not_started"),
    bookmarked: boolean("bookmarked").notNull().default(false),
    note: text("note"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userOAIdx: uniqueIndex("user_oa_problem_states_user_oa_idx").on(
      table.userId,
      table.oaProblemId,
    ),
    userStatusIdx: index("user_oa_problem_states_user_status_idx").on(
      table.userId,
      table.status,
    ),
  }),
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const companiesRelations = relations(companies, ({ many }) => ({
  sections: many(companySections),
}));

export const companySectionsRelations = relations(
  companySections,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [companySections.companyId],
      references: [companies.id],
    }),
    sectionProblems: many(companySectionProblems),
  }),
);

export const oaProblemsRelations = relations(oaProblems, ({ many }) => ({
  sectionProblems: many(companySectionProblems),
  userStates: many(userOaProblemStates),
}));

export const companySectionProblemsRelations = relations(
  companySectionProblems,
  ({ one }) => ({
    section: one(companySections, {
      fields: [companySectionProblems.sectionId],
      references: [companySections.id],
    }),
    problem: one(oaProblems, {
      fields: [companySectionProblems.oaProblemId],
      references: [oaProblems.id],
    }),
  }),
);

export const userOaProblemStatesRelations = relations(
  userOaProblemStates,
  ({ one }) => ({
    user: one(users, {
      fields: [userOaProblemStates.userId],
      references: [users.id],
    }),
    problem: one(oaProblems, {
      fields: [userOaProblemStates.oaProblemId],
      references: [oaProblems.id],
    }),
  }),
);
