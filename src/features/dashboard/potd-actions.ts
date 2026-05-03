"use server";

import { db } from "@/db";
import { eq, desc, and, sql, notInArray } from "drizzle-orm";
import { userDailyChallenges, userStreaks } from "@/db/schema/challenges";
import { userProblemStates } from "@/db/schema/tracking";
import { problems } from "@/db/schema/problems";
import { getCurrentSession } from "@/server/auth";

// Gets or creates today's daily challenge for the user
export async function getTodayChallenge() {
  const session = await getCurrentSession();
  if (!session) return null;

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Check if exists
  const [existing] = await db
    .select({
      id: userDailyChallenges.id,
      status: userDailyChallenges.status,
      targetRating: userDailyChallenges.targetRating,
      basis: userDailyChallenges.basis,
      problemId: problems.id,
      title: problems.title,
      source: problems.source,
      rating: problems.rating,
      externalDifficulty: problems.externalDifficulty,
      platform: problems.platform,
      externalContestId: problems.externalContestId,
      externalProblemIndex: problems.externalProblemIndex,
    })
    .from(userDailyChallenges)
    .innerJoin(problems, eq(problems.id, userDailyChallenges.problemId))
    .where(
      and(
        eq(userDailyChallenges.userId, session.user.id),
        eq(userDailyChallenges.date, today)
      )
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  // Calculate target rating prioritizing Codeforces
  const recentSolves = await db
    .select({ 
      rating: problems.rating, 
      externalDifficulty: problems.externalDifficulty,
      platform: problems.platform
    })
    .from(userProblemStates)
    .innerJoin(problems, eq(problems.id, userProblemStates.problemId))
    .where(and(eq(userProblemStates.userId, session.user.id), eq(userProblemStates.status, "solved")))
    .orderBy(desc(userProblemStates.updatedAt))
    .limit(30);

  let targetRating = 800;
  let basis = "Based on the default starting skill level.";

  if (recentSolves.length > 0) {
    // Prefer Codeforces rating
    const cfSolves = recentSolves.filter(r => r.platform === "codeforces" && r.rating);
    if (cfSolves.length > 0) {
      // Use last 10 CF solves
      const recentCf = cfSolves.slice(0, 10);
      const sum = recentCf.reduce((acc, row) => acc + Number(row.rating), 0);
      targetRating = Math.round(sum / recentCf.length);
      basis = `Derived from your recent Codeforces performance (avg rating ${targetRating}).`;
    } else {
      // Fallback to COALESCE rating
      const validSolves = recentSolves.filter(r => r.rating || r.externalDifficulty).slice(0, 10);
      if (validSolves.length > 0) {
        const sum = validSolves.reduce((acc, row) => acc + Number(row.rating || row.externalDifficulty), 0);
        targetRating = Math.round(sum / validSolves.length);
        basis = `Derived from your recent overall solve history (avg rating ${targetRating}).`;
      }
    }
  }

  // Find unsolved problem near target rating
  const minRating = targetRating - 200;
  const maxRating = targetRating + 200;

  // Get IDs of solved problems
  const solvedQuery = db
    .select({ id: userProblemStates.problemId })
    .from(userProblemStates)
    .where(and(eq(userProblemStates.userId, session.user.id), eq(userProblemStates.status, "solved")));

  const [problem] = await db
    .select({ id: problems.id })
    .from(problems)
    .where(
      and(
        sql`COALESCE(${problems.rating}, ${problems.externalDifficulty}) >= ${minRating}`,
        sql`COALESCE(${problems.rating}, ${problems.externalDifficulty}) <= ${maxRating}`,
        notInArray(problems.id, solvedQuery)
      )
    )
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!problem) return null;

  // Insert
  await db.insert(userDailyChallenges).values({
    userId: session.user.id,
    date: today,
    problemId: problem.id,
    targetRating: targetRating,
    basis: basis,
    status: "pending",
  });

  // Re-fetch to return full structure
  const [created] = await db
    .select({
      id: userDailyChallenges.id,
      status: userDailyChallenges.status,
      targetRating: userDailyChallenges.targetRating,
      basis: userDailyChallenges.basis,
      problemId: problems.id,
      title: problems.title,
      source: problems.source,
      rating: problems.rating,
      externalDifficulty: problems.externalDifficulty,
      platform: problems.platform,
      externalContestId: problems.externalContestId,
      externalProblemIndex: problems.externalProblemIndex,
    })
    .from(userDailyChallenges)
    .innerJoin(problems, eq(problems.id, userDailyChallenges.problemId))
    .where(
      and(
        eq(userDailyChallenges.userId, session.user.id),
        eq(userDailyChallenges.date, today)
      )
    )
    .limit(1);

  return created;
}

// Get user streaks
export async function getUserStreak() {
  const session = await getCurrentSession();
  if (!session) return { currentStreak: 0, longestStreak: 0 };

  const [streak] = await db
    .select({
      currentStreak: userStreaks.currentStreak,
      longestStreak: userStreaks.longestStreak,
      lastActiveDate: userStreaks.lastActiveDate,
    })
    .from(userStreaks)
    .where(eq(userStreaks.userId, session.user.id));

  if (!streak) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // If lastActiveDate is before yesterday, current streak is actually 0 for display
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let displayStreak = streak.currentStreak;
  if (streak.lastActiveDate !== todayStr && streak.lastActiveDate !== yesterdayStr) {
    displayStreak = 0;
  }

  return {
    currentStreak: displayStreak,
    longestStreak: streak.longestStreak,
  };
}

// Logic to increment streak (call this whenever a solve is detected)
export async function incrementStreak(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const [streak] = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId));

  if (!streak) {
    await db.insert(userStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
    });
    return;
  }

  if (streak.lastActiveDate === today) {
    return; // Already incremented today
  }

  let newCurrentStreak = 1;
  if (streak.lastActiveDate === yesterdayStr) {
    newCurrentStreak = streak.currentStreak + 1;
  }

  const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);

  await db
    .update(userStreaks)
    .set({
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: today,
      updatedAt: new Date(),
    })
    .where(eq(userStreaks.userId, userId));
}
