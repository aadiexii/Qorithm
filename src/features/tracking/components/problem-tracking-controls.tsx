"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Check, Minus } from "lucide-react";

import {
  setProblemStatusAction,
  toggleProblemBookmarkAction,
} from "@/features/tracking/actions";

type ProblemTrackingControlsProps = {
  problemId: string;
  status: "not_started" | "tried" | "solved";
  bookmarked: boolean;
};

export function ProblemTrackingControls({
  problemId,
  status,
  bookmarked,
}: ProblemTrackingControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [showAuthGate, setShowAuthGate] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function requireAuth() {
    if (!isSignedIn) {
      setShowAuthGate(true);
      return false;
    }
    return true;
  }

  function handleStatusChange(newStatus: string) {
    if (newStatus === status) return;
    if (!requireAuth()) return;
    startTransition(() => {
      void setProblemStatusAction(problemId, newStatus);
    });
  }

  function handleBookmarkToggle() {
    if (!requireAuth()) return;
    startTransition(() => {
      void toggleProblemBookmarkAction(problemId);
    });
  }

  return (
    <div className="relative flex items-center gap-2">
      <div className="flex h-8 items-center rounded-md border border-border bg-background p-0.5 shadow-sm">
        <button
          type="button"
          onClick={() => handleStatusChange("not_started")}
          disabled={isPending}
          title="Not Started"
          aria-label="Mark as Not Started"
          className={`flex h-full items-center justify-center rounded-sm px-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            status === "not_started"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          } ${isPending ? "opacity-50" : ""}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("tried")}
          disabled={isPending}
          title="Tried"
          aria-label="Mark as Tried"
          className={`flex h-full items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            status === "tried"
              ? "bg-amber-500/20 text-amber-500 shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          } ${isPending ? "opacity-50" : ""}`}
        >
          Tried
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("solved")}
          disabled={isPending}
          title="Solved"
          aria-label="Mark as Solved"
          className={`flex h-full items-center justify-center gap-1.5 rounded-sm px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            status === "solved"
              ? "bg-green-500/20 text-green-500 shadow-sm"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          } ${isPending ? "opacity-50" : ""}`}
        >
          <Check className="h-3.5 w-3.5" /> Solved
        </button>
      </div>

      <button
        type="button"
        onClick={handleBookmarkToggle}
        disabled={isPending}
        title={bookmarked ? "Remove bookmark" : "Bookmark"}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
        className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          bookmarked
            ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
            : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        } ${isPending ? "opacity-50" : ""}`}
      >
        <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-amber-500" : ""}`} />
      </button>

      {showAuthGate && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-md border border-border bg-card p-4 text-card-foreground shadow-lg">
          <p className="mb-3 text-sm font-medium">Sign in to track progress</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`)}
              className="flex-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowAuthGate(false)}
              className="flex-1 rounded border border-border bg-transparent px-3 py-1.5 text-xs font-medium hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
