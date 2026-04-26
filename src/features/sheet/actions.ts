"use server";

import { and, asc, count, eq } from "drizzle-orm";

import { db } from "@/db";
import { problems } from "@/db/schema/problems";
import { sheetSectionProblems, sheetSections } from "@/db/schema/sheet";
import { userProblemStates } from "@/db/schema/tracking";

import type {
  SheetSectionDetail,
  SheetSectionProblemRow,
  SheetSectionProgress,
  SheetSectionStatus,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeStatusLabel(
  totalProblems: number,
  solvedProblems: number,
): SheetSectionStatus {
  if (totalProblems === 0) return "Start now";
  if (solvedProblems === totalProblems) return "Completed";
  if (solvedProblems > 0) return "In Progress";
  return "Start now";
}

function computePercentage(solved: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((solved / total) * 100);
}

// ---------------------------------------------------------------------------
// getSheetSectionsWithProgress
// ---------------------------------------------------------------------------

/**
 * Returns all published sheet sections ordered by sortOrder, each enriched
 * with per-user progress derived from user_problem_states.
 * Uses 3 queries total – no N+1 loops.
 */
export async function getSheetSectionsWithProgress(
  userId?: string | null,
): Promise<SheetSectionProgress[]> {
  // 1. Fetch all published sections
  const sections = await db
    .select({
      id: sheetSections.id,
      slug: sheetSections.slug,
      title: sheetSections.title,
      description: sheetSections.description,
      sortOrder: sheetSections.sortOrder,
    })
    .from(sheetSections)
    .where(eq(sheetSections.isPublished, true))
    .orderBy(asc(sheetSections.sortOrder));

  if (sections.length === 0) return [];

  // 2. Total problems per section (grouped)
  const totalsRaw = await db
    .select({
      sectionId: sheetSectionProblems.sectionId,
      total: count(),
    })
    .from(sheetSectionProblems)
    .groupBy(sheetSectionProblems.sectionId);

  const totalMap = new Map<string, number>(
    totalsRaw.map((r) => [r.sectionId, r.total]),
  );

  const progressMap = new Map<string, { solved: number; tried: number }>();
  if (userId) {
    const progressRaw = await db
      .select({
        sectionId: sheetSectionProblems.sectionId,
        status: userProblemStates.status,
        stateCount: count(),
      })
      .from(sheetSectionProblems)
      .innerJoin(
        userProblemStates,
        and(
          eq(userProblemStates.problemId, sheetSectionProblems.problemId),
          eq(userProblemStates.userId, userId),
        ),
      )
      .groupBy(sheetSectionProblems.sectionId, userProblemStates.status);

    for (const row of progressRaw) {
      const existing = progressMap.get(row.sectionId) ?? { solved: 0, tried: 0 };
      if (row.status === "solved") existing.solved = row.stateCount;
      if (row.status === "tried") existing.tried = row.stateCount;
      progressMap.set(row.sectionId, existing);
    }
  }

  // 4. Assemble result
  return sections.map((section) => {
    const total = totalMap.get(section.id) ?? 0;
    const { solved = 0, tried = 0 } = progressMap.get(section.id) ?? {};
    return {
      id: section.id,
      slug: section.slug,
      title: section.title,
      description: section.description,
      sortOrder: section.sortOrder,
      totalProblems: total,
      solvedProblems: solved,
      triedProblems: tried,
      progressPercentage: computePercentage(solved, total),
      statusLabel: computeStatusLabel(total, solved),
    };
  });
}

// ---------------------------------------------------------------------------
// getSheetSectionBySlug
// ---------------------------------------------------------------------------

/**
 * Returns a single published section with its ordered problems and per-user
 * tracking state. Returns null if not found or unpublished.
 */
export async function getSheetSectionBySlug(
  slug: string,
  userId?: string | null,
): Promise<SheetSectionDetail | null> {
  // 1. Fetch section metadata
  const [section] = await db
    .select({
      id: sheetSections.id,
      slug: sheetSections.slug,
      title: sheetSections.title,
      description: sheetSections.description,
      sortOrder: sheetSections.sortOrder,
    })
    .from(sheetSections)
    .where(and(eq(sheetSections.slug, slug), eq(sheetSections.isPublished, true)));

  if (!section) return null;

  // 2. Fetch problems + user states via a single join
  const rows = await db
    .select({
      problemId: problems.id,
      title: problems.title,
      source: problems.source,
      rating: problems.rating,
      platform: problems.platform,
      externalContestId: problems.externalContestId,
      externalProblemIndex: problems.externalProblemIndex,
      orderIndex: sheetSectionProblems.orderIndex,
      status: userProblemStates.status,
      bookmarked: userProblemStates.bookmarked,
    })
    .from(sheetSectionProblems)
    .innerJoin(problems, eq(problems.id, sheetSectionProblems.problemId))
    .leftJoin(
      userProblemStates,
      and(
        eq(userProblemStates.problemId, sheetSectionProblems.problemId),
        eq(userProblemStates.userId, userId ?? "anon"), // Fallback to dummy ID if no user
      ),
    )
    .where(eq(sheetSectionProblems.sectionId, section.id))
    .orderBy(asc(sheetSectionProblems.orderIndex));

  const sectionProblems: SheetSectionProblemRow[] = rows.map((row) => ({
    problemId: row.problemId,
    title: row.title,
    source: row.source,
    rating: row.rating,
    platform: row.platform,
    externalContestId: row.externalContestId,
    externalProblemIndex: row.externalProblemIndex,
    orderIndex: row.orderIndex,
    status: row.status ?? "not_started",
    bookmarked: row.bookmarked ?? false,
  }));

  return {
    id: section.id,
    slug: section.slug,
    title: section.title,
    description: section.description,
    sortOrder: section.sortOrder,
    problems: sectionProblems,
  };
}

// ---------------------------------------------------------------------------
// getNextRecommendedSection
// ---------------------------------------------------------------------------

/**
 * Returns the first published section (by sortOrder) where the user has not
 * yet solved all problems. Falls back to the first published section if all
 * are complete. Returns null if no sections exist.
 */
export async function getNextRecommendedSection(
  userId?: string | null,
): Promise<Pick<SheetSectionProgress, "id" | "slug" | "title" | "progressPercentage" | "statusLabel"> | null> {
  const sections = await getSheetSectionsWithProgress(userId);
  if (sections.length === 0) return null;

  const incomplete = sections.find(
    (s) => s.totalProblems === 0 || s.solvedProblems < s.totalProblems,
  );

  const recommended = incomplete ?? sections[0];

  return {
    id: recommended.id,
    slug: recommended.slug,
    title: recommended.title,
    progressPercentage: recommended.progressPercentage,
    statusLabel: recommended.statusLabel,
  };
}
