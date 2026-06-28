export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  codeforcesHandle: string | null;
  score: number;
  solvedCount: number;
  recentActivity: Date;
};
