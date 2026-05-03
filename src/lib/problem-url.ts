export function buildProblemUrl(
  platform: string | undefined | null,
  contestId: number | null | undefined,
  index: string | null | undefined,
  source: string,
): string | null {
  if (platform === "codeforces" && contestId && index) {
    return `https://codeforces.com/contest/${contestId}/problem/${index}`;
  }
  
  if (platform === "atcoder" && index) {
    // Try to decode AtCoder contest ID back to slug if available
    if (contestId) {
      const id = contestId;
      let prefix = "abc";
      let n = id - 100000;
      if (id >= 200000 && id < 300000) { prefix = "arc"; n = id - 200000; }
      else if (id >= 300000 && id < 400000) { prefix = "agc"; n = id - 300000; }
      const contestSlug = id < 900000 ? `${prefix}${String(n).padStart(3, "0")}` : null;
      if (contestSlug) {
        return `https://atcoder.jp/contests/${contestSlug}/tasks/${index}`;
      }
    }
    
    // Fallback to parsing source string (e.g. "AtCoder abc123_a")
    const contestFromSource = /^AtCoder\s+([a-z0-9_]+)$/i.exec(source)?.[1];
    if (contestFromSource) {
      return `https://atcoder.jp/contests/${contestFromSource}/tasks/${index}`;
    }
  }

  if (/^https?:\/\//i.test(source)) {
    return source;
  }

  // Simple heuristic for LeetCode from source string like "LeetCode 1"
  if (platform === "custom" && source.toLowerCase().includes("leetcode")) {
    return "https://leetcode.com/problemset/all/";
  }

  return null;
}
