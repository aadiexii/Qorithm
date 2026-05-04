"use server";

import { db } from "@/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { userProblemStates } from "@/db/schema/tracking";
import { problems } from "@/db/schema/problems";
import { users } from "@/db/schema/auth";
import { userStreaks } from "@/db/schema/challenges";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  codeforcesHandle: string | null;
  atcoderHandle: string | null;
  score: number;
  solvedCount: number;
  recentActivity: Date;
  streak: number;
};

export async function getLeaderboard(scope: "weekly" | "all-time" = "all-time"): Promise<LeaderboardEntry[]> {
  const dateFilter = scope === "weekly"
    ? sql`COALESCE(${userProblemStates.solvedAt}, ${userProblemStates.updatedAt}) >= NOW() - INTERVAL '7 days'`
    : undefined;

  const results = await db
    .select({
      userId: users.id,
      name: users.name,
      image: users.image,
      codeforcesHandle: users.codeforcesHandle,
      atcoderHandle: users.atcoderHandle,
      score: sql<number>`CAST(SUM(COALESCE(${problems.rating}, ${problems.externalDifficulty}, 0)) AS INTEGER)`,
      solvedCount: sql<number>`CAST(COUNT(${problems.id}) AS INTEGER)`,
      recentActivity: sql<Date>`MAX(${userProblemStates.updatedAt})`,
      streak: userStreaks.currentStreak,
    })
    .from(userProblemStates)
    .innerJoin(users, eq(users.id, userProblemStates.userId))
    .innerJoin(problems, eq(problems.id, userProblemStates.problemId))
    .leftJoin(userStreaks, eq(userStreaks.userId, users.id))
    .where(
      and(
        eq(userProblemStates.status, "solved"),
        dateFilter
      )
    )
    .groupBy(users.id, userStreaks.currentStreak)
    .orderBy(
      desc(sql`CAST(SUM(COALESCE(${problems.rating}, ${problems.externalDifficulty}, 0)) AS INTEGER)`),
      desc(sql`CAST(COUNT(${problems.id}) AS INTEGER)`),
      desc(sql`MAX(${userProblemStates.updatedAt})`)
    )
    .limit(100);

  return results.map((r, i) => ({
    rank: i + 1,
    userId: r.userId,
    name: r.name,
    image: r.image,
    codeforcesHandle: r.codeforcesHandle,
    atcoderHandle: r.atcoderHandle,
    score: Number(r.score || 0),
    solvedCount: Number(r.solvedCount || 0),
    recentActivity: r.recentActivity,
    streak: r.streak || 0,
  }));
}
