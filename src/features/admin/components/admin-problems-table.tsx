"use client";

import { useState, useTransition } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { adminDeleteProblemAction, togglePublishAction } from "@/features/admin/actions";

type ProblemRow = {
  id: string;
  title: string;
  source: string;
  rating: number | null;
  platform: "custom" | "codeforces" | "atcoder";
  externalContestId: number | null;
  externalProblemIndex: string | null;
  externalDifficulty?: number | null;
  isPublished: boolean;
  problemTopics: { topicId: string; topic: { name: string } }[];
};

export function AdminProblemsTable({ problems }: { problems: ProblemRow[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    startTransition(() => {
      void adminDeleteProblemAction(id).finally(() => setDeletingId(null));
    });
  }

  function handleTogglePublish(id: string, currentlyPublished: boolean) {
    startTransition(() => {
      void togglePublishAction(id, !currentlyPublished);
    });
  }

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle>
          All Problems{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({problems.length} total)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {problems.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No problems yet. Create one using the form above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {p.title}
                        {p.isPublished && (
                          <div className="flex gap-1">
                            {!p.rating && !p.externalDifficulty && (
                              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-500" title="Missing Rating">No Rating</span>
                            )}
                            {p.problemTopics.length === 0 && (
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-500" title="Missing Topics">No Topics</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{p.source}</div>
                      {p.platform !== "custom" && p.externalContestId && (
                        <div className="text-xs text-muted-foreground">
                          {p.platform}:{p.externalContestId}/{p.externalProblemIndex}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.platform === "codeforces"
                          ? "bg-accent/15 text-accent"
                          : p.platform === "atcoder"
                            ? "bg-purple-500/15 text-purple-300"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {p.platform}
                      </span>
                    </TableCell>
                    <TableCell>{p.rating ?? "—"}</TableCell>
                    <TableCell className="text-sm">
                      {p.problemTopics.map((pt) => pt.topic.name).join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(p.id, p.isPublished)}
                        disabled={isPending}
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium transition ${
                          p.isPublished
                            ? "bg-green-500/15 text-green-300 hover:bg-green-500/25"
                            : "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                        }`}
                      >
                        {p.isPublished ? "Published" : "Draft"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending && deletingId === p.id}
                        onClick={() => handleDelete(p.id, p.title)}
                      >
                        {deletingId === p.id ? "…" : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
