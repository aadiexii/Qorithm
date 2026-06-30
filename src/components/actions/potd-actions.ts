"use server";

import { db } from "@/services/Database/client";
import { eq, and, sql, notInArray } from "drizzle-orm";
import { userDailyChallenges } from "@/services/Database/schema/challenges";
import { userProblemStates } from "@/services/Database/schema/tracking";
import { problems } from "@/services/Database/schema/problems";
import { users } from "@/services/Database/schema/auth";
import { getCurrentSession } from "@/services/Auth/auth";
import { CodeforcesAdapter } from "@/services/Platforms";

import { desc } from "drizzle-orm";

export async function getTodayChallenge() {
  const session = await getCurrentSession();
  if (!session) return null;

  const [userRecord] = await db
    .select({
      codeforcesHandle: users.codeforcesHandle,
    })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!userRecord?.codeforcesHandle) return null;

  const today = new Date().toISOString().split("T")[0];

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
        eq(userDailyChallenges.date, today),
      ),
    )
    .limit(1);

  if (existing) return existing;

  let targetRating = 800;
  let basis: string;

  try {
    const profile = await CodeforcesAdapter.fetchProfile(
      userRecord.codeforcesHandle,
    );
    if (profile.rating != null) {
      targetRating = profile.rating;
      basis = `Based on your Codeforces rating of ${targetRating}.`;
    } else {
      basis = `Your Codeforces account is unrated — defaulting to ${targetRating}.`;
    }
  } catch {
    basis = `Could not fetch Codeforces rating — defaulting to ${targetRating}.`;
  }

  const minRating = targetRating - 200;
  const maxRating = targetRating + 200;

  const solvedQuery = db
    .select({ id: userProblemStates.problemId })
    .from(userProblemStates)
    .where(
      and(
        eq(userProblemStates.userId, session.user.id),
        eq(userProblemStates.status, "solved"),
      ),
    );

  const [problem] = await db
    .select({ id: problems.id })
    .from(problems)
    .where(
      and(
        eq(problems.platform, "codeforces"),
        sql`COALESCE(${problems.rating}, ${problems.externalDifficulty}) >= ${minRating}`,
        sql`COALESCE(${problems.rating}, ${problems.externalDifficulty}) <= ${maxRating}`,
        notInArray(problems.id, solvedQuery),
      ),
    )
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!problem) return null;

  await db.insert(userDailyChallenges).values({
    userId: session.user.id,
    date: today,
    problemId: problem.id,
    targetRating: targetRating,
    basis: basis,
    status: "pending",
  });

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
        eq(userDailyChallenges.date, today),
      ),
    )
    .limit(1);

  return created;
}

// ─── Streak helper (shared) ──────────────────────────────────────────────────
export async function calculateStreak(userId: string): Promise<number> {
  const completedDates = await db
    .selectDistinct({ date: userDailyChallenges.date })
    .from(userDailyChallenges)
    .where(
      and(
        eq(userDailyChallenges.userId, userId),
        eq(userDailyChallenges.status, "completed"),
      ),
    )
    .orderBy(desc(userDailyChallenges.date));

  if (completedDates.length === 0) return 0;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const latestDate = new Date(completedDates[0].date);
  latestDate.setUTCHours(0, 0, 0, 0);
  const diffFromToday =
    (today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24);

  if (diffFromToday > 1) return 0;

  let streak = 0;
  let expected = latestDate;
  for (const row of completedDates) {
    const d = new Date(row.date);
    d.setUTCHours(0, 0, 0, 0);
    if (d.getTime() === expected.getTime()) {
      streak++;
      expected = new Date(expected.getTime() - 1000 * 60 * 60 * 24);
    } else {
      break;
    }
  }
  return streak;
}

// ─── Verify daily challenge via CF API ───────────────────────────────────────
export async function verifyDailyChallengeAction(): Promise<{
  streak: number;
  justCompleted: boolean;
}> {
  const session = await getCurrentSession();
  if (!session) return { streak: 0, justCompleted: false };

  const [userRow] = await db
    .select({ codeforcesHandle: users.codeforcesHandle })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!userRow?.codeforcesHandle) return { streak: 0, justCompleted: false };

  const today = new Date().toISOString().split("T")[0];

  const [challenge] = await db
    .select({
      id: userDailyChallenges.id,
      externalContestId: problems.externalContestId,
      externalProblemIndex: problems.externalProblemIndex,
      status: userDailyChallenges.status,
    })
    .from(userDailyChallenges)
    .innerJoin(problems, eq(problems.id, userDailyChallenges.problemId))
    .where(
      and(
        eq(userDailyChallenges.userId, session.user.id),
        eq(userDailyChallenges.date, today),
      ),
    )
    .limit(1);

  if (!challenge) {
    return { streak: await calculateStreak(session.user.id), justCompleted: false };
  }

  if (challenge.status === "completed") {
    return {
      streak: await calculateStreak(session.user.id),
      justCompleted: false,
    };
  }

  let justCompleted = false;
  try {
    const submissions = await CodeforcesAdapter.fetchSubmissions!(
      userRow.codeforcesHandle,
    );
    const isAccepted = submissions.some(
      (sub) =>
        sub.problem.contestId === challenge.externalContestId &&
        sub.problem.index === challenge.externalProblemIndex &&
        sub.verdict === "OK",
    );

    if (isAccepted) {
      await db
        .update(userDailyChallenges)
        .set({ status: "completed" })
        .where(eq(userDailyChallenges.id, challenge.id));
      justCompleted = true;
    }
  } catch {
    // API error — return current state without failing
  }

  return {
    streak: await calculateStreak(session.user.id),
    justCompleted,
  };
}
