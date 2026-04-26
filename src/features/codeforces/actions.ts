"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema/auth";
import { problems } from "@/db/schema/problems";
import { userProblemStates } from "@/db/schema/tracking";
import { getCurrentSession } from "@/server/auth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SyncResult = {
  success: boolean;
  message: string;
  fetched?: number;
  accepted?: number;
  matchedLocal?: number;
  updatedStates?: number;
};

type CfSubmission = {
  id: number;
  contestId?: number;
  problem: {
    contestId?: number;
    index: string;
    name: string;
    rating?: number;
  };
  verdict?: string;
  creationTimeSeconds: number;
};

type CfApiResponse = {
  status: string;
  result?: CfSubmission[];
  comment?: string;
};

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const handleSchema = z
  .string()
  .min(1, "Handle is required.")
  .max(24, "Handle too long.")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Handle can only contain letters, digits, underscores, dots, and hyphens.");

// ---------------------------------------------------------------------------
// Save handle
// ---------------------------------------------------------------------------

export async function saveCodeforcesHandleAction(
  rawHandle: string,
): Promise<{ success: boolean; message: string }> {
  const session = await getCurrentSession();
  if (!session) return { success: false, message: "Unauthorized." };

  const parsed = handleSchema.safeParse(rawHandle.trim());
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid handle." };
  }

  try {
    await db
      .update(users)
      .set({ codeforcesHandle: parsed.data, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    return { success: true, message: `Handle saved as "${parsed.data}".` };
  } catch (error) {
    console.error("Failed to save CF handle:", error);
    return { success: false, message: "Failed to save handle." };
  }
}

// ---------------------------------------------------------------------------
// Get saved handle
// ---------------------------------------------------------------------------

export async function getCodeforcesHandle(): Promise<string | null> {
  const session = await getCurrentSession();
  if (!session) return null;

  const [row] = await db
    .select({ codeforcesHandle: users.codeforcesHandle })
    .from(users)
    .where(eq(users.id, session.user.id));

  return row?.codeforcesHandle ?? null;
}

// ---------------------------------------------------------------------------
// Sync solved
// ---------------------------------------------------------------------------

export async function syncCodeforcesSolvedAction(): Promise<SyncResult> {
  const session = await getCurrentSession();
  if (!session) return { success: false, message: "Unauthorized." };

  // 1. Get saved handle
  const [userRow] = await db
    .select({ codeforcesHandle: users.codeforcesHandle })
    .from(users)
    .where(eq(users.id, session.user.id));

  const handle = userRow?.codeforcesHandle;
  if (!handle) {
    return { success: false, message: "No Codeforces handle saved. Please save your handle first." };
  }

  // 2. Fetch submissions from CF API
  let cfData: CfApiResponse;
  try {
    const url = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return {
        success: false,
        message: `Codeforces API returned HTTP ${res.status}. Check if the handle "${handle}" is valid.`,
      };
    }

    cfData = (await res.json()) as CfApiResponse;
  } catch (error) {
    console.error("CF API fetch failed:", error);
    return { success: false, message: "Network error while contacting Codeforces API." };
  }

  if (cfData.status !== "OK" || !cfData.result) {
    return {
      success: false,
      message: cfData.comment ?? "Codeforces API returned an unexpected response.",
    };
  }

  const allSubmissions = cfData.result;
  const fetched = allSubmissions.length;

  // 3. Keep only verdict=OK, deduplicate by (contestId, index), keep earliest solve time
  const solvedMap = new Map<string, number>(); // key -> creationTimeSeconds
  for (const sub of allSubmissions) {
    if (sub.verdict !== "OK") continue;
    const contestId = sub.problem.contestId ?? sub.contestId;
    if (!contestId) continue;
    const key = `${contestId}:${sub.problem.index}`;
    const existing = solvedMap.get(key);
    if (!existing || sub.creationTimeSeconds < existing) {
      solvedMap.set(key, sub.creationTimeSeconds);
    }
  }

  const accepted = solvedMap.size;

  // 4. Get all local CF problems
  const localCfProblems = await db
    .select({
      id: problems.id,
      externalContestId: problems.externalContestId,
      externalProblemIndex: problems.externalProblemIndex,
    })
    .from(problems)
    .where(eq(problems.platform, "codeforces"));

  // 5. Match
  const matches: { problemId: string; solvedAtEpoch: number }[] = [];
  for (const lp of localCfProblems) {
    if (!lp.externalContestId || !lp.externalProblemIndex) continue;
    const key = `${lp.externalContestId}:${lp.externalProblemIndex}`;
    const solvedEpoch = solvedMap.get(key);
    if (solvedEpoch !== undefined) {
      matches.push({ problemId: lp.id, solvedAtEpoch: solvedEpoch });
    }
  }

  const matchedLocal = matches.length;

  // 6. Upsert user_problem_states for each match
  let updatedStates = 0;
  for (const match of matches) {
    const solvedAt = new Date(match.solvedAtEpoch * 1000);
    const now = new Date();

    // Check if row exists to preserve bookmarked flag
    const [existing] = await db
      .select({ bookmarked: userProblemStates.bookmarked })
      .from(userProblemStates)
      .where(
        and(
          eq(userProblemStates.userId, session.user.id),
          eq(userProblemStates.problemId, match.problemId),
        ),
      );

    await db
      .insert(userProblemStates)
      .values({
        userId: session.user.id,
        problemId: match.problemId,
        status: "solved",
        bookmarked: existing?.bookmarked ?? false,
        solvedAt,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [userProblemStates.userId, userProblemStates.problemId],
        set: {
          status: "solved" as const,
          solvedAt,
          updatedAt: now,
        },
      });

    updatedStates++;
  }

  revalidatePath("/problems");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Sync complete! Fetched ${fetched} submissions, ${accepted} accepted, ${matchedLocal} matched local problems, ${updatedStates} states updated.`,
    fetched,
    accepted,
    matchedLocal,
    updatedStates,
  };
}
