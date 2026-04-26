import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { problems } from "./problems";

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export const sheetSections = pgTable(
  "sheet_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    publishedSortIdx: index("sheet_sections_published_sort_idx").on(
      table.isPublished,
      table.sortOrder,
    ),
    slugIdx: uniqueIndex("sheet_sections_slug_idx").on(table.slug),
  }),
);

export const sheetSectionProblems = pgTable(
  "sheet_section_problems",
  {
    sectionId: uuid("section_id")
      .notNull()
      .references(() => sheetSections.id, { onDelete: "cascade" }),
    problemId: uuid("problem_id")
      .notNull()
      .references(() => problems.id, { onDelete: "cascade" }),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.sectionId, table.problemId] }),
    sectionOrderUniq: uniqueIndex("sheet_section_problems_section_order_idx").on(
      table.sectionId,
      table.orderIndex,
    ),
    sectionIdIdx: index("sheet_section_problems_section_id_idx").on(table.sectionId),
    problemIdIdx: index("sheet_section_problems_problem_id_idx").on(table.problemId),
  }),
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const sheetSectionsRelations = relations(sheetSections, ({ many }) => ({
  sectionProblems: many(sheetSectionProblems),
}));

export const sheetSectionProblemsRelations = relations(sheetSectionProblems, ({ one }) => ({
  section: one(sheetSections, {
    fields: [sheetSectionProblems.sectionId],
    references: [sheetSections.id],
  }),
  problem: one(problems, {
    fields: [sheetSectionProblems.problemId],
    references: [problems.id],
  }),
}));
