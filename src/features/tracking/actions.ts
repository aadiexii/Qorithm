"use server";

import { and, count, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { userProblemStates } from "@/db/schema/tracking";
import { getCurrentSession } from "@/server/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProblemStateMap = Record<
  string,
  { status: "not_started" | "tried" | "solved"; bookmarked: boolean }
>;

export type UserProgressStats = {
  solved: number;
  tried: number;
  bookmarked: number;
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const statusSchema = z.enum(["not_started", "tried", "solved"]);

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getUserProblemStateMap(problemIds: string[]): Promise<ProblemStateMap> {
  const session = await getCurrentSession();
  if (!session || problemIds.length === 0) return {};

  const rows = await db
    .select({
      problemId: userProblemStates.problemId,
      status: userProblemStates.status,
      bookmarked: userProblemStates.bookmarked,
    })
    .from(userProblemStates)
    .where(
      and(
        eq(userProblemStates.userId, session.user.id),
        inArray(userProblemStates.problemId, problemIds),
      ),
    );

  const map: ProblemStateMap = {};
  for (const row of rows) {
    map[row.problemId] = { status: row.status, bookmarked: row.bookmarked };
  }
  return map;
}

export async function getUserProgressStats(): Promise<UserProgressStats> {
  const session = await getCurrentSession();
  if (!session) return { solved: 0, tried: 0, bookmarked: 0 };

  const [solvedResult] = await db
    .select({ value: count() })
    .from(userProblemStates)
    .where(
      and(
        eq(userProblemStates.userId, session.user.id),
        eq(userProblemStates.status, "solved"),
      ),
    );

  const [triedResult] = await db
    .select({ value: count() })
    .from(userProblemStates)
    .where(
      and(
        eq(userProblemStates.userId, session.user.id),
        eq(userProblemStates.status, "tried"),
      ),
    );

  const [bookmarkedResult] = await db
    .select({ value: count() })
    .from(userProblemStates)
    .where(
      and(
        eq(userProblemStates.userId, session.user.id),
        eq(userProblemStates.bookmarked, true),
      ),
    );

  return {
    solved: solvedResult?.value ?? 0,
    tried: triedResult?.value ?? 0,
    bookmarked: bookmarkedResult?.value ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function setProblemStatusAction(
  problemId: string,
  rawStatus: string,
): Promise<{ success: boolean; message: string }> {
  const session = await getCurrentSession();
  if (!session) return { success: false, message: "Unauthorized." };

  const parsed = statusSchema.safeParse(rawStatus);
  if (!parsed.success) return { success: false, message: "Invalid status." };

  const status = parsed.data;
  const now = new Date();
  const solvedAt = status === "solved" ? now : null;

  try {
    // Upsert: insert if not exists, update if exists
    await db
      .insert(userProblemStates)
      .values({
        userId: session.user.id,
        problemId,
        status,
        solvedAt,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [userProblemStates.userId, userProblemStates.problemId],
        set: { status, solvedAt, updatedAt: now },
      });

    revalidatePath("/problems");
    revalidatePath("/dashboard");

    return { success: true, message: "Status updated." };
  } catch (error) {
    console.error("Failed to set problem status:", error);
    return { success: false, message: "Failed to update status." };
  }
}

export async function toggleProblemBookmarkAction(
  problemId: string,
): Promise<{ success: boolean; message: string }> {
  const session = await getCurrentSession();
  if (!session) return { success: false, message: "Unauthorized." };

  const now = new Date();

  try {
    // Check current state
    const [existing] = await db
      .select({ bookmarked: userProblemStates.bookmarked })
      .from(userProblemStates)
      .where(
        and(
          eq(userProblemStates.userId, session.user.id),
          eq(userProblemStates.problemId, problemId),
        ),
      );

    const newBookmarked = !(existing?.bookmarked ?? false);

    await db
      .insert(userProblemStates)
      .values({
        userId: session.user.id,
        problemId,
        bookmarked: newBookmarked,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [userProblemStates.userId, userProblemStates.problemId],
        set: { bookmarked: newBookmarked, updatedAt: now },
      });

    revalidatePath("/problems");
    revalidatePath("/dashboard");

    return { success: true, message: newBookmarked ? "Bookmarked." : "Bookmark removed." };
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
    return { success: false, message: "Failed to toggle bookmark." };
  }
}
