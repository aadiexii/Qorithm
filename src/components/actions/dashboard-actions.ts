"use server";

import { and, eq, count } from "drizzle-orm";
import { db } from "@/services/Database/client";
import { users } from "@/services/Database/schema/auth";
import { userProblemStates } from "@/services/Database/schema/tracking";
import { sheetSectionProblems } from "@/services/Database/schema/sheet";
import { userOaProblemStates } from "@/services/Database/schema/oa";
import { getCurrentSession } from "@/services/Auth/auth";

export async function getDashboardStats() {
  const session = await getCurrentSession();
  if (!session) {
    return {
      totalSolved: 0,
      sheetSolved: 0,
      oaSolved: 0,
      codeforcesHandle: null,
    };
  }

  const userId = session.user.id;

  // 1. CF Handle
  const [userRow] = await db
    .select({ codeforcesHandle: users.codeforcesHandle })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // 2. Sheet Solved Count
  const [sheetSolvedRes] = await db
    .select({ count: count() })
    .from(userProblemStates)
    .innerJoin(
      sheetSectionProblems,
      eq(sheetSectionProblems.problemId, userProblemStates.problemId),
    )
    .where(
      and(
        eq(userProblemStates.userId, userId),
        eq(userProblemStates.status, "solved"),
      ),
    );

  // 3. OA Solved Count
  const [oaSolvedRes] = await db
    .select({ count: count() })
    .from(userOaProblemStates)
    .where(
      and(
        eq(userOaProblemStates.userId, userId),
        eq(userOaProblemStates.status, "solved"),
      ),
    );

  const sheetSolved = sheetSolvedRes?.count ?? 0;
  const oaSolved = oaSolvedRes?.count ?? 0;
  const totalSolved = sheetSolved + oaSolved;

  return {
    totalSolved,
    sheetSolved,
    oaSolved,
    codeforcesHandle: userRow?.codeforcesHandle ?? null,
  };
}
