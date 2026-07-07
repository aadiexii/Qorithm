import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import { getCurrentSession } from "@/services/Auth/auth";

export const metadata: Metadata = {
  title: "Dashboard | Qorithm",
};
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { getDashboardStats } from "@/components/actions/dashboard-actions";
import { getTodayChallenge } from "@/components/actions/potd-actions";
import { PotdCard } from "@/components/dashboard/potd-card";
import { RefreshStreakButton } from "@/components/dashboard/refresh-streak-button";
import {
  CfConnectedBadge,
  CfConnectInline,
} from "@/components/dashboard/cf-connect-inline";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/");

  const [stats, potd] = await Promise.all([
    getDashboardStats(),
    getTodayChallenge(),
  ]);

  const isDailyEligible = Boolean(stats.codeforcesHandle);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12 flex flex-col items-stretch gap-6">
      {/* Greeting header */}
      <div className="text-center flex flex-col gap-2">
        <DashboardGreeting name={session.user.name} />

        {/* CF handle inline — connected state */}
        {isDailyEligible && stats.codeforcesHandle && (
          <CfConnectedBadge initialHandle={stats.codeforcesHandle} />
        )}
      </div>

      {/* CF connect inline — disconnected state */}
      {!isDailyEligible && <CfConnectInline />}

      {/* Streak — only shown when CF is connected */}
      {isDailyEligible && (
        <div className="flex justify-center">
          <RefreshStreakButton initialStreak={stats.streak} />
        </div>
      )}

      {/* Daily Challenge card */}
      <section className="flex flex-col">
        <PotdCard potd={potd} isDailyEligible={isDailyEligible} />
      </section>

      {/* Sheet and OA progress cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="group flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-5 shadow-lg transition-all hover:border-white/20 hover:bg-[#111111]">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Sheet Progress
          </span>
          <div className="mt-3 mb-5">
            <span className="text-2xl font-extrabold text-white">
              {stats.sheetSolved}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">solved</span>
          </div>
          <div className="mt-auto">
            <Link
              href="/sheet"
              className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-white/10 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
            >
              Continue
            </Link>
          </div>
        </div>

        <div className="group flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-5 shadow-lg transition-all hover:border-white/20 hover:bg-[#111111]">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            OA Progress
          </span>
          <div className="mt-3 mb-5">
            <span className="text-2xl font-extrabold text-white">
              {stats.oaSolved}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">solved</span>
          </div>
          <div className="mt-auto">
            <span
              className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-white/5 border border-white/10 px-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
            >
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
