import { PlatformAdapter, PlatformSolvedRecord } from "./index";

export const AtCoderAdapter: PlatformAdapter = {
  platformId: "atcoder",
  
  async fetchProfile(handle: string) {
    // AtCoder doesn't have an official API for profiles, so we just return the handle
    // For a real app, you could scrape or use a secondary API for ratings
    return {
      handle,
      rating: null,
      avatar: null,
    };
  },

  async fetchRecentSolves(handle: string, fromTimestamp?: number): Promise<PlatformSolvedRecord[]> {
    const tsSeconds = fromTimestamp ? Math.floor(fromTimestamp / 1000) : 0;
    const url = `https://kenkoooo.com/atcoder/atcoder-api/v3/user/submissions?user=${handle}&from_second=${tsSeconds}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch AtCoder submissions");
    
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Invalid AtCoder API response");

    const solves: PlatformSolvedRecord[] = [];
    const seen = new Set<string>();

    for (const sub of data) {
      if (sub.result === "AC") {
        if (!seen.has(sub.problem_id)) {
          seen.add(sub.problem_id);
          solves.push({
            problemIdStr: sub.problem_id, // usually e.g., "abc123_a"
            contestId: sub.contest_id,
            timestamp: sub.epoch_second * 1000,
          });
        }
      }
    }

    return solves;
  }
};
