"use server";

import { db } from "@/services/Database/client";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { userProblemStates } from "@/services/Database/schema/tracking";
import { problems } from "@/services/Database/schema/problems";
import { getCurrentSession } from "@/services/Auth/auth";

export async function getRecentUserProblemStates(
  tab: "solved" | "bookmarked" = "solved",
  limit = 20,
) {
  const session = await getCurrentSession();
  if (!session) return [];

  const results = await db
    .select({
      stateId: userProblemStates.id,
      status: userProblemStates.status,
      updatedAt: userProblemStates.updatedAt,
      note: userProblemStates.note,
      problemId: problems.id,
      title: problems.title,
      source: problems.source,
      rating: problems.rating,
      externalDifficulty: problems.externalDifficulty,
      platform: problems.platform,
      externalContestId: problems.externalContestId,
      externalProblemIndex: problems.externalProblemIndex,
    })
    .from(userProblemStates)
    .innerJoin(problems, eq(problems.id, userProblemStates.problemId))
    .where(
      and(
        eq(userProblemStates.userId, session.user.id),
        tab === "bookmarked"
          ? eq(userProblemStates.bookmarked, true)
          : eq(userProblemStates.status, "solved"),
      ),
    )
    .orderBy(desc(userProblemStates.updatedAt))
    .limit(limit);

  return results;
}

export async function getSolveHeatmap(days = 140) {
  const session = await getCurrentSession();
  if (!session) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Math.max(1, days - 1));

  const rows = await db
    .select({
      day: sql<string>`DATE(${userProblemStates.updatedAt})`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(userProblemStates)
    .where(
      and(
        eq(userProblemStates.userId, session.user.id),
        eq(userProblemStates.status, "solved"),
        gte(userProblemStates.updatedAt, startDate),
      ),
    )
    .groupBy(sql`DATE(${userProblemStates.updatedAt})`);

  return rows;
}
