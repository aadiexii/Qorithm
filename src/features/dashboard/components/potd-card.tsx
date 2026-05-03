"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Flame, ExternalLink, CalendarClock, Trophy, Zap } from "lucide-react";
import { buildProblemUrl } from "@/lib/problem-url";

type POTD = {
  id: string;
  status: "pending" | "completed" | "skipped";
  problemId: string;
  title: string;
  source: string;
  rating: number | null;
  externalDifficulty: number | null;
  platform: "custom" | "codeforces" | "atcoder";
  externalContestId: number | null;
  externalProblemIndex: string | null;
  targetRating?: number | null;
  basis?: string | null;
};

type StreakInfo = {
  currentStreak: number;
  longestStreak: number;
};

export function PotdCard({
  potd,
  streak,
  cfConnected,
}: {
  potd: POTD | null;
  streak: StreakInfo;
  cfConnected: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setUTCHours(23, 59, 59, 999); // Reset at UTC midnight
      
      const diff = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${mins}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!potd) {
    return (
      <Card className="border-border/60 bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-accent" /> Daily Challenge
          </CardTitle>
          <CardDescription>
            {cfConnected
              ? "No suitable problems found. Keep solving on Codeforces!"
              : "Connect Codeforces to unlock your personalized Daily Challenge."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!cfConnected && (
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow hover:bg-accent/90 transition-colors"
            >
              <Zap className="h-4 w-4" /> Connect Codeforces
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  const solveUrl = buildProblemUrl(potd.platform, potd.externalContestId, potd.externalProblemIndex, potd.source);
  const isSolved = potd.status === "completed";

  return (
    <Card className="border-border/60 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md overflow-hidden relative">
      {/* Decorative background glow */}
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-20 pointer-events-none ${isSolved ? 'bg-emerald-500' : 'bg-accent'}`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="h-5 w-5 text-accent" /> Daily Challenge
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              Resets in <span className="font-mono font-medium text-foreground">{timeLeft}</span>
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-sm font-semibold border border-white/10 shadow-sm">
            <Flame className={`h-4 w-4 ${streak.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
            <span className={streak.currentStreak > 0 ? "text-white" : "text-muted-foreground"}>
              {streak.currentStreak}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border/50 bg-background/50 p-4 relative overflow-hidden group">
          {isSolved && (
            <div className="absolute inset-0 bg-emerald-500/10 z-0 border-l-4 border-emerald-500" />
          )}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {potd.platform}
                </span>
                {(potd.rating || potd.externalDifficulty) && (
                  <span className="inline-flex items-center rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-bold">
                    {potd.rating || potd.externalDifficulty}
                  </span>
                )}
              </div>
              <h3 className={`font-semibold text-lg leading-tight ${isSolved ? 'text-emerald-400' : 'text-foreground group-hover:text-accent transition-colors'}`}>
                {potd.title}
              </h3>
            </div>
            
            <div className="shrink-0 flex items-center gap-3">
              {isSolved ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-medium text-sm border border-emerald-500/30">
                  <Trophy className="w-4 h-4" /> Solved
                </div>
              ) : solveUrl ? (
                <a
                  href={solveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow hover:bg-accent/90 transition-colors"
                >
                  Solve Now <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Explainability Text */}
        {potd.basis && (
          <p className="text-xs text-muted-foreground italic px-2">
            <span className="font-semibold not-italic">Why this problem?</span> {potd.basis} 
            {potd.targetRating ? ` (Target: ${potd.targetRating})` : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
