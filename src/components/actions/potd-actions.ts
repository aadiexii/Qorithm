"use server";

import { db } from "@/services/Database/client";
import { eq, and, sql, notInArray } from "drizzle-orm";
import { userDailyChallenges } from "@/services/Database/schema/challenges";
import { userProblemStates } from "@/services/Database/schema/tracking";
import { problems } from "@/services/Database/schema/problems";
import { users } from "@/services/Database/schema/auth";
import { getCurrentSession } from "@/services/Auth/auth";
import { CodeforcesAdapter } from "@/services/Platforms";

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
