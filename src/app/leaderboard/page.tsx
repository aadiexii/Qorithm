import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/auth";
import { getLeaderboard } from "@/features/leaderboard/actions";
import { LeaderboardClient } from "@/features/leaderboard/components/leaderboard-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function LeaderboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/");

  const weeklyData = await getLeaderboard("weekly");
  const allTimeData = await getLeaderboard("all-time");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
      
      <LeaderboardClient 
        weekly={weeklyData} 
        allTime={allTimeData} 
        currentUserId={session.user.id} 
      />
    </div>
  );
}
