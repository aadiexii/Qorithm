"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Calendar, Globe } from "lucide-react";
import type { LeaderboardEntry } from "../actions";

export function LeaderboardClient({
  weekly,
  allTime,
  currentUserId,
}: {
  weekly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
  currentUserId: string;
}) {
  const [activeTab, setActiveTab] = useState<"weekly" | "all-time">("weekly");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: "weekly" | "all-time") => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const data = activeTab === "weekly" ? weekly : allTime;

  return (
    <Card className="bg-card/80">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
        <div>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" /> Leaderboard
          </CardTitle>
          <CardDescription className="mt-1">
            Global ranking based on difficulty-weighted problem solving.
          </CardDescription>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-lg">
          <Button
            size="sm"
            variant={activeTab === "weekly" ? "default" : "ghost"}
            onClick={() => handleTabChange("weekly")}
            className="cursor-pointer font-medium"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Weekly
          </Button>
          <Button
            size="sm"
            variant={activeTab === "all-time" ? "default" : "ghost"}
            onClick={() => handleTabChange("all-time")}
            className="cursor-pointer font-medium"
          >
            <Globe className="w-4 h-4 mr-2" />
            All-Time
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isPending ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-[10%]" />
                <Skeleton className="h-12 w-[50%]" />
                <Skeleton className="h-12 w-[20%]" />
                <Skeleton className="h-12 w-[20%]" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500 mb-4">
              <Trophy className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-xl text-foreground">No leaderboard activity yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Be the first to solve problems {activeTab === "weekly" ? "this week" : ""} and claim the #1 spot!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-20 text-center font-semibold">Rank</TableHead>
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="text-right font-semibold">Solved</TableHead>
                  <TableHead className="text-right font-semibold">Streak</TableHead>
                  <TableHead className="text-right font-semibold">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((entry) => {
                  const isCurrentUser = entry.userId === currentUserId;
                  
                  return (
                    <TableRow 
                      key={entry.userId}
                      className={isCurrentUser ? "bg-accent/5 hover:bg-accent/10 transition-colors" : ""}
                    >
                      <TableCell className="text-center">
                        <div className={`font-bold text-lg inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          entry.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                          entry.rank === 2 ? "bg-slate-300/20 text-slate-300" :
                          entry.rank === 3 ? "bg-amber-600/20 text-amber-600" :
                          "text-muted-foreground"
                        }`}>
                          {entry.rank}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-white/10 shadow-sm">
                            <AvatarImage src={entry.image || ""} />
                            <AvatarFallback className="bg-muted font-medium">{entry.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className={`font-semibold text-base ${isCurrentUser ? "text-accent" : "text-foreground"}`}>
                              {entry.name}
                              {isCurrentUser && <span className="ml-2 inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/20">You</span>}
                            </span>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                              {entry.codeforcesHandle && (
                                <span className="inline-flex items-center gap-1" title="Codeforces">
                                  CF: <span className="font-medium text-slate-300">{entry.codeforcesHandle}</span>
                                </span>
                              )}
                              {entry.codeforcesHandle && entry.atcoderHandle && <span>•</span>}
                              {entry.atcoderHandle && (
                                <span className="inline-flex items-center gap-1" title="AtCoder">
                                  AC: <span className="font-medium text-slate-300">{entry.atcoderHandle}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-300">
                        {entry.solvedCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.streak > 0 ? (
                          <div className="inline-flex items-center justify-end w-full text-orange-400 font-medium">
                            <TrendingUp className="h-4 w-4 mr-1.5" />
                            {entry.streak}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold font-mono text-lg text-emerald-400">
                          {entry.score.toLocaleString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
