"use server";

import { db } from "@/db";
import { eq, desc, and, inArray, gte, sql } from "drizzle-orm";
import { userProblemStates } from "@/db/schema/tracking";
import { problems } from "@/db/schema/problems";
import { getCurrentSession } from "@/server/auth";

export async function getRecentUserProblemStates(
  tab: "solved" | "attempted" = "solved",
  limit = 20
) {
  const session = await getCurrentSession();
  if (!session) return [];

  const statuses = tab === "solved" ? ["solved"] : ["tried"];

  const results = await db
    .select({
      stateId: userProblemStates.id,
      status: userProblemStates.status,
      updatedAt: userProblemStates.updatedAt,
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
        inArray(userProblemStates.status, statuses as ("not_started" | "tried" | "solved")[])
      )
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
      day: sql<string>`DATE(${userProblemStates.solvedAt})`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(userProblemStates)
    .where(
      and(
        eq(userProblemStates.userId, session.user.id),
        eq(userProblemStates.status, "solved"),
        gte(userProblemStates.solvedAt, startDate),
      ),
    )
    .groupBy(sql`DATE(${userProblemStates.solvedAt})`);

  return rows;
}
