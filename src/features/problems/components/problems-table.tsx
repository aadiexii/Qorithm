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
  problemTopics: { topicId: string; topic: { name: string } }[];
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
        <CardTitle>
          Problems{" "}
          <span className="text-sm font-normal text-muted-foreground">({total} total)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {problems.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No problems found. Try adjusting your filters or add a new one.
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem) => {
                const state = stateMap[problem.id];

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
                    <TableCell>{problem.rating ?? "N/A"}</TableCell>
                    <TableCell>
                      {problem.problemTopics.map((pt) => pt.topic.name).join(", ")}
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
