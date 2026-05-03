"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { problems, problemTopics, topics } from "@/db/schema/problems";
import { requireAdmin } from "@/server/auth";
import { adminCreateProblemSchema, adminUpdateProblemSchema, bulkImportRowSchema } from "./schemas";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export type BulkImportResult = {
  success: boolean;
  message: string;
  totalRows: number;
  inserted: number;
  failed: number;
  rowErrors: { row: number; errors: string[] }[];
};

// ---------------------------------------------------------------------------
// Query (admin-aware: shows all problems, not just published)
// ---------------------------------------------------------------------------

export async function queryAdminProblems() {
  const items = await db.query.problems.findMany({
    with: {
      problemTopics: {
        with: {
          topic: true,
        },
      },
    },
    orderBy: [desc(problems.createdAt)],
  });

  return items;
}

// ---------------------------------------------------------------------------
// Create (admin only)
// ---------------------------------------------------------------------------

export async function adminCreateProblemAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { success: false, message: "Admin access required." };

  const topicIds = formData.getAll("topicIds").map(String);

  const parsed = adminCreateProblemSchema.safeParse({
    title: formData.get("title"),
    source: formData.get("source"),
    rating: formData.get("rating"),
    platform: formData.get("platform"),
    externalContestId: formData.get("externalContestId"),
    externalProblemIndex: formData.get("externalProblemIndex"),
    isPublished: formData.get("isPublished"),
    topicIds,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the validation errors.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, source, rating, platform, externalContestId, externalProblemIndex, isPublished, topicIds: vTopicIds } = parsed.data;

  try {
    const finalRating = typeof rating === "number" ? rating : null;
    const finalExtContest = typeof externalContestId === "number" ? externalContestId : null;
    const finalExtIndex = externalProblemIndex || null;

    await db.transaction(async (tx) => {
      const [newProblem] = await tx
        .insert(problems)
        .values({
          title,
          source,
          rating: finalRating,
          platform,
          externalContestId: finalExtContest,
          externalProblemIndex: finalExtIndex,
          isPublished,
        })
        .returning({ id: problems.id });

      if (vTopicIds && vTopicIds.length > 0) {
        await tx.insert(problemTopics).values(
          vTopicIds.map((topicId) => ({
            problemId: newProblem.id,
            topicId,
          })),
        );
      }
    });

    revalidatePath("/admin/problems");
    revalidatePath("/problems");

    return { success: true, message: "Problem created." };
  } catch (error) {
    console.error("Admin create problem failed:", error);
    return { success: false, message: "Failed to create problem." };
  }
}

// ---------------------------------------------------------------------------
// Update (admin only)
// ---------------------------------------------------------------------------

export async function adminUpdateProblemAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { success: false, message: "Admin access required." };

  const topicIds = formData.getAll("topicIds").map(String);

  const parsed = adminUpdateProblemSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    source: formData.get("source"),
    rating: formData.get("rating"),
    platform: formData.get("platform"),
    externalContestId: formData.get("externalContestId"),
    externalProblemIndex: formData.get("externalProblemIndex"),
    isPublished: formData.get("isPublished"),
    topicIds,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the validation errors.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, title, source, rating, platform, externalContestId, externalProblemIndex, isPublished, topicIds: vTopicIds } = parsed.data;

  try {
    const finalRating = typeof rating === "number" ? rating : null;
    const finalExtContest = typeof externalContestId === "number" ? externalContestId : null;
    const finalExtIndex = externalProblemIndex || null;

    await db.transaction(async (tx) => {
      await tx
        .update(problems)
        .set({
          title,
          source,
          rating: finalRating,
          platform,
          externalContestId: finalExtContest,
          externalProblemIndex: finalExtIndex,
          isPublished,
        })
        .where(eq(problems.id, id));

      await tx.delete(problemTopics).where(eq(problemTopics.problemId, id));

      if (vTopicIds && vTopicIds.length > 0) {
        await tx.insert(problemTopics).values(
          vTopicIds.map((topicId) => ({
            problemId: id,
            topicId,
          })),
        );
      }
    });

    revalidatePath("/admin/problems");
    revalidatePath("/problems");

    return { success: true, message: "Problem updated." };
  } catch (error) {
    console.error("Admin update problem failed:", error);
    return { success: false, message: "Failed to update problem." };
  }
}

