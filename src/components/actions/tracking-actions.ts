"use server";

import { and, count, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/services/Database/client";
import { userProblemStates } from "@/services/Database/schema/tracking";
import { getCurrentSession } from "@/services/Auth/auth";

export type ProblemStateMap = Record<
  string,
  {
    isSolved: boolean;
    status: "not_started" | "tried" | "solved";
    bookmarked: boolean;
    note: string | null;
  }
>;

export type UserProgressStats = {
  solved: number;
  bookmarked: number;
};

export async function getUserProblemStateMap(
  problemIds: string[],
): Promise<ProblemStateMap> {
  const session = await getCurrentSession();
  if (!session || problemIds.length === 0) return {};

  const rows = await db
    .select({
      problemId: userProblemStates.problemId,
      status: userProblemStates.status,
      bookmarked: userProblemStates.bookmarked,
      note: userProblemStates.note,
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
    map[row.problemId] = {
      isSolved: row.status === "solved",
      status: row.status,
      bookmarked: row.bookmarked,
      note: row.note,
    };
  }
  return map;
}

export async function getUserProgressStats(): Promise<UserProgressStats> {
  const session = await getCurrentSession();
  if (!session) return { solved: 0, bookmarked: 0 };

  const [solvedResult] = await db
    .select({ value: count() })
    .from(userProblemStates)
    .where(
      and(
        eq(userProblemStates.userId, session.user.id),
        eq(userProblemStates.status, "solved"),
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
    bookmarked: bookmarkedResult?.value ?? 0,
  };
}

export async function toggleSolvedAction(
  problemId: string,
): Promise<{ success: boolean; isSolved: boolean }> {
  const session = await getCurrentSession();
  if (!session) return { success: false, isSolved: false };

  const now = new Date();

  const [existing] = await db
    .select({ status: userProblemStates.status })
    .from(userProblemStates)
    .where(
      and(
        eq(userProblemStates.userId, session.user.id),
        eq(userProblemStates.problemId, problemId),
      ),
    );

  const newSolved = existing?.status !== "solved";
  const status = newSolved ? "solved" : "not_started";

  await db
    .insert(userProblemStates)
    .values({
      userId: session.user.id,
      problemId,
      status,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [userProblemStates.userId, userProblemStates.problemId],
      set: { status, updatedAt: now },
    });

  revalidatePath("/dashboard");

  return { success: true, isSolved: newSolved };
}

export async function toggleProblemBookmarkAction(
  problemId: string,
): Promise<{ success: boolean; message: string }> {
  const session = await getCurrentSession();
  if (!session) return { success: false, message: "Unauthorized." };

  const now = new Date();

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

  revalidatePath("/dashboard");

  return {
    success: true,
    message: newBookmarked ? "Bookmarked." : "Bookmark removed.",
  };
}

export async function upsertProblemNoteAction(
  problemId: string,
  note: string,
): Promise<{ success: boolean; message: string }> {
  const session = await getCurrentSession();
  if (!session) return { success: false, message: "Unauthorized." };

  const now = new Date();

  try {
    await db
      .insert(userProblemStates)
      .values({
        userId: session.user.id,
        problemId,
        note,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [userProblemStates.userId, userProblemStates.problemId],
        set: { note, updatedAt: now },
      });

    revalidatePath("/dashboard");

    return { success: true, message: "Note saved." };
  } catch (error) {
    console.error("Failed to save note:", error);
    return { success: false, message: "Failed to save note." };
  }
}
