"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, CheckCircle2, History } from "lucide-react";
import { buildProblemUrl } from "@/lib/problem-url";

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
};

export function RecentSolvesClient({
  solved,
  attempted,
}: {
  solved: ProblemState[];
  attempted: ProblemState[];
}) {
  const [activeTab, setActiveTab] = useState<"solved" | "attempted">("solved");
  const data = activeTab === "solved" ? solved : attempted;

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
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === "solved"
                ? "You haven't solved any problems yet."
                : "No recent attempts found."}
            </p>
            <Link href="/problems" className={buttonVariants({ variant: "default" })}>
              Explore Problems
            </Link>
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
                        {solveUrl ? (
                          <a
                            href={solveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
                          >
                            Solve <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">No link</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-center">
              <Link href="/problems" className="text-sm font-medium hover:underline text-accent">
                View full catalog →
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
