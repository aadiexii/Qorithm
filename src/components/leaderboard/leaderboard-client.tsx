"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/molecules/card";
import { Button } from "@/components/molecules/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/molecules/table";
import { Skeleton } from "@/components/molecules/skeleton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/molecules/avatar";
import { Trophy, Calendar, Globe } from "lucide-react";
import type { LeaderboardEntry } from "@/components/actions";

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
      <CardHeader className="border-border/50 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-yellow-500" /> Leaderboard
          </CardTitle>
          <CardDescription className="mt-1">
            Global ranking based on difficulty-weighted problem solving.
          </CardDescription>
        </div>
        <div className="bg-muted/50 flex rounded-lg p-1">
          <Button
            size="sm"
            variant={activeTab === "weekly" ? "default" : "ghost"}
            onClick={() => handleTabChange("weekly")}
            className="cursor-pointer font-medium"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Weekly
          </Button>
          <Button
            size="sm"
            variant={activeTab === "all-time" ? "default" : "ghost"}
            onClick={() => handleTabChange("all-time")}
            className="cursor-pointer font-medium"
          >
            <Globe className="mr-2 h-4 w-4" />
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
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
              <Trophy className="h-8 w-8" />
            </div>
            <h3 className="text-foreground text-xl font-semibold">
              No leaderboard activity yet
            </h3>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm">
              Be the first to solve problems{" "}
              {activeTab === "weekly" ? "this week" : ""} and claim the #1 spot!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-20 text-center font-semibold">
                    Rank
                  </TableHead>
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="text-right font-semibold">
                    Solved
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    Score
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((entry) => {
                  const isCurrentUser = entry.userId === currentUserId;

                  return (
                    <TableRow
                      key={entry.userId}
                      className={
                        isCurrentUser
                          ? "bg-accent/5 hover:bg-accent/10 transition-colors"
                          : ""
                      }
                    >
                      <TableCell className="text-center">
                        <div
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold ${
                            entry.rank === 1
                              ? "bg-yellow-500/20 text-yellow-500"
                              : entry.rank === 2
                                ? "bg-slate-300/20 text-slate-300"
                                : entry.rank === 3
                                  ? "bg-amber-600/20 text-amber-600"
                                  : "text-muted-foreground"
                          }`}
                        >
                          {entry.rank}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-white/10 shadow-sm">
                            <AvatarImage src={entry.image || ""} />
                            <AvatarFallback className="bg-muted font-medium">
                              {entry.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span
                              className={`text-base font-semibold ${isCurrentUser ? "text-accent" : "text-foreground"}`}
                            >
                              {entry.name}
                              {isCurrentUser && (
                                <span className="bg-accent/20 text-accent border-accent/20 ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                  You
                                </span>
                              )}
                            </span>
                            <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                              {entry.codeforcesHandle && (
                                <span
                                  className="inline-flex items-center gap-1"
                                  title="Codeforces"
                                >
                                  CF:{" "}
                                  <span className="font-medium text-slate-300">
                                    {entry.codeforcesHandle}
                                  </span>
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
                        <div className="font-mono text-lg font-bold text-emerald-400">
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
