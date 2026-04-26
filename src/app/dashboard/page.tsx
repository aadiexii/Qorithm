import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Flame, Trophy, CalendarDays, Maximize2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCurrentSession } from "@/server/auth";
import { getUserProgressStats, getUserProblemStateMap } from "@/features/tracking/actions";
import { queryProblems } from "@/features/problems/actions";
import { ProblemsTable } from "@/features/problems/components/problems-table";
import { PaginationControls } from "@/features/problems/components/pagination-controls";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const session = await getCurrentSession();
  if (!session) redirect("/");

  const params = await searchParams;

  const progress = await getUserProgressStats();



  const q = typeof params.q === "string" ? params.q : undefined;
  const topic = typeof params.topic === "string" ? params.topic : undefined;
  const minRating = typeof params.minRating === "string" ? Number(params.minRating) || undefined : undefined;
  const maxRating = typeof params.maxRating === "string" ? Number(params.maxRating) || undefined : undefined;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;
  const currentTab = typeof params.tab === "string" ? params.tab : "all";

  const result = await queryProblems({ q, topic, minRating, maxRating, page, pageSize: 15 });

  const problemIds = result.items.map((p) => p.id);
  const stateMap = await getUserProblemStateMap(problemIds);

  const ratings = [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900];

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
      
      {/* Top Stat Row */}
      <div className="grid gap-4 sm:grid-cols-2">
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

        <Card className="border-green-500/30 bg-green-500/10 backdrop-blur-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-200/90">Current Streak</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-green-100">0</span>
                <span className="text-sm font-medium text-green-300/80">Coming soon</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Chip Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Link 
          href="/dashboard"
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !minRating ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          All Ratings
        </Link>
        {ratings.map((r) => (
          <Link
            key={r}
            href={`/dashboard?minRating=${r}&maxRating=${r + 99}`}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              minRating === r ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {r}-{r + 99}
          </Link>
        ))}
      </div>

      {/* Two-Column Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Problem Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex w-full items-center gap-6 border-b border-border/60 pb-px">
              <Link 
                href="/dashboard?tab=all" 
                className={`border-b-2 pb-3 text-sm font-medium transition-colors ${currentTab === "all" ? "border-accent text-accent" : "border-transparent text-slate-400 hover:text-white"}`}
              >
                All Problems
              </Link>
              <Link 
                href="/dashboard?tab=bookmarked" 
                className={`border-b-2 pb-3 text-sm font-medium transition-colors ${currentTab === "bookmarked" ? "border-accent text-accent" : "border-transparent text-slate-400 hover:text-white"}`}
              >
                Bookmarked
              </Link>
              <Link 
                href="/dashboard?tab=notes" 
                className={`border-b-2 pb-3 text-sm font-medium transition-colors ${currentTab === "notes" ? "border-accent text-accent" : "border-transparent text-slate-400 hover:text-white"}`}
              >
                Notes
              </Link>
              
              <div className="ml-auto pb-3">
                <button className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  <Maximize2 className="h-4 w-4" /> Focus Mode
                </button>
              </div>
            </div>
          </div>

          <ProblemsTable
            problems={result.items}
            total={result.total}
            stateMap={stateMap}
          />

          <Suspense fallback={null}>
            <PaginationControls page={result.page} totalPages={result.totalPages} />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-card/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-accent" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 leading-relaxed">
                You have successfully solved <span className="font-bold text-white">{progress.solved}</span> problems and attempted <span className="font-bold text-white">{progress.tried}</span> others.
              </p>
              <p className="mt-4 text-xs text-slate-400">
                Keep up the momentum to build your problem-solving skills!
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">Leaderboard</CardTitle>
              <CardDescription>Global ranking system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border/60 bg-white/5">
                <p className="text-sm text-slate-400">Leaderboards coming soon.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">Connect Codeforces</CardTitle>
              <CardDescription>Sync your solved problems automatically.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href="/settings"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/80"
              >
                Go to Settings
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
