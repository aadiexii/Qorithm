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
import type { ProblemStateMap } from "@/features/tracking/actions";

export type ProblemRow = {
  id: string;
  title: string;
  source: string;
  rating: number | null;
  externalDifficulty?: number | null;
  platform?: "custom" | "codeforces" | "atcoder";
  externalContestId?: number | null;
  externalProblemIndex?: string | null;
  problemTopics: { topicId: string; topic: { name: string } }[];
};

type ProblemsTableProps = {
  problems: ProblemRow[];
  total: number;
  stateMap: ProblemStateMap;
};

function getSolveUrl(problem: ProblemRow): string | null {
  if (problem.platform === "codeforces" && problem.externalContestId && problem.externalProblemIndex) {
    return `https://codeforces.com/problemset/problem/${problem.externalContestId}/${problem.externalProblemIndex}`;
  }
  if (problem.platform === "atcoder" && problem.externalContestId && problem.externalProblemIndex) {
    // Decode AtCoder contest ID back to slug
    const id = problem.externalContestId;
    let prefix = "abc";
    let n = id - 100000;
    if (id >= 200000 && id < 300000) { prefix = "arc"; n = id - 200000; }
    else if (id >= 300000 && id < 400000) { prefix = "agc"; n = id - 300000; }
    const contestSlug = id < 900000 ? `${prefix}${String(n).padStart(3, "0")}` : null;
    if (contestSlug) {
      return `https://atcoder.jp/contests/${contestSlug}/tasks/${problem.externalProblemIndex}`;
    }
  }
  return null;
}

export function ProblemsTable({
  problems,
  total,
  stateMap,
}: ProblemsTableProps) {
  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle>
          Problems{" "}
          <span className="text-sm font-normal text-muted-foreground">({total} total)</span>
        </CardTitle>
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
                <TableHead>Topics</TableHead>
                <TableHead className="w-20">Solve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem) => {
                const state = stateMap[problem.id];
                const solveUrl = getSolveUrl(problem);

                return (
                  <TableRow key={problem.id}>
                    <TableCell>
                      <ProblemTrackingControls
                        problemId={problem.id}
                        status={state?.status ?? "not_started"}
                        bookmarked={state?.bookmarked ?? false}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{problem.title}</TableCell>
                    <TableCell>{problem.source}</TableCell>
                    <TableCell>{problem.rating ?? problem.externalDifficulty ?? "-"}</TableCell>
                    <TableCell>
                      {problem.problemTopics.map((pt) => pt.topic.name).join(", ")}
                    </TableCell>
                    <TableCell>
                      {solveUrl ? (
                        <a
                          href={solveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Solve ↗
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
