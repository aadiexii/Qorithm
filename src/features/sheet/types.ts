// ---------------------------------------------------------------------------
// Types for the Sheet feature
// ---------------------------------------------------------------------------

export type SheetSectionStatus = "Completed" | "In Progress" | "Start now";

export type SheetSectionProgress = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  totalProblems: number;
  solvedProblems: number;
  triedProblems: number;
  progressPercentage: number;
  statusLabel: SheetSectionStatus;
};

export type SheetSectionProblemRow = {
  problemId: string;
  title: string;
  source: string;
  rating: number | null;
  platform: "custom" | "codeforces" | "atcoder";
  externalContestId: number | null;
  externalProblemIndex: string | null;
  orderIndex: number;
  status: "not_started" | "tried" | "solved";
  bookmarked: boolean;
};

export type SheetSectionDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
  problems: SheetSectionProblemRow[];
};
