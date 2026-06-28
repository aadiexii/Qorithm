"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { StickyNote, Loader2 } from "lucide-react";

import { updateOAProblemState } from "@/components/actions/oa-actions";

type OANoteButtonProps = {
  problemId: string;
  initialNote: string | null;
};

export function OANoteButton({ problemId, initialNote }: OANoteButtonProps) {
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
      await updateOAProblemState(problemId, { note });
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
        className={`focus-visible:ring-ring flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:outline-none ${
          hasNote
            ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-transparent"
        }`}
      >
        <StickyNote
          className={`h-4 w-4 ${hasNote ? "fill-indigo-400/20" : ""}`}
        />
      </button>

      {/* Auth Gate */}
      {showAuthGate && (
        <div className="border-border bg-card text-card-foreground absolute top-full left-0 z-50 mt-2 w-64 rounded-md border p-4 shadow-lg">
          <p className="mb-3 text-sm font-medium">Sign in to add notes</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                router.push(
                  `/sign-in?redirect_url=${encodeURIComponent(pathname)}`,
                )
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring flex-1 cursor-pointer rounded px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowAuthGate(false)}
              className="border-border focus-visible:ring-ring flex-1 cursor-pointer rounded border bg-transparent px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="border-border bg-card mx-4 w-full max-w-md rounded-xl border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-foreground mb-1 text-base font-semibold">
              OA Problem Note
            </h2>
            <p className="text-muted-foreground mb-4 text-xs">
              Private note for this problem. Markdown not rendered.
            </p>
            <textarea
              className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring min-h-[140px] w-full resize-y rounded-md border p-3 text-sm focus:ring-2 focus:outline-none"
              placeholder="Add your approach, ideas, or links here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border-border hover:bg-muted focus-visible:ring-ring cursor-pointer rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
