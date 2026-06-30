import { Briefcase } from "lucide-react";
import { getCurrentSession } from "@/services/Auth/auth";
import { getTodayChallenge } from "@/components/actions/potd-actions";
import { PotdBanner } from "@/components/dashboard/potd-banner";

export const metadata = {
  title: "OA Roadmaps | Qorithm",
  description:
    "Curated company-wise Previous Year Questions (PYQ) roadmaps for coding rounds.",
};

export default async function OAPage() {
  const session = await getCurrentSession();
  const potd = session ? await getTodayChallenge() : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-3 border-b border-white/5 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            OA Roadmaps
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400">
            Target specific companies and master their previous year interview
            questions systematically. Track your solves and bookmarks
            distraction-free.
          </p>
        </div>
      </div>

      <PotdBanner
        potdTitle={potd?.title}
        isSolved={potd?.status === "completed"}
      />

      {/* Coming Soon — always shown */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 p-8 py-20 text-center">
        <Briefcase className="h-12 w-12 animate-pulse text-neutral-600" />
        <h3 className="mt-4 text-base font-semibold text-neutral-400">
          Company roadmaps coming soon
        </h3>
        <p className="mt-2 max-w-xs text-sm text-neutral-500">
          We are curating company-wise PYQs and will release them soon. Stay
          tuned!
        </p>
      </div>
    </main>
  );
}
