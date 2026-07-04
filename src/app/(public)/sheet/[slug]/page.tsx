import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

import { getCurrentSession } from "@/services/Auth/auth";
import { getSheetSectionBySlug } from "@/components/actions/sheet-actions";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/molecules/table";
import { ProblemTrackingControls } from "@/components/tracking/problem-tracking-controls";
import { ProblemActions } from "@/components/sheet/problem-actions";
import { buildProblemUrl } from "@/utils/problem-url";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const section = await getSheetSectionBySlug(resolvedParams.slug);
  if (!section) return { title: "Section Not Found | Qorithm" };

  return {
    title: `${section.title} | Qorithm`,
    description: section.description ?? `Practice problems for ${section.title}.`,
  };
}

export default async function SheetSectionPage({ params }: Props) {
  const session = await getCurrentSession();

  const resolvedParams = await params;
  const section = await getSheetSectionBySlug(
    resolvedParams.slug,
    session?.user?.id,
  );

  if (!section) {
    notFound();
  }

  const solvedCount = section.problems.filter((p) => p.isSolved).length;
  const totalCount = section.problems.length;
  const progressPercentage =
    totalCount === 0 ? 0 : Math.round((solvedCount / totalCount) * 100);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-8">
      {/* Back Link */}
      <div>
        <Link
          href="/sheet"
          className="text-muted-foreground focus-visible:ring-ring -ml-2 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition hover:text-white focus-visible:ring-2 focus-visible:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sheet
        </Link>
      </div>

      {/* Header Block */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {section.title}
        </h1>
        {section.description && (
          <p className="max-w-3xl text-lg text-slate-400">
            {section.description}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">
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

      {/* Problem Table */}
      <Card className="border-border/60 bg-card/70 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Problems in this section</CardTitle>
          <CardDescription>
            Solve them in order for the best learning progression.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {section.problems.length === 0 ? (
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] text-center">#</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.problems.map((problem, idx) => {
                  const url = buildProblemUrl(
                    problem.platform,
                    problem.externalContestId,
                    problem.externalProblemIndex,
                    problem.source,
                  );

                  return (
                    <TableRow key={problem.problemId} className="group">
                      <TableCell className="text-muted-foreground text-center font-medium">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <ProblemTrackingControls
                          problemId={problem.problemId}
                          isSolved={problem.isSolved}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {problem.title}
                      </TableCell>
                      <TableCell>
                        {problem.rating ? (
                          <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-semibold text-slate-300">
                            {problem.rating}
                          </span>
                        ) : problem.platform === "atcoder" &&
                          problem.externalDifficulty ? (
                          <span
                            className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-semibold text-slate-300"
                            title="AtCoder Difficulty"
                          >
                            {problem.externalDifficulty} (AC)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {problem.source}
                      </TableCell>
                      <TableCell className="text-right">
                        <ProblemActions
                          problemId={problem.problemId}
                          solveUrl={url}
                          note={problem.note}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
