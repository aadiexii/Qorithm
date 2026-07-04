import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/services/Database/client";
import { sheetSections } from "@/services/Database/schema/sheet";
import { DotGridBackground } from "@/components/site/dot-grid-background";
import { getCurrentSession } from "@/services/Auth/auth";

export const metadata: Metadata = {
  title: "Qorithm - Master algorithms systematically",
  description:
    "Master algorithms systematically with curated learning tracks, company-wise PYQ roadmaps, and distraction-free competitive programming practice.",
};

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
    <div className="selection:bg-accent/30 relative min-h-screen overflow-hidden">
      <DotGridBackground />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col space-y-24 px-6 pt-16 pb-24">
        {/* Centered Minimal Hero Section */}
        <section className="flex flex-col items-center pt-8 text-center">
          {/* Top Badge */}
          <div className="mb-8 inline-flex items-center rounded-md border border-slate-700/50 bg-slate-900/50 px-3 py-1.5 shadow-md">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-white">
              Backed by
              <span className="rounded-[4px] bg-orange-500 px-1.5 py-0.5 text-xs leading-none font-bold text-white shadow-[0_2px_10px_rgba(249,115,22,0.4)]">
                CP
              </span>
              ers
            </span>
          </div>

          <h1 className="max-w-3xl text-5xl leading-[1.1] font-extrabold tracking-tight text-white sm:text-6xl">
            Master algorithms <br />
            <span className="text-slate-400">systematically.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Ditch the random problem grind. Follow proven learning tracks, track
            your progression, and build your algorithmic intuition in a
            distraction-free environment.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={session ? "/dashboard" : "/sign-in"}
              className="group bg-accent text-accent-foreground hover:bg-accent/90 inline-flex h-11 items-center justify-center gap-2 rounded-lg px-8 text-sm font-semibold transition-all"
            >
              {session ? "Go to Dashboard" : "Start Solving"}{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/sheet"
              className="bg-card/40 inline-flex h-11 items-center justify-center rounded-lg border border-white/10 px-8 text-sm font-medium text-slate-300 backdrop-blur transition-colors hover:bg-white/5 hover:text-white"
            >
              Explore Sheet
            </Link>
          </div>
        </section>

        {/* How to use Qorithm */}
        <section className="space-y-10 border-t border-white/5 pt-16">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How to use Qorithm
            </h2>
            <p className="text-base text-slate-400">
              Pick one path based on your current level.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Section: Master CP */}
            <div className="group flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-6 shadow-lg backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#111111]">
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                Master CP
              </span>
              <p className="mt-3 mb-6 text-sm leading-relaxed text-slate-400">
                Follow structured learning tracks in order, build fundamentals.
              </p>
              <div className="mt-auto">
                <Link
                  href="/sheet"
                  className="inline-flex h-9 w-full items-center justify-center rounded-md bg-white/10 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                >
                  Explore Sheet
                </Link>
              </div>
            </div>

            {/* Right Section: Crack Companies */}
            <div className="group flex flex-col rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-6 shadow-lg backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#111111]">
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                Crack Companies
              </span>
              <p className="mt-3 mb-6 text-sm leading-relaxed text-slate-400">
                Practice company-wise PYQs curated by target company.
              </p>
              <div className="mt-auto">
                <div
                  className="inline-flex h-9 w-full items-center justify-center rounded-md bg-white/5 border border-white/10 px-4 text-xs font-semibold text-slate-500 cursor-not-allowed"
                >
                  Coming Soon
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 italic">
            Tip: Avoid random hopping. Follow one path consistently for at least
            2 weeks.
          </p>
        </section>

        {/* Learning Tracks — from DB */}
        <section className="space-y-10 border-t border-white/5 pt-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Curated Tracks
              </h2>
              <p className="text-base text-slate-400">
                Jump into structured learning paths.
              </p>
            </div>
            <Link
              href="/sheet"
              className="group text-accent hover:text-accent/80 flex items-center gap-1 text-sm font-semibold transition-colors"
            >
              View all tracks{" "}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {previewSections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
              <p className="text-muted-foreground font-mono text-sm">
                Learning tracks load after running{" "}
                <span className="text-accent">npm run db:seed</span>
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previewSections.map((section, idx) => (
                <Link
                  key={section.id}
                  href={`/sheet/${section.slug}`}
                  className="group flex flex-col gap-4 rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#111111]"
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
                    <div className="bg-accent/50 h-full w-0 rounded-full transition-all group-hover:w-1/4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Final CTA Band */}
      <section className="bg-card/20 border-t border-white/5">
        <div className="mx-auto max-w-4xl space-y-6 px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to elevate your skills?
          </h2>
          <p className="mx-auto max-w-xl text-base text-slate-400">
            Join the premium platform designed to make competitive programming
            systematic and tracking effortless.
          </p>
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
      <footer className="bg-background border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-white">
            <span>Qorithm</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <Link
              href="/sheet"
              className="transition-colors hover:text-slate-300"
            >
              Sheet
            </Link>
            <Link
              href="/OA"
              className="transition-colors hover:text-slate-300"
            >
              OA
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-slate-300"
            >
              Dashboard
            </Link>
          </div>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Qorithm. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