// ---------------------------------------------------------------------------
// Delete (admin only)
// ---------------------------------------------------------------------------

export async function adminDeleteProblemAction(id: string): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { success: false, message: "Admin access required." };

  try {
    await db.delete(problems).where(eq(problems.id, id));

    revalidatePath("/admin/problems");
    revalidatePath("/problems");

    return { success: true, message: "Problem deleted." };
  } catch (error) {
    console.error("Admin delete problem failed:", error);
    return { success: false, message: "Failed to delete problem." };
  }
}

// ---------------------------------------------------------------------------
// Publish toggle (admin only)
// ---------------------------------------------------------------------------

export async function togglePublishAction(
  id: string,
  publish: boolean,
): Promise<ActionState> {
  const session = await requireAdmin();
  if (!session) return { success: false, message: "Admin access required." };

  try {
    await db.update(problems).set({ isPublished: publish }).where(eq(problems.id, id));

    revalidatePath("/admin/problems");
    revalidatePath("/problems");

    return { success: true, message: publish ? "Published." : "Unpublished." };
  } catch (error) {
    console.error("Toggle publish failed:", error);
    return { success: false, message: "Failed to toggle publish status." };
  }
}

// ---------------------------------------------------------------------------
// Bulk import (admin only)
// ---------------------------------------------------------------------------

export async function bulkImportAction(csvText: string): Promise<BulkImportResult> {
  const session = await requireAdmin();
  if (!session) {
    return {
      success: false,
      message: "Admin access required.",
      totalRows: 0,
      inserted: 0,
      failed: 0,
      rowErrors: [],
    };
  }

  const lines = csvText.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return {
      success: false,
      message: "CSV must have a header row and at least one data row.",
      totalRows: 0,
      inserted: 0,
      failed: 0,
      rowErrors: [],
    };
  }

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const dataLines = lines.slice(1);
  const totalRows = dataLines.length;

  // Pre-fetch all topics for slug lookup
  const allTopics = await db.select({ id: topics.id, slug: topics.slug }).from(topics);
  const slugToId = new Map(allTopics.map((t) => [t.slug, t.id]));

  const validRows: {
    title: string;
    source: string;
    rating: number | null;
    platform: "custom" | "codeforces" | "atcoder";
    externalContestId: number | null;
    externalProblemIndex: string | null;
    isPublished: boolean;
    topicIds: string[];
  }[] = [];
  const rowErrors: { row: number; errors: string[] }[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const values = dataLines[i].split(",").map((v) => v.trim());
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] ?? "";
    });

    const parsed = bulkImportRowSchema.safeParse(rowObj);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((iss) => `${iss.path.join(".")}: ${iss.message}`);
      rowErrors.push({ row: i + 2, errors }); // +2 for 1-indexed + header
      continue;
    }

    const data = parsed.data;

    // Resolve topic slugs
    const topicSlugs = data.topics
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const topicIds: string[] = [];
    const missingTopics: string[] = [];

    for (const slug of topicSlugs) {
      const id = slugToId.get(slug);
      if (id) {
        topicIds.push(id);
      } else {
        missingTopics.push(slug);
      }
    }

    if (missingTopics.length > 0) {
      rowErrors.push({
        row: i + 2,
        errors: [`Unknown topic slugs: ${missingTopics.join(", ")}`],
      });
      continue;
    }

    validRows.push({
      title: data.title,
      source: data.source,
      rating: typeof data.rating === "number" ? data.rating : null,
      platform: data.platform,
      externalContestId: typeof data.externalContestId === "number" ? data.externalContestId : null,
      externalProblemIndex: data.externalProblemIndex || null,
      isPublished: data.isPublished,
      topicIds,
    });
  }

  // Insert valid rows in a transaction
  let inserted = 0;
  if (validRows.length > 0) {
    try {
      await db.transaction(async (tx) => {
        for (const row of validRows) {
          const [newProblem] = await tx
            .insert(problems)
            .values({
              title: row.title,
              source: row.source,
              rating: row.rating,
              platform: row.platform,
              externalContestId: row.externalContestId,
              externalProblemIndex: row.externalProblemIndex,
              isPublished: row.isPublished,
            })
            .returning({ id: problems.id });

          if (row.topicIds.length > 0) {
            await tx.insert(problemTopics).values(
              row.topicIds.map((topicId) => ({
                problemId: newProblem.id,
                topicId,
              })),
            );
          }

          inserted++;
        }
      });
    } catch (error) {
      console.error("Bulk import transaction failed:", error);
      return {
        success: false,
        message: "Database error during import. No rows were inserted.",
        totalRows,
        inserted: 0,
        failed: totalRows,
        rowErrors,
      };
    }
  }

  revalidatePath("/admin/problems");
  revalidatePath("/problems");

  return {
    success: true,
    message: `Import complete: ${inserted} inserted, ${rowErrors.length} failed.`,
    totalRows,
    inserted,
    failed: rowErrors.length,
    rowErrors,
  };
}

