import { PlatformAdapter, PlatformSolvedRecord } from "./index";

export const CodeforcesAdapter: PlatformAdapter = {
  platformId: "codeforces",
  
  async fetchProfile(handle: string) {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    if (!res.ok) throw new Error("Failed to fetch Codeforces profile");
    const data = await res.json();
    if (data.status !== "OK") throw new Error(data.comment || "Codeforces API error");
    
    const user = data.result[0];
    return {
      handle: user.handle,
      rating: user.rating || null,
      avatar: user.avatar || null,
    };
  },

  async fetchRecentSolves(handle: string, fromTimestamp?: number): Promise<PlatformSolvedRecord[]> {
    const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    if (!res.ok) throw new Error("Failed to fetch Codeforces submissions");
    const data = await res.json();
    if (data.status !== "OK") throw new Error(data.comment || "Codeforces API error");

    const solves: PlatformSolvedRecord[] = [];
    const seen = new Set<string>();

    for (const sub of data.result) {
      if (sub.verdict === "OK" && sub.problem && sub.problem.contestId) {
        const ts = sub.creationTimeSeconds * 1000;
        if (fromTimestamp && ts <= fromTimestamp) continue;

        const pid = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!seen.has(pid)) {
          seen.add(pid);
          solves.push({
            problemIdStr: sub.problem.index,
            contestId: sub.problem.contestId,
            timestamp: ts,
          });
        }
      }
    }

    return solves;
  }
};
