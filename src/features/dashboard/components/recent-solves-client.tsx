"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, History, Bookmark } from "lucide-react";
import { buildProblemUrl } from "@/lib/problem-url";
import { ProblemActions } from "@/features/problems/components/problem-actions";

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

type ProblemState = {
  stateId: string;
  status: "not_started" | "tried" | "solved";
  updatedAt: Date;
  problemId: string;
  title: string;
  source: string;
  rating: number | null;
  externalDifficulty: number | null;
  platform: "custom" | "codeforces" | "atcoder";
  externalContestId: number | null;
  externalProblemIndex: string | null;
  note?: string | null;
};

export function RecentSolvesClient({
  solved,
  attempted,
  bookmarked,
}: {
  solved: ProblemState[];
  attempted: ProblemState[];
  bookmarked: ProblemState[];
}) {
  const [activeTab, setActiveTab] = useState<"solved" | "attempted" | "bookmarked">("solved");
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab: "solved" | "attempted" | "bookmarked") => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const data = activeTab === "solved" ? solved : activeTab === "attempted" ? attempted : bookmarked;

  return (
    <Card className="bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest problem-solving progress.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeTab === "solved" ? "default" : "secondary"}
            onClick={() => handleTabChange("solved")}
            className="cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Solved
          </Button>
          <Button
            size="sm"
            variant={activeTab === "attempted" ? "default" : "secondary"}
            onClick={() => handleTabChange("attempted")}
            className="cursor-pointer"
          >
            <History className="w-4 h-4 mr-2" />
            Attempted
          </Button>
          <Button
            size="sm"
            variant={activeTab === "bookmarked" ? "default" : "secondary"}
            onClick={() => handleTabChange("bookmarked")}
            className="cursor-pointer"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Bookmarked
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-4 py-4 px-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-[40%]" />
                <Skeleton className="h-12 w-[20%]" />
                <Skeleton className="h-12 w-[20%]" />
                <Skeleton className="h-12 w-[20%]" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center border border-dashed border-border/50 rounded-xl bg-muted/10 mx-2 mb-2">
            {activeTab === "solved" ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">No solves yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Start tracking your progress by solving problems from the catalog.
                </p>
              </>
            ) : activeTab === "attempted" ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 mb-4">
                  <History className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">No recent attempts</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Problems you try but haven't solved yet will appear here.
                </p>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-4">
                  <Bookmark className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">No bookmarks</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Save interesting problems to review them later.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Problem</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((p) => {
                  const solveUrl = buildProblemUrl(
                    p.platform,
                    p.externalContestId,
                    p.externalProblemIndex,
                    p.source
                  );

                  return (
                    <TableRow key={p.stateId}>
                      <TableCell className="font-medium">
                        <div>{p.title}</div>
                        <div className="text-xs text-muted-foreground">{p.source}</div>
                      </TableCell>
                      <TableCell>
                        {p.rating ? (
                          <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-semibold">
                            {p.rating}
                          </span>
                        ) : p.externalDifficulty ? (
                          <span
                            className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-semibold"
                            title="AtCoder Difficulty"
                          >
                            {p.externalDifficulty} (AC)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm" title={new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" }).format(new Date(p.updatedAt))}>
                        {getRelativeTime(new Date(p.updatedAt))}
                      </TableCell>
                      <TableCell className="text-right">
                        <ProblemActions 
                          problemId={p.problemId} 
                          solveUrl={solveUrl} 
                          note={p.note ?? null} 
                        />
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
