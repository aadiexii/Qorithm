import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import {
  getCompanyBySlug,
  getSectionProblems,
} from "@/components/actions/oa-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/molecules/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/molecules/table";
import { OAProblemRow } from "@/components/oa/oa-problem-row";

type PageProps = {
  params: Promise<{ company: string; section: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { company: companySlug, section: sectionSlug } = await params;
  const data = await getCompanyBySlug(companySlug);
  if (!data) return { title: "Section Not Found | Qorithm" };

  const section = data.sections.find((s) => s.slug === sectionSlug);
  if (!section) return { title: "Section Not Found | Qorithm" };

  return {
    title: `${section.name} - ${data.company.name} OA Roadmap | Qorithm`,
    description: `Curated coding problems for ${data.company.name} in section ${section.name}.`,
  };
}

export default async function OASectionPage({ params }: PageProps) {
  const { company: companySlug, section: sectionSlug } = await params;
  const companyData = await getCompanyBySlug(companySlug);

  if (!companyData) {
    notFound();
  }

  const section = companyData.sections.find((s) => s.slug === sectionSlug);
  if (!section) {
    notFound();
  }

  const problems = await getSectionProblems(section.id);
  const solvedCount = problems.filter((p) => p.status === "solved").length;
  const totalCount = problems.length;
  const progressPercentage =
    totalCount === 0 ? 0 : Math.round((solvedCount / totalCount) * 100);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-8">
      {/* Back Link */}
      <div>
        <Link
          href={`/OA/${companyData.company.slug}`}
          className="text-muted-foreground focus-visible:ring-ring -ml-2 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition hover:text-white focus-visible:ring-2 focus-visible:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {companyData.company.name} Roadmap
        </Link>
      </div>

      {/* Header Block */}
      <div className="space-y-4">
        <div className="text-accent flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider uppercase">
          <span>{companyData.company.name}</span>
          <span>•</span>
          <span>Roadmap Target</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {section.name}
        </h1>
        {section.description && (
          <p className="max-w-3xl text-base leading-relaxed text-neutral-400">
            {section.description}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-300">
              {solvedCount} / {totalCount} solved
            </span>
            <span className="text-sm font-bold text-white">
              {progressPercentage}%
            </span>
          </div>
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Problem Table Card */}
      <Card className="border-border/60 bg-card/70 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Problems in this section</CardTitle>
          <CardDescription>
            Solve these curated PYQs to excel in your upcoming coding rounds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {problems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="border-border/60 bg-card/70 text-muted-foreground flex h-14 w-14 items-center justify-center rounded-full border">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white">Content coming soon</p>
                <p className="text-muted-foreground text-sm">
                  Problems for this section have not been mapped yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">Solve</TableHead>
                    <TableHead>Problem</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.map((problem) => (
                    <OAProblemRow
                      key={problem.problemId}
                      problemId={problem.problemId}
                      title={problem.title}
                      difficulty={problem.difficulty}
                      platform={problem.platform}
                      url={problem.url}
                      isSolved={problem.status === "solved"}
                      bookmarked={problem.bookmarked ?? false}
                      note={problem.note ?? null}
                      isRequired={problem.isRequired}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
