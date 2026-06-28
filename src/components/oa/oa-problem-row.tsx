"use client";

import { useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, Star } from "lucide-react";

import { updateOAProblemState } from "@/components/actions/oa-actions";
import { OANoteButton } from "./oa-note-button";

type OAProblemRowProps = {
  problemId: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  platform: "leetcode" | "gfg" | "codeforces";
  url: string;
  isSolved: boolean;
  bookmarked: boolean;
  note: string | null;
  isRequired: boolean;
};

export function OAProblemRow({
  problemId,
  title,
  difficulty,
  platform,
  url,
  isSolved,
  bookmarked,
  note,
  isRequired,
}: OAProblemRowProps) {
  const [isPending, startTransition] = useTransition();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function handleSolveToggle() {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
      return;
    }

    startTransition(async () => {
      await updateOAProblemState(problemId, {
        status: isSolved ? "not_started" : "solved",
      });
      router.refresh();
    });
  }

  function handleBookmarkToggle() {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
      return;
    }

    startTransition(async () => {
      await updateOAProblemState(problemId, {
        bookmarked: !bookmarked,
      });
      router.refresh();
    });
  }

  function getDifficultyColors(diff: string) {
    const d = diff.toLowerCase();
    if (d.includes("easy")) return "text-slate-400 font-medium";
    if (d.includes("hard")) return "text-white font-bold";
    return "text-slate-200 font-semibold";
  }

  function getPlatformLabel(p: string) {
    if (p === "leetcode") return "LeetCode";
    if (p === "gfg") return "GeeksforGeeks";
    if (p === "codeforces") return "Codeforces";
    return p;
  }

  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
      {/* Solve Checkbox */}
      <td className="w-12 px-4 py-3.5 text-center">
        <button
          type="button"
          onClick={handleSolveToggle}
          disabled={isPending}
          className={`mx-auto flex h-5 w-5 cursor-pointer items-center justify-center rounded border transition-colors ${
            isSolved
              ? "border-white bg-white text-black"
              : "border-white/20 bg-transparent text-transparent hover:border-white/40"
          } focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none disabled:opacity-60`}
        >
          {isSolved && (
            <svg
              className="h-3 w-3 stroke-[3]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
      </td>

      {/* Problem Title & Required indicator */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent focus-visible:text-accent inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline focus-visible:outline-none"
          >
            {title}
            <ExternalLink className="h-3 w-3 shrink-0 text-neutral-500" />
          </a>
          {isRequired && (
            <span className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-slate-200 uppercase">
              Required
            </span>
          )}
        </div>
      </td>

      {/* Difficulty */}
      <td className="px-4 py-3.5 text-sm font-medium">
        <span className={getDifficultyColors(difficulty)}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </span>
      </td>

      {/* Platform */}
      <td className="px-4 py-3.5 text-sm font-medium text-neutral-400">
        {getPlatformLabel(platform)}
      </td>

      {/* Actions */}
      <td className="w-32 px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-2.5">
          {/* Note Button */}
          <OANoteButton problemId={problemId} initialNote={note} />

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            disabled={isPending}
            className={`focus-visible:ring-ring flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:outline-none ${
              bookmarked
                ? "border-accent/20 bg-accent/10 text-accent hover:bg-accent/20"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-transparent"
            }`}
            title={bookmarked ? "Remove bookmark" : "Bookmark problem"}
          >
            <Star className={`h-4 w-4 ${bookmarked ? "fill-accent" : ""}`} />
          </button>
        </div>
      </td>
    </tr>
  );
}