// ---------------------------------------------------------------------------
// Analytics (admin only)
// ---------------------------------------------------------------------------

import { users } from "@/db/schema/auth";
import { userProblemStates } from "@/db/schema/tracking";
import { count, gte, inArray, sql, and, lte } from "drizzle-orm";

export type AdminAnalytics = {
  totalSignups: number;
  activeUsers7d: number;
  activeUsers30d: number;
  totalAttempted: number;
  totalSolved: number;
  completionRate: string;
  // Trends
  signups7d: number;
  signupsTrend: number; // percentage change
  solves7d: number;
  solvesTrend: number; // percentage change
};

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const session = await requireAdmin();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Signups
  const [signupsRes] = await db.select({ value: count() }).from(users);
  const totalSignups = signupsRes?.value ?? 0;

  // Signups 7d
  const [signups7dRes] = await db.select({ value: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo));
  const signups7d = signups7dRes?.value ?? 0;

  // Signups previous 7d
  const [signupsPrev7dRes] = await db.select({ value: count() }).from(users)
    .where(and(gte(users.createdAt, fourteenDaysAgo), lte(users.createdAt, sevenDaysAgo)));
  const signupsPrev7d = signupsPrev7dRes?.value ?? 0;

  const signupsTrend = calculateTrend(signups7d, signupsPrev7d);

  // Active Users (7d)
  const [active7dRes] = await db
    .select({ value: sql<number>`count(distinct ${userProblemStates.userId})` })
    .from(userProblemStates)
    .where(gte(userProblemStates.updatedAt, sevenDaysAgo));
  const activeUsers7d = Number(active7dRes?.value ?? 0);

  // Active Users (30d)
  const [active30dRes] = await db
    .select({ value: sql<number>`count(distinct ${userProblemStates.userId})` })
    .from(userProblemStates)
    .where(gte(userProblemStates.updatedAt, thirtyDaysAgo));
  const activeUsers30d = Number(active30dRes?.value ?? 0);

  // Total Attempted (Tried or Solved)
  const [attemptedRes] = await db
    .select({ value: count() })
    .from(userProblemStates)
    .where(inArray(userProblemStates.status, ["tried", "solved"]));
  const totalAttempted = attemptedRes?.value ?? 0;

  // Total Solved
  const [solvedRes] = await db
    .select({ value: count() })
    .from(userProblemStates)
    .where(eq(userProblemStates.status, "solved"));
  const totalSolved = solvedRes?.value ?? 0;

  // Solves 7d
  const [solves7dRes] = await db.select({ value: count() }).from(userProblemStates)
    .where(and(eq(userProblemStates.status, "solved"), gte(userProblemStates.updatedAt, sevenDaysAgo)));
  const solves7d = solves7dRes?.value ?? 0;

  // Solves previous 7d
  const [solvesPrev7dRes] = await db.select({ value: count() }).from(userProblemStates)
    .where(and(
      eq(userProblemStates.status, "solved"),
      gte(userProblemStates.updatedAt, fourteenDaysAgo),
      lte(userProblemStates.updatedAt, sevenDaysAgo)
    ));
  const solvesPrev7d = solvesPrev7dRes?.value ?? 0;

  const solvesTrend = calculateTrend(solves7d, solvesPrev7d);

  const completionRate = totalAttempted > 0 ? ((totalSolved / totalAttempted) * 100).toFixed(1) + "%" : "0.0%";

  return {
    totalSignups,
    activeUsers7d,
    activeUsers30d,
    totalAttempted,
    totalSolved,
    completionRate,
    signups7d,
    signupsTrend,
    solves7d,
    solvesTrend,
  };
}
