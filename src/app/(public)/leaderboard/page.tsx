import { redirect } from "next/navigation";
import { getCurrentSession } from "@/services/Auth/auth";
import { getLeaderboard } from "@/components/actions/leaderboard-actions";
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client";
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
          className="text-muted-foreground focus-visible:ring-ring -ml-2 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition hover:text-white focus-visible:ring-2 focus-visible:outline-none"
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
