import { db } from "@/db";
import { queryAdminProblems } from "@/features/admin/actions";
import { AdminCreateProblemForm } from "@/features/admin/components/admin-create-problem-form";
import { AdminProblemsTable } from "@/features/admin/components/admin-problems-table";

export default async function AdminProblemsPage() {
  const allTopics = await db.query.topics.findMany({
    orderBy: (topics, { asc }) => [asc(topics.name)],
  });

  const allProblems = await queryAdminProblems();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Problem Management</h1>
        <p className="text-sm text-muted-foreground">
          Create, edit, publish, and delete problems. All problems visible here regardless of publish
          status.
        </p>
      </div>

      <AdminCreateProblemForm topics={allTopics} />

      <AdminProblemsTable problems={allProblems} />
    </div>
  );
}
