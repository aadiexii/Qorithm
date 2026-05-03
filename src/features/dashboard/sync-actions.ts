"use server";

import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { users } from "@/db/schema/auth";
import { userProblemStates } from "@/db/schema/tracking";
import { problems } from "@/db/schema/problems";
import { getCurrentSession } from "@/server/auth";
import { CodeforcesAdapter, AtCoderAdapter, PlatformAdapter } from "@/lib/platforms";
import { incrementStreak } from "./potd-actions";

export async function syncPlatform(platformId: "codeforces" | "atcoder") {
  const session = await getCurrentSession();
  if (!session) throw new Error("Unauthorized");

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
  if (!user) throw new Error("User not found");

  const handle = platformId === "codeforces" ? user.codeforcesHandle : user.atcoderHandle;
  if (!handle) throw new Error(`No ${platformId} handle connected`);

  const lastSyncAt = platformId === "codeforces" ? user.codeforcesLastSyncAt : user.atcoderLastSyncAt;
  
  const adapter: PlatformAdapter = platformId === "codeforces" ? CodeforcesAdapter : AtCoderAdapter;

  try {
    const timestamp = lastSyncAt ? lastSyncAt.getTime() : undefined;
    const solves = await adapter.fetchRecentSolves(handle, timestamp);

    if (solves.length > 0) {
      // Find matching problems in our database
      const dbProblems = await db
        .select({ id: problems.id, contestId: problems.externalContestId, index: problems.externalProblemIndex })
        .from(problems)
        .where(eq(problems.platform, platformId));

        let hasTodaySolve = false;
      const today = new Date().toISOString().split("T")[0];

      for (const solve of solves) {
        // Try to match problem. Codeforces matches by contestId + index. AtCoder matches by index (problemIdStr)
        const match = dbProblems.find(p => 
          (platformId === "codeforces" && p.contestId == solve.contestId && p.index === solve.problemIdStr) ||
          (platformId === "atcoder" && p.index === solve.problemIdStr)
        );

        if (match) {
          // Upsert solve state
          const [existingState] = await db
            .select()
            .from(userProblemStates)
            .where(and(
              eq(userProblemStates.userId, user.id),
              eq(userProblemStates.problemId, match.id)
            ));

          const solveDate = new Date(solve.timestamp);

          if (!existingState) {
            await db.insert(userProblemStates).values({
              userId: user.id,
              problemId: match.id,
              status: "solved",
              updatedAt: solveDate,
            });
            if (solveDate.toISOString().split("T")[0] === today) hasTodaySolve = true;
          } else if (existingState.status !== "solved") {
            await db.update(userProblemStates)
              .set({ status: "solved", updatedAt: solveDate })
              .where(eq(userProblemStates.id, existingState.id));
            if (solveDate.toISOString().split("T")[0] === today) hasTodaySolve = true;
          }
        }
      }

      if (hasTodaySolve) {
        await incrementStreak(user.id);
      }
    }

    // Update last sync time
    const syncTime = new Date();
    if (platformId === "codeforces") {
      await db.update(users).set({ codeforcesLastSyncAt: syncTime }).where(eq(users.id, user.id));
    } else {
      await db.update(users).set({ atcoderLastSyncAt: syncTime }).where(eq(users.id, user.id));
    }

    return { success: true, count: solves.length };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to sync" };
  }
}

export async function connectPlatform(platformId: "codeforces" | "atcoder", handle: string) {
  const session = await getCurrentSession();
  if (!session) throw new Error("Unauthorized");

  const adapter = platformId === "codeforces" ? CodeforcesAdapter : AtCoderAdapter;
  try {
    const profile = await adapter.fetchProfile(handle);
    
    if (platformId === "codeforces") {
      await db.update(users).set({ codeforcesHandle: profile.handle }).where(eq(users.id, session.user.id));
    } else {
      await db.update(users).set({ atcoderHandle: profile.handle }).where(eq(users.id, session.user.id));
    }

    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message || "Invalid handle or API error" };
  }
}

export async function disconnectPlatform(platformId: "codeforces" | "atcoder") {
  const session = await getCurrentSession();
  if (!session) throw new Error("Unauthorized");

  if (platformId === "codeforces") {
    await db.update(users).set({ codeforcesHandle: null, codeforcesLastSyncAt: null }).where(eq(users.id, session.user.id));
  } else {
    await db.update(users).set({ atcoderHandle: null, atcoderLastSyncAt: null }).where(eq(users.id, session.user.id));
  }

  return { success: true };
}
