import Link from "next/link";
import { ChevronRight, ClipboardList } from "lucide-react";

type SectionRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  description: string | null;
  totalProblems: number;
  solvedProblems: number;
};

type CompanyRoadmapProps = {
  companySlug: string;
  sections: SectionRow[];
};

export function CompanyRoadmap({ companySlug, sections }: CompanyRoadmapProps) {
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardList className="h-12 w-12 text-neutral-600" />
        <h3 className="mt-4 text-base font-semibold text-neutral-400">
          No roadmap sections available
        </h3>
        <p className="mt-2 text-sm text-neutral-500">
          Check back later for curated sections.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {sections.map((section) => {
        const percentage =
          section.totalProblems > 0
            ? Math.round((section.solvedProblems / section.totalProblems) * 100)
            : 0;

        return (
          <Link
            key={section.id}
            href={`/OA/${companySlug}/${section.slug}`}
            className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-[#0a0a0a]/95 p-5 transition-all hover:border-white/20 hover:bg-[#111111] md:flex-row md:items-center"
          >
            {/* Left Section Details */}
            <div className="flex-1">
              <h3 className="group-hover:text-accent text-base font-bold text-white transition-colors">
                {section.name}
              </h3>
              {section.description && (
                <p className="mt-1 line-clamp-1 text-sm leading-relaxed text-neutral-400 md:max-w-2xl">
                  {section.description}
                </p>
              )}
            </div>

            {/* Right Section Progress & Link */}
            <div className="mt-4 flex items-center justify-between gap-6 md:mt-0 md:justify-end">
              {/* Progress Tracker */}
              <div className="flex min-w-[140px] flex-col gap-1.5">
                <div className="flex justify-between text-xs font-semibold text-neutral-400">
                  <span>
                    {section.solvedProblems}/{section.totalProblems} Solved
                  </span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Icon Link */}
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-neutral-800 text-neutral-400 transition-all group-hover:scale-105 group-hover:bg-white/10 group-hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
