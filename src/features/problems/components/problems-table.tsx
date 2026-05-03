"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProblemTrackingControls } from "@/features/tracking/components/problem-tracking-controls";
import { ProblemActions } from "./problem-actions";
import type { ProblemStateMap } from "@/features/tracking/actions";
import { buildProblemUrl } from "@/lib/problem-url";

export type ProblemRow = {
  id: string;
  title: string;
  source: string;
  rating: number | null;
  externalDifficulty?: number | null;
  platform?: "custom" | "codeforces" | "atcoder";
  externalContestId?: number | null;
  externalProblemIndex?: string | null;
};

type ProblemsTableProps = {
  problems: ProblemRow[];
  total: number;
  stateMap: ProblemStateMap;
};

export function ProblemsTable({
  problems,
  total,
  stateMap,
}: ProblemsTableProps) {
  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="text-lg">All problems ({total})</CardTitle>
      </CardHeader>
      <CardContent>
        {problems.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No problems found matching your active filters. Try adjusting them or reset to see all.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36">Status</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem) => {
                const state = stateMap[problem.id];
                const solveUrl = buildProblemUrl(
                  problem.platform,
                  problem.externalContestId,
                  problem.externalProblemIndex,
                  problem.source
                );

                return (
                  <TableRow key={problem.id}>
                    <TableCell>
                      <ProblemTrackingControls
                        problemId={problem.id}
                        status={state?.status ?? "not_started"}
                        bookmarked={state?.bookmarked ?? false}
                        note={state?.note ?? null}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {problem.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {problem.source}
                    </TableCell>
                    <TableCell>
                      {problem.rating ? (
                        <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-semibold">
                          {problem.rating}
                        </span>
                      ) : problem.externalDifficulty ? (
                        <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-semibold" title="AtCoder Difficulty">
                          {problem.externalDifficulty} (AC)
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ProblemActions 
                        problemId={problem.id} 
                        solveUrl={solveUrl} 
                        note={state?.note ?? null} 
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
