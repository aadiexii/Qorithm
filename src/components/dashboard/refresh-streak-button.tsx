"use client";

import { useState, useTransition } from "react";
import { Flame, RefreshCw } from "lucide-react";
import { verifyDailyChallengeAction } from "@/components/actions/potd-actions";

export function RefreshStreakButton({
  initialStreak,
}: {
  initialStreak: number;
}) {
  const [streak, setStreak] = useState(initialStreak);
  const [isPending, startTransition] = useTransition();
  const [justChecked, setJustChecked] = useState(false);

  const handleRefresh = () => {
    startTransition(async () => {
      const result = await verifyDailyChallengeAction();
      setStreak(result.streak);
      setJustChecked(true);
      setTimeout(() => setJustChecked(false), 3000);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
        <Flame className="h-3 w-3 text-accent" />
        {streak} day streak
      </div>
      <button
        onClick={handleRefresh}
        disabled={isPending}
        className="text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
        title="Verify streak with Codeforces"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`}
        />
      </button>
      {justChecked && (
        <span className="text-[10px] text-accent font-semibold animate-pulse">
          Verified!
        </span>
      )}
    </div>
  );
}
