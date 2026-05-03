import { db } from "@/db";
import { queryAdminProblems } from "@/features/admin/actions";
import { AdminCreateProblemForm } from "@/features/admin/components/admin-create-problem-form";
import { AdminProblemsTable } from "@/features/admin/components/admin-problems-table";

export default async function AdminProblemsPage() {
  const allTopics = await db.query.topics.findMany({
    orderBy: (topics, { asc }) => [asc(topics.name)],
  });

  const allProblems = await queryAdminProblems();

  const total = allProblems.length;
  const published = allProblems.filter((p) => p.isPublished).length;
  const unpublished = total - published;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Problem Management</h1>
        <p className="text-sm text-muted-foreground">
          Create, edit, publish, and delete problems. All problems visible here regardless of publish
          status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Total Problems</div>
          <div className="mt-1 text-2xl font-bold">{total}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Published</div>
          <div className="mt-1 text-2xl font-bold text-emerald-500">{published}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Drafts</div>
          <div className="mt-1 text-2xl font-bold text-amber-500">{unpublished}</div>
        </div>
      </div>

      <AdminCreateProblemForm topics={allTopics} />

      <AdminProblemsTable problems={allProblems} />
    </div>
  );
}
