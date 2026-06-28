"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/molecules/card";
import { ExternalLink, CalendarClock, Trophy, Zap } from "lucide-react";
import { buildProblemUrl } from "@/utils/problem-url";

type POTD = {
  id: string;
  status: string;
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

export function PotdCard({
  potd,
  isDailyEligible,
}: {
  potd: POTD | null;
  isDailyEligible: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setUTCHours(23, 59, 59, 999);

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
      <Card className="border-border/60 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center gap-2 text-base font-bold">
            <CalendarClock className="text-accent h-4.5 w-4.5" /> Daily
            Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-muted-foreground mb-4 text-sm">
            {isDailyEligible
              ? "No suitable problems found matching your rating today. Keep solving!"
              : "Connect your Codeforces account to unlock personalized daily challenges tailored to your current level."}
          </p>
          {!isDailyEligible && (
            <Link
              href="/settings"
              className="bg-accent text-accent-foreground hover:bg-accent/90 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shadow transition-colors"
            >
              <Zap className="h-3.5 w-3.5" /> Connect Codeforces
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  const solveUrl = buildProblemUrl(
    potd.platform,
    potd.externalContestId,
    potd.externalProblemIndex,
    potd.source,
  );
  const isSolved = potd.status === "completed";

  return (
    <Card className="border-border/60 from-card/85 to-card/45 relative overflow-hidden bg-gradient-to-br">
      <div
        className={`pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full opacity-15 blur-3xl ${
          isSolved ? "bg-emerald-500" : "bg-accent"
        }`}
      />

      <CardHeader className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <CardTitle className="text-foreground flex items-center gap-1.5 text-base font-bold">
              <CalendarClock className="text-accent h-4.5 w-4.5" /> Daily
              Challenge
            </CardTitle>
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              Resets in{" "}
              <span className="text-foreground font-mono font-medium">
                {timeLeft}
              </span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pt-0 pb-5">
        <div className="border-border/40 bg-background/40 group relative overflow-hidden rounded-lg border p-4">
          {isSolved && (
            <div className="absolute inset-0 z-0 border-l-2 border-emerald-500 bg-emerald-500/5" />
          )}
          <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                  {potd.platform}
                </span>
                {(potd.rating || potd.externalDifficulty) && (
                  <span className="text-muted-foreground/80 text-[10px] font-bold">
                    Rating: {potd.rating || potd.externalDifficulty}
                  </span>
                )}
              </div>
              <h3
                className={`text-base leading-tight font-bold ${
                  isSolved
                    ? "text-emerald-400"
                    : "text-foreground group-hover:text-accent transition-colors"
                }`}
              >
                {potd.title}
              </h3>
            </div>

            <div className="shrink-0">
              {isSolved ? (
                <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  <Trophy className="h-3.5 w-3.5" /> Solved
                </div>
              ) : solveUrl ? (
                <a
                  href={solveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shadow transition-colors"
                >
                  Solve Now <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {potd.basis && (
          <p className="text-muted-foreground/80 mt-2.5 px-1 text-[11px] italic">
            <span className="font-semibold not-italic">Recommendation:</span>{" "}
            {potd.basis}
            {potd.targetRating ? ` (Target: ${potd.targetRating})` : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
