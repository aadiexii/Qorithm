"use server";

import { db } from "@/services/Database/client";
import { eq, desc, and, sql } from "drizzle-orm";
import { userProblemStates } from "@/services/Database/schema/tracking";
import { problems } from "@/services/Database/schema/problems";
import { users } from "@/services/Database/schema/auth";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  codeforcesHandle: string | null;
  score: number;
  solvedCount: number;
  recentActivity: Date;
};

export async function getLeaderboard(
  scope: "weekly" | "all-time" = "all-time",
): Promise<LeaderboardEntry[]> {
  const dateFilter =
    scope === "weekly"
      ? sql`${userProblemStates.updatedAt} >= NOW() - INTERVAL '7 days'`
      : undefined;

  const results = await db
    .select({
      userId: users.id,
      name: users.name,
      image: users.image,
      codeforcesHandle: users.codeforcesHandle,
      score: sql<number>`CAST(SUM(COALESCE(${problems.rating}, ${problems.externalDifficulty}, 0)) AS INTEGER)`,
      solvedCount: sql<number>`CAST(COUNT(${problems.id}) AS INTEGER)`,
      recentActivity: sql<Date>`MAX(${userProblemStates.updatedAt})`,
    })
    .from(userProblemStates)
    .innerJoin(users, eq(users.id, userProblemStates.userId))
    .innerJoin(problems, eq(problems.id, userProblemStates.problemId))
    .where(and(eq(userProblemStates.status, "solved"), dateFilter))
    .groupBy(users.id)
    .orderBy(
      desc(
        sql`CAST(SUM(COALESCE(${problems.rating}, ${problems.externalDifficulty}, 0)) AS INTEGER)`,
      ),
      desc(sql`CAST(COUNT(${problems.id}) AS INTEGER)`),
      desc(sql`MAX(${userProblemStates.updatedAt})`),
    )
    .limit(100);

  return results.map((r, i) => ({
    rank: i + 1,
    userId: r.userId,
    name: r.name,
    image: r.image,
    codeforcesHandle: r.codeforcesHandle,
    score: Number(r.score || 0),
    solvedCount: Number(r.solvedCount || 0),
    recentActivity: r.recentActivity,
  }));
}
