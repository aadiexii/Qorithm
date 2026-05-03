import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { sheetSections } from "@/db/schema/sheet";
import { DotGridBackground } from "@/components/dot-grid-background";
import { getCurrentSession } from "@/server/auth";

async function getPublishedSectionsPreview(limit: number) {
  return db
    .select({
      id: sheetSections.id,
      slug: sheetSections.slug,
      title: sheetSections.title,
      sortOrder: sheetSections.sortOrder,
    })
    .from(sheetSections)
    .where(eq(sheetSections.isPublished, true))
    .orderBy(asc(sheetSections.sortOrder))
    .limit(limit);
}

export default async function HomePage() {
  const [session, previewSections] = await Promise.all([
    getCurrentSession(),
    getPublishedSectionsPreview(6),
  ]);

  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-accent/30">
      <DotGridBackground />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col px-6 pt-16 pb-24 space-y-24">
        {/* Centered Minimal Hero Section */}
        <section className="flex flex-col items-center text-center pt-8">
          {/* Top Badge */}
          <div className="mb-8 inline-flex items-center rounded-md border border-slate-700/50 bg-slate-900/50 px-3 py-1.5 shadow-md">
            <span className="text-[13px] font-medium text-white flex items-center gap-1.5">
              Backed by
              <span className="bg-orange-500 text-white rounded-[4px] px-1.5 py-0.5 text-xs font-bold leading-none shadow-[0_2px_10px_rgba(249,115,22,0.4)]">
                CP
              </span>
              ers
            </span>
          </div>
          
          <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl leading-[1.1]">
            Master algorithms <br />
            <span className="text-slate-400">systematically.</span>
          </h1>
          
          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Ditch the random problem grind. Follow proven learning tracks, track your progression, and build your algorithmic intuition in a distraction-free environment.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={session ? "/dashboard" : "/sign-in"}
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-8 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent/90"
            >
              {session ? "Go to Dashboard" : "Start Solving"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/sheet"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/10 bg-card/40 px-8 text-sm font-medium text-slate-300 backdrop-blur transition-colors hover:bg-white/5 hover:text-white"
            >
              Explore Sheet
            </Link>
          </div>
        </section>

        {/* How to use Qorithm */}
        <section className="space-y-10 border-t border-white/5 pt-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How to use Qorithm</h2>
            <p className="text-slate-400 text-base">Pick one path based on your current level.</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="group flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md p-6 shadow-lg transition-all hover:border-white/20 hover:bg-[#111111]">
              <h3 className="text-lg font-semibold text-white mb-2">New to CP</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">Start from the Sheet and follow sections in order.</p>
              <div className="mt-auto">
                <Link href="/sheet" className="inline-flex h-9 items-center justify-center rounded-md bg-white/10 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/20 w-full">
                  Start Beginner Path
                </Link>
              </div>
            </div>

            <div className="group flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md p-6 shadow-lg transition-all hover:border-white/20 hover:bg-[#111111]">
              <h3 className="text-lg font-semibold text-white mb-2">Know the basics</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">Resume from your level by choosing the right section.</p>
              <div className="mt-auto">
                <Link href="/sheet" className="inline-flex h-9 items-center justify-center rounded-md bg-white/10 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/20 w-full">
                  Continue from Sheet
                </Link>
              </div>
            </div>

            <div className="group flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md p-6 shadow-lg transition-all hover:border-white/20 hover:bg-[#111111]">
              <h3 className="text-lg font-semibold text-white mb-2">Targeted practice</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">Use Problems filters for topic-wise and rating-wise prep.</p>
              <div className="mt-auto">
                <Link href="/problems" className="inline-flex h-9 items-center justify-center rounded-md bg-white/10 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/20 w-full">
                  Practice by Topic/Rating
                </Link>
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-slate-500 italic">
            Tip: Avoid random hopping. Follow one path consistently for at least 2 weeks.
          </p>
        </section>

        {/* Learning Tracks — from DB */}
        <section className="space-y-10 border-t border-white/5 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Curated Tracks</h2>
              <p className="text-slate-400 text-base">Jump into structured learning paths.</p>
            </div>
            <Link href="/sheet" className="group flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-accent/80">
              View all {previewSections.length > 0 ? "27" : ""} tracks <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          {previewSections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
              <p className="text-sm text-muted-foreground font-mono">
                Learning tracks load after running <span className="text-accent">npm run db:seed</span>
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previewSections.map((section, idx) => (
                <Link
                  key={section.id}
                  href={`/sheet/${section.slug}`}
                  className="group flex flex-col gap-4 rounded-xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#111111]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded bg-white/5 text-xs font-bold text-slate-500 tabular-nums">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-200 transition-colors group-hover:text-white">
                      {section.title}
                    </h3>
                  </div>
                  <div className="mt-auto h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-0 rounded-full bg-accent/50 transition-all group-hover:w-1/4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Final CTA Band */}
      <section className="border-t border-white/5 bg-card/20">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to elevate your skills?</h2>
          <p className="text-base text-slate-400 max-w-xl mx-auto">Join the premium platform designed to make competitive programming systematic and tracking effortless.</p>
          <div className="pt-4">
            <Link
              href={session ? "/dashboard" : "/sign-up"}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-8 text-sm font-bold text-black transition-transform hover:scale-105"
            >
              {session ? "Enter Dashboard" : "Create Free Account"}
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-white/5 bg-background py-8">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-white text-sm tracking-tight">
            <span>Qorithm</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500 font-medium">
            <Link href="/problems" className="hover:text-slate-300 transition-colors">Problems</Link>
            <Link href="/sheet" className="hover:text-slate-300 transition-colors">Sheet</Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
          </div>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Qorithm. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
