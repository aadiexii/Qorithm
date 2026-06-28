import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { getCompanyBySlug } from "@/components/actions/oa-actions";
import { CompanyRoadmap } from "@/components/oa/company-roadmap";

type PageProps = {
  params: Promise<{ company: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { company: companySlug } = await params;
  const data = await getCompanyBySlug(companySlug);
  if (!data) return { title: "Roadmap Not Found | Qorithm" };

  return {
    title: `${data.company.name} Interview Roadmap | Qorithm`,
    description: `Curated interview roadmap sections and coding problems for ${data.company.name}.`,
  };
}

export default async function CompanyRoadmapPage({ params }: PageProps) {
  const { company: companySlug } = await params;
  const data = await getCompanyBySlug(companySlug);

  if (!data) {
    notFound();
  }

  const { company, sections } = data;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-neutral-400">
        <Link
          href="/"
          className="flex items-center gap-1 transition-colors hover:text-white"
        >
          <Home className="h-3 w-3" /> Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/OA" className="transition-colors hover:text-white">
          OA Roadmaps
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-neutral-200">{company.name}</span>
      </nav>

      {/* Header Info */}
      <div className="mb-8 border-b border-white/5 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {company.name} Roadmap
            </h1>
            {company.description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
                {company.description}
              </p>
            )}
          </div>
          <span className="text-accent self-start rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold tracking-wider uppercase sm:self-center">
            {company.difficulty} Difficulty
          </span>
        </div>
      </div>

      {/* Roadmap Sections */}
      <CompanyRoadmap companySlug={company.slug} sections={sections} />
    </main>
  );
}
