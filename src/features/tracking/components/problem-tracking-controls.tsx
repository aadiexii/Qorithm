"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";

import {
  setProblemStatusAction,
  toggleProblemBookmarkAction,
} from "@/features/tracking/actions";

type ProblemTrackingControlsProps = {
  problemId: string;
  status: "not_started" | "tried" | "solved";
  bookmarked: boolean;
};

const STATUS_OPTIONS = [
  { value: "not_started", label: "—" },
  { value: "tried", label: "Tried" },
  { value: "solved", label: "✓ Solved" },
] as const;

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
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isPending}
        className={`h-7 rounded border px-1.5 text-xs outline-none transition ${
          status === "solved"
            ? "border-green-500/40 bg-green-500/15 text-green-300"
            : status === "tried"
              ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
              : "border-border bg-background text-muted-foreground"
        }`}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleBookmarkToggle}
        disabled={isPending}
        title={bookmarked ? "Remove bookmark" : "Bookmark"}
        className={`text-lg leading-none transition ${
          bookmarked ? "text-amber-500" : "text-muted-foreground/40 hover:text-amber-400"
        }`}
      >
        {bookmarked ? "★" : "☆"}
      </button>

      {showAuthGate && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-md border border-border bg-card p-4 text-card-foreground shadow-lg">
          <p className="mb-3 text-sm font-medium">Sign in to track progress</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`)}
              className="flex-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowAuthGate(false)}
              className="flex-1 rounded border border-border bg-transparent px-3 py-1.5 text-xs font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
