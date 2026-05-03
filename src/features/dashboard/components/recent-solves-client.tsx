"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, History, Bookmark } from "lucide-react";
import { buildProblemUrl } from "@/lib/problem-url";
import { ProblemActions } from "@/features/problems/components/problem-actions";

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
            onClick={() => setActiveTab("solved")}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Solved
          </Button>
          <Button
            size="sm"
            variant={activeTab === "attempted" ? "default" : "secondary"}
            onClick={() => setActiveTab("attempted")}
          >
            <History className="w-4 h-4 mr-2" />
            Attempted
          </Button>
          <Button
            size="sm"
            variant={activeTab === "bookmarked" ? "default" : "secondary"}
            onClick={() => setActiveTab("bookmarked")}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Bookmarked
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === "solved"
                ? "You haven't solved any problems yet."
                : activeTab === "attempted"
                ? "No recent attempts found."
                : "No bookmarked problems found."}
            </p>
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
                      <TableCell className="text-muted-foreground text-sm">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(p.updatedAt))}
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
