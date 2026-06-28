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
      <div className="border-border/50 bg-card/50 mb-6 flex w-full items-center justify-between rounded-lg border px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="bg-accent/20 text-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            <CalendarClock className="h-4 w-4" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Sign in to get your personalized Daily Challenge.
          </p>
        </div>
        <Link
          href="/sign-in"
          className="text-accent flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline"
        >
          Sign In <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  // Signed in but no POTD generated yet or problem not loaded
  if (!potdTitle) {
    return (
      <div className="border-border/50 bg-card/50 mb-6 flex w-full items-center justify-between rounded-lg border px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="bg-accent/20 text-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
            <CalendarClock className="h-4 w-4" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Your Daily Challenge is waiting.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-accent flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline"
        >
          View Dashboard <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  // Signed in with POTD
  return (
    <div
      className={`mb-6 flex flex-col justify-between gap-3 rounded-lg border px-4 py-3 shadow-sm backdrop-blur sm:flex-row sm:items-center ${isSolved ? "border-emerald-500/20 bg-emerald-500/5" : "border-border/50 bg-card/50"}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isSolved ? "bg-emerald-500/20 text-emerald-400" : "bg-accent/20 text-accent"}`}
        >
          <CalendarClock className="h-4 w-4" />
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <p className="text-foreground text-sm font-medium">
            Today&apos;s Challenge:{" "}
            <span className="font-semibold">{potdTitle}</span>
          </p>
          {isSolved && (
            <span className="inline-block w-fit rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
              Solved
            </span>
          )}
        </div>
      </div>
      <Link
        href="/dashboard"
        className={`flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline ${isSolved ? "text-emerald-400" : "text-accent"}`}
      >
        {isSolved ? "View Dashboard" : "Solve Now"}{" "}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
