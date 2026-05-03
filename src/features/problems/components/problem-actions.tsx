"use client";

import { ExternalLink } from "lucide-react";
import { ProblemNoteButton } from "@/features/tracking/components/problem-note-dialog";

type ProblemActionsProps = {
  problemId: string;
  solveUrl: string | null;
  note: string | null;
};

export function ProblemActions({ problemId, solveUrl, note }: ProblemActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <ProblemNoteButton problemId={problemId} initialNote={note} />
      
      {solveUrl ? (
        <a
          href={solveUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Solve <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-xs text-muted-foreground px-2">No link</span>
      )}
    </div>
  );
}
