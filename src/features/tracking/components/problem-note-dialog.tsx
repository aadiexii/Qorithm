"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { StickyNote, Loader2 } from "lucide-react";

import { upsertProblemNoteAction } from "@/features/tracking/actions";

type ProblemNoteDialogProps = {
  problemId: string;
  initialNote: string | null;
};

export function ProblemNoteButton({
  problemId,
  initialNote,
}: ProblemNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(initialNote ?? "");
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const hasNote = !!initialNote?.trim();

  function handleOpen() {
    if (!isSignedIn) {
      setShowAuthGate(true);
      return;
    }
    setOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      await upsertProblemNoteAction(problemId, note);
      setOpen(false);
    });
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleOpen}
        title={hasNote ? "View/edit note" : "Add note"}
        aria-label={hasNote ? "View/edit note" : "Add note"}
        className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          hasNote
            ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
            : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        }`}
      >
        <StickyNote className={`h-4 w-4 ${hasNote ? "fill-indigo-400/20" : ""}`} />
      </button>

      {/* Auth Gate */}
      {showAuthGate && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-md border border-border bg-card p-4 text-card-foreground shadow-lg">
          <p className="mb-3 text-sm font-medium">Sign in to add notes</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`)}
              className="flex-1 cursor-pointer rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowAuthGate(false)}
              className="flex-1 cursor-pointer rounded border border-border bg-transparent px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 text-base font-semibold text-foreground">Problem Note</h2>
            <p className="mb-4 text-xs text-muted-foreground">Private note for this problem. Markdown not rendered.</p>
            <textarea
              className="w-full min-h-[140px] rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Add your approach, ideas, or links here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
