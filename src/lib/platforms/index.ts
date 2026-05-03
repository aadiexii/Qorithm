export type PlatformSolvedRecord = {
  problemIdStr: string; // The ID from the platform (e.g. "1A", "abc123_a")
  contestId: number | string | null;
  timestamp: number; // Unix timestamp
};

export interface PlatformAdapter {
  platformId: "codeforces" | "atcoder";
  fetchProfile(handle: string): Promise<{
    handle: string;
    rating: number | null;
    avatar: string | null;
  }>;
  fetchRecentSolves(handle: string, fromTimestamp?: number): Promise<PlatformSolvedRecord[]>;
}

export * from "./codeforces";
export * from "./atcoder";
