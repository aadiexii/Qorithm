"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { toggleSolvedAction } from "@/components/actions/tracking-actions";

type ProblemTrackingControlsProps = {
  problemId: string;
  isSolved: boolean;
};

export function ProblemTrackingControls({
  problemId,
  isSolved,
}: ProblemTrackingControlsProps) {
  const [optimisticSolved, setOptimisticSolved] = useState(isSolved);
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

  function handleToggle() {
    if (!requireAuth()) return;
    setOptimisticSolved(!optimisticSolved);
    startTransition(async () => {
      await toggleSolvedAction(problemId);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`focus-visible:ring-ring inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed ${
          optimisticSolved
            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
            : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        } ${isPending ? "opacity-50" : ""}`}
      >
        <Check
          className={`h-3.5 w-3.5 ${optimisticSolved ? "" : "opacity-30"}`}
        />
        {optimisticSolved ? "Solved" : "Mark Solved"}
      </button>

      {showAuthGate && (
        <div className="border-border bg-card text-card-foreground absolute top-full left-0 z-50 mt-2 w-64 rounded-md border p-4 shadow-lg">
          <p className="mb-3 text-sm font-medium">Sign in to track progress</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                router.push(
                  `/sign-in?redirect_url=${encodeURIComponent(pathname)}`,
                )
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowAuthGate(false)}
              className="border-border focus-visible:ring-ring flex-1 rounded border bg-transparent px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
