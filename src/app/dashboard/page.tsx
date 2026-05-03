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

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/");

  const progress = await getUserProgressStats();
  
  // Fetch recent user activity for the new Solved Focus view
  const recentSolved = await getRecentUserProblemStates("solved", 20);
  const recentAttempted = await getRecentUserProblemStates("attempted", 20);

  // Fetch POTD and Streak info
  const potd = await getTodayChallenge();
  const streak = await getUserStreak();
  const heatmapData = await getSolveHeatmap();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
      
      {/* Top Stat Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/80 backdrop-blur-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 text-purple-500">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Overall Progress</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">{progress.solved}</span>
                <span className="text-sm font-medium text-slate-500">/ {progress.tried + progress.solved || 150} attempted</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="sm:col-span-1 lg:col-span-2">
          <PotdCard potd={potd} streak={streak} />
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Problem Table */}
        <div className="lg:col-span-2 space-y-4">
          <RecentSolvesClient solved={recentSolved} attempted={recentAttempted} />
        </div>

        <div className="space-y-6">
          <SolveHeatmap data={heatmapData} />

          <Card className="border-border/60 bg-card/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">Connected Platforms</CardTitle>
              <CardDescription>Sync your solved problems automatically.</CardDescription>
            </CardHeader>
            <CardContent>
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
        </div>
      </div>
    </div>
  );
}
