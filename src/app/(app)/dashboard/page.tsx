import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";

import { getCurrentSession } from "@/services/Auth/auth";
import { getDashboardStats } from "@/components/actions/dashboard-actions";
import { getTodayChallenge } from "@/components/actions/potd-actions";
import { PotdCard } from "@/components/dashboard/potd-card";

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/");

  const [stats, potd] = await Promise.all([
    getDashboardStats(),
    getTodayChallenge(),
  ]);

  const isDailyEligible = Boolean(stats.codeforcesHandle);
  const firstName = session.user.name.split(" ")[0] || "You";

  const cfPart = stats.codeforcesHandle ? ` · CF: ${stats.codeforcesHandle}` : "";
  const infoLine = `${firstName}${cfPart} · ${stats.totalSolved} solved`;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12 flex flex-col items-stretch gap-8">
      {/* Brand logo header */}
      <div className="text-center font-extrabold text-2xl tracking-tight text-white">
        Qorithm.
      </div>

      {/* User compact stats info */}
      <div className="text-center text-sm font-semibold tracking-wide text-slate-400">
        {infoLine}
      </div>

      {/* Center POTD card */}
      <section className="flex flex-col">
        <PotdCard potd={potd} isDailyEligible={isDailyEligible} />
      </section>

      {/* Sheet and OA solved stats card grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Sheet card */}
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

        {/* OA card */}
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
            <Link
              href="/OA"
              className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-white/10 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
            >
              Continue
            </Link>
          </div>
        </div>
      </div>

      {/* Optional settings integration banner */}
      {!isDailyEligible && (
        <div className="flex justify-center mt-2">
          <Link
            href="/settings"
            className="text-accent hover:text-accent/80 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            <Zap className="h-3 w-3 shrink-0" />
            Connect Codeforces handle to unlock Daily challenge
          </Link>
        </div>
      )}
    </main>
  );
}
