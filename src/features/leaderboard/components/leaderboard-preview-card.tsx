"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { LeaderboardEntry } from "../actions";

export function LeaderboardPreviewCard({ 
  data, 
  currentUserId,
  className = ""
}: { 
  data: LeaderboardEntry[];
  currentUserId: string;
  className?: string;
}) {
  // Show top 5 in preview to save space
  const displayData = data.slice(0, 5);
  
  // Find current user if they are not in the top 5
  const currentUserEntry = data.find(r => r.userId === currentUserId);
  const showCurrentUserSeparately = currentUserEntry && currentUserEntry.rank > 5;

  return (
    <Card className={`border-border/60 bg-card/80 backdrop-blur-md flex flex-col ${className}`}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" /> Leaderboard
          </CardTitle>
          <CardDescription>Top performers all-time</CardDescription>
        </div>
        <Link href="/leaderboard" className="text-xs font-medium text-accent hover:underline">
          View All →
        </Link>
      </CardHeader>
      <CardContent className="flex-1">
        {displayData.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border/50 rounded-lg bg-muted/10">
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
                <div className="flex items-center justify-center my-1">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-0.5" />
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-0.5" />
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30 mx-0.5" />
                </div>
                <LeaderboardRow 
                  entry={currentUserEntry} 
                  isCurrentUser={true} 
                />
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LeaderboardRow({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser: boolean }) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
      isCurrentUser ? "bg-accent/10 border border-accent/20" : "hover:bg-white/5 border border-transparent"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-6 font-bold text-sm ${
          entry.rank === 1 ? "text-yellow-500" :
          entry.rank === 2 ? "text-slate-300" :
          entry.rank === 3 ? "text-amber-600" :
          "text-muted-foreground"
        }`}>
          #{entry.rank}
        </div>
        <Avatar className="h-8 w-8 border border-white/10">
          <AvatarImage src={entry.image || ""} />
          <AvatarFallback className="bg-muted text-xs">{entry.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className={`text-sm font-semibold truncate max-w-[100px] sm:max-w-[140px] ${isCurrentUser ? "text-accent" : "text-foreground"}`}>
            {entry.name}
            {isCurrentUser && <span className="ml-1.5 text-[10px] font-normal uppercase tracking-wider text-accent">You</span>}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {entry.solvedCount} solved
            {entry.streak > 2 && (
              <span className="text-orange-400 flex items-center text-[10px] ml-1" title={`${entry.streak} day streak`}>
                <TrendingUp className="h-3 w-3 mr-0.5" /> {entry.streak}
              </span>
            )}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold font-mono text-emerald-400">
          {entry.score.toLocaleString()}
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</div>
      </div>
    </div>
  );
}
