"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { CalendarClock, ArrowRight } from "lucide-react";

type POTDBannerProps = {
  potdTitle?: string;
  isSolved?: boolean;
};

export function PotdBanner({ potdTitle, isSolved }: POTDBannerProps) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="mb-6 flex w-full items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
            <CalendarClock className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Sign in to get your personalized Daily Challenge.
          </p>
        </div>
        <Link
          href="/sign-in"
          className="shrink-0 text-sm font-semibold text-accent hover:underline flex items-center gap-1"
        >
          Sign In <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  // Signed in but no POTD generated yet or problem not loaded
  if (!potdTitle) {
    return (
      <div className="mb-6 flex w-full items-center justify-between rounded-lg border border-border/50 bg-card/50 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
            <CalendarClock className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Your Daily Challenge is waiting.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="shrink-0 text-sm font-semibold text-accent hover:underline flex items-center gap-1"
        >
          View Dashboard <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  // Signed in with POTD
  return (
    <div className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border px-4 py-3 shadow-sm backdrop-blur ${isSolved ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/50 bg-card/50'}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isSolved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-accent/20 text-accent'}`}>
          <CalendarClock className="h-4 w-4" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <p className="text-sm font-medium text-foreground">
            Today&apos;s Challenge: <span className="font-semibold">{potdTitle}</span>
          </p>
          {isSolved && (
             <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block w-fit">
               Solved
             </span>
          )}
        </div>
      </div>
      <Link
        href="/dashboard"
        className={`shrink-0 text-sm font-semibold hover:underline flex items-center gap-1 ${isSolved ? 'text-emerald-400' : 'text-accent'}`}
      >
        {isSolved ? "View Dashboard" : "Solve Now"} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
