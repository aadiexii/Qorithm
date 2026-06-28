import { getCompanies } from "@/components/actions/oa-actions";
import { CompanyCard } from "@/components/oa/company-card";
import { Briefcase } from "lucide-react";

export const metadata = {
  title: "OA Roadmaps | Qorithm",
  description:
    "Curated company-wise Previous Year Questions (PYQ) roadmaps for coding rounds.",
};

export default async function OAPage() {
  const companiesList = await getCompanies();

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

      {companiesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 p-8 py-20 text-center">
          <Briefcase className="h-12 w-12 animate-pulse text-neutral-600" />
          <h3 className="mt-4 text-base font-semibold text-neutral-400">
            No company roadmaps available yet
          </h3>
          <p className="mt-2 max-w-xs text-sm text-neutral-500">
            We are currently curating and verifying roadmaps. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companiesList.map((company) => (
            <CompanyCard
              key={company.id}
              name={company.name}
              slug={company.slug}
              logo={company.logo}
              difficulty={company.difficulty}
              description={company.description}
              sectionCount={company.sectionCount}
            />
          ))}
        </div>
      )}
    </main>
  );
}
