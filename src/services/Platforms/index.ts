export interface PlatformAdapter {
  platformId: "codeforces";
  fetchProfile(handle: string): Promise<{
    handle: string;
    rating: number | null;
    avatar: string | null;
  }>;
  fetchSubmissions?(handle: string): Promise<
    { problem: { contestId: number; index: string }; verdict: string }[]
  >;
}

export * from "./codeforces";
