"use client";

import { ExternalLink } from "lucide-react";
import { ProblemNoteButton } from "@/components/tracking/problem-note-dialog";

type ProblemActionsProps = {
  problemId: string;
  solveUrl: string | null;
  note: string | null;
};

export function ProblemActions({
  problemId,
  solveUrl,
  note,
}: ProblemActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <ProblemNoteButton problemId={problemId} initialNote={note} />

      {solveUrl ? (
        <a
          href={solveUrl}
          target="_blank"
          rel="noreferrer"
          className="focus-visible:ring-ring inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15 focus-visible:ring-2 focus-visible:outline-none"
        >
          Solve <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-muted-foreground px-2 text-xs">No link</span>
      )}
    </div>
  );
}
