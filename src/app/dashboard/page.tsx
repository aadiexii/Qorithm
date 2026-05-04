import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCurrentSession } from "@/server/auth";
import { getUserProgressStats } from "@/features/tracking/actions";
import { getRecentUserProblemStates, getSolveHeatmap } from "@/features/dashboard/solved-actions";
import { RecentSolvesClient } from "@/features/dashboard/components/recent-solves-client";
import { getTodayChallenge, getUserStreak } from "@/features/dashboard/potd-actions";
import { PotdCard } from "@/features/dashboard/components/potd-card";
import { SolveHeatmap } from "@/features/dashboard/components/solve-heatmap";
import { getLeaderboard } from "@/features/leaderboard/actions";
import { LeaderboardPreviewCard } from "@/features/leaderboard/components/leaderboard-preview-card";
import { db } from "@/db";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/");

  const progress = await getUserProgressStats();
  
  // Fetch connection status for POTD gating
  const [userRecord] = await db
    .select({ 
      codeforcesHandle: users.codeforcesHandle,
      atcoderHandle: users.atcoderHandle
    })
    .from(users)
    .where(eq(users.id, session.user.id));
  const isDailyEligible = Boolean(userRecord?.codeforcesHandle && userRecord?.atcoderHandle);

  // Fetch recent user activity for the new Solved Focus view
  const recentSolved = await getRecentUserProblemStates("solved", 20);
  const recentAttempted = await getRecentUserProblemStates("attempted", 20);
  const recentBookmarked = await getRecentUserProblemStates("bookmarked", 20);

  // Fetch POTD, Streak info, and Leaderboard
  const potd = await getTodayChallenge();
  const streak = await getUserStreak();
  const heatmapData = await getSolveHeatmap();
  const leaderboardPreview = await getLeaderboard("all-time");

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
      
      {/* Onboarding Nudge */}
      {!isDailyEligible && (
        <div className="mb-[-1rem] flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
          <p className="text-sm font-medium text-accent-foreground">
            Step 1/1: Connect both platforms to unlock Daily Challenge.
          </p>
          <Link
            href="/settings"
            className="text-sm font-bold text-accent hover:underline shrink-0"
          >
            Go to Settings →
          </Link>
        </div>
      )}

      {/* Section 1: Recent Activity (Full width) */}
      <div className="w-full">
        <RecentSolvesClient solved={recentSolved} attempted={recentAttempted} bookmarked={recentBookmarked} />
      </div>

      {/* Section 2: Daily Challenge + Heatmap */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PotdCard potd={potd} streak={streak} isDailyEligible={isDailyEligible} />
        </div>
        <div className="lg:col-span-1">
          <SolveHeatmap data={heatmapData} />
        </div>
      </div>

      {/* Section 3: KPI/Progress cards + Connected Platforms + Leaderboard */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        <Card className="border-border/60 bg-card/80 backdrop-blur-md flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-500" /> Overall Progress
            </CardTitle>
            <CardDescription>Your lifetime statistics</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center flex-1 py-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-white">{progress.solved}</span>
              <span className="text-sm font-medium text-slate-500">/ {progress.tried + progress.solved || 150} attempted</span>
            </div>
            <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-purple-500 h-full rounded-full" 
                style={{ width: `${Math.min(100, ((progress.solved) / (progress.tried + progress.solved || 1)) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-md flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Connected Platforms</CardTitle>
            <CardDescription>Sync your solved problems automatically.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Codeforces and AtCoder accounts to track your progress globally.
            </p>
            <Link 
              href="/settings"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/80"
            >
              Manage Integrations
            </Link>
          </CardContent>
        </Card>

        <LeaderboardPreviewCard 
          data={leaderboardPreview} 
          currentUserId={session.user.id} 
        />
      </div>
    </div>
  );
}
