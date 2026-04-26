import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle, ChevronRight, LayersIcon } from "lucide-react";

import { getCurrentSession } from "@/server/auth";
import { getSheetSectionsWithProgress, getNextRecommendedSection } from "@/features/sheet/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { SheetSectionProgress } from "@/features/sheet/types";

// ---------------------------------------------------------------------------
// Sub-components (server-safe, no state)
// ---------------------------------------------------------------------------

function StatusBadge({ label }: { label: SheetSectionProgress["statusLabel"] }) {
  const styles: Record<SheetSectionProgress["statusLabel"], string> = {
    Completed: "bg-green-500/20 text-green-400 border-green-500/30",
    "In Progress": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "Start now": "bg-white/5 text-slate-400 border-white/10",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[label]}`}>
      {label}
    </span>
  );
}

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-white transition-all duration-700 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function SectionCard({
  section,
  isRecommended,
}: {
  section: SheetSectionProgress;
  isRecommended: boolean;
}) {
  return (
    <Link
      href={`/sheet/${section.slug}`}
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isRecommended
          ? "border-white/20 bg-white/5"
          : "border-border/60 bg-card/70 hover:border-white/15"
      }`}
    >
      {isRecommended && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">
          Continue
        </div>
      )}

      <div className="flex items-start justify-between gap-3 pr-20">
        <div className="space-y-1.5">
          <h3 className="font-semibold leading-snug text-white transition-colors group-hover:text-white/80">
            {section.title}
          </h3>
          <StatusBadge label={section.statusLabel} />
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {section.solvedProblems} / {section.totalProblems} solved
          </span>
          <span className="font-semibold text-slate-300">{section.progressPercentage}%</span>
        </div>
        <ProgressBar percentage={section.progressPercentage} />
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SheetPage() {
  const session = await getCurrentSession();

  const [sections, recommended] = await Promise.all([
    getSheetSectionsWithProgress(session?.user?.id),
    getNextRecommendedSection(session?.user?.id),
  ]);

  const completedCount = sections.filter((s) => s.statusLabel === "Completed").length;
  const inProgressCount = sections.filter((s) => s.statusLabel === "In Progress").length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 md:px-8">
      {/* Page header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          <LayersIcon className="h-4 w-4" />
          <span>Learning Sheet</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Your CP Training Sheet
        </h1>
        <p className="max-w-2xl text-base text-slate-400">
          Work through each section in order. Problems within sections are curated for deliberate progression.
        </p>
      </div>

      {/* Stats row */}
      {sections.length > 0 && (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-3">
          <Card className="border-border/60 bg-card/70">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-2xl font-bold tracking-tight text-white">{sections.length}</span>
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Total Sections</span>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/70">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-2xl font-bold tracking-tight text-green-400">{completedCount}</span>
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Completed</span>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/70">
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-2xl font-bold tracking-tight text-amber-400">{inProgressCount}</span>
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">In Progress</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* "Continue where you left off" card */}
      {recommended && (
        <Card className="border-white/15 bg-white/5">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Continue where you left off
            </CardDescription>
            <CardTitle className="text-xl text-white">{recommended.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <ProgressBar percentage={recommended.progressPercentage} />
              <p className="text-xs text-slate-400">{recommended.progressPercentage}% complete</p>
            </div>
            <Link
              href={`/sheet/${recommended.slug}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Open <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Sections grid */}
      {sections.length === 0 ? (
        <Card className="border-border/60 bg-card/70">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-card/70">
              <BookOpen className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-white">No sections available yet</p>
              <p className="text-sm text-muted-foreground">
                Run the seed script to populate the learning sheet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">All Sections</h2>
            <span className="text-sm text-muted-foreground">{sections.length} sections</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                isRecommended={recommended?.id === section.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer hint */}
      {sections.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          <CheckCircle className="mr-1.5 inline-block h-4 w-4 text-green-500" />
          Problems within each section open in the next phase.
        </p>
      )}
    </div>
  );
}
