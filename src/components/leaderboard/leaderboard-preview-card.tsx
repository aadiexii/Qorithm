"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/molecules/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/molecules/avatar";
import { Trophy } from "lucide-react";
import Link from "next/link";
import type { LeaderboardEntry } from "@/components/actions";

export function LeaderboardPreviewCard({
  data,
  currentUserId,
  className = "",
}: {
  data: LeaderboardEntry[];
  currentUserId: string;
  className?: string;
}) {
  // Show top 5 in preview to save space
  const displayData = data.slice(0, 5);

  // Find current user if they are not in the top 5
  const currentUserEntry = data.find((r) => r.userId === currentUserId);
  const showCurrentUserSeparately =
    currentUserEntry && currentUserEntry.rank > 5;

  return (
    <Card
      className={`border-border/60 bg-card/80 flex flex-col backdrop-blur-md ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" /> Leaderboard
          </CardTitle>
          <CardDescription>Top performers all-time</CardDescription>
        </div>
        <Link
          href="/leaderboard"
          className="text-accent text-xs font-medium hover:underline"
        >
          View All →
        </Link>
      </CardHeader>
      <CardContent className="flex-1">
        {displayData.length === 0 ? (
          <div className="text-muted-foreground border-border/50 bg-muted/10 rounded-lg border border-dashed py-8 text-center text-sm">
            No activity yet. Start solving to claim the #1 spot!
          </div>
        ) : (
          <div className="space-y-3">
            {displayData.map((entry) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                isCurrentUser={entry.userId === currentUserId}
              />
            ))}

            {showCurrentUserSeparately && currentUserEntry && (
              <>
                <div className="my-1 flex items-center justify-center">
                  <div className="bg-muted-foreground/30 mx-0.5 h-1 w-1 rounded-full" />
                  <div className="bg-muted-foreground/30 mx-0.5 h-1 w-1 rounded-full" />
                  <div className="bg-muted-foreground/30 mx-0.5 h-1 w-1 rounded-full" />
                </div>
                <LeaderboardRow entry={currentUserEntry} isCurrentUser={true} />
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg p-2 transition-colors ${
        isCurrentUser
          ? "bg-accent/10 border-accent/20 border"
          : "border border-transparent hover:bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex w-6 items-center justify-center text-sm font-bold ${
            entry.rank === 1
              ? "text-yellow-500"
              : entry.rank === 2
                ? "text-slate-300"
                : entry.rank === 3
                  ? "text-amber-600"
                  : "text-muted-foreground"
          }`}
        >
          #{entry.rank}
        </div>
        <Avatar className="h-8 w-8 border border-white/10">
          <AvatarImage src={entry.image || ""} />
          <AvatarFallback className="bg-muted text-xs">
            {entry.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span
            className={`max-w-[100px] truncate text-sm font-semibold sm:max-w-[140px] ${isCurrentUser ? "text-accent" : "text-foreground"}`}
          >
            {entry.name}
            {isCurrentUser && (
              <span className="text-accent ml-1.5 text-[10px] font-normal tracking-wider uppercase">
                You
              </span>
            )}
          </span>
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            {entry.solvedCount} solved
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm font-bold text-emerald-400">
          {entry.score.toLocaleString()}
        </div>
        <div className="text-muted-foreground text-[10px] tracking-wider uppercase">
          Score
        </div>
      </div>
    </div>
  );
}
