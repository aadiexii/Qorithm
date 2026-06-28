export interface PlatformAdapter {
  platformId: "codeforces";
  fetchProfile(handle: string): Promise<{
    handle: string;
    rating: number | null;
    avatar: string | null;
  }>;
}

export * from "./codeforces";
