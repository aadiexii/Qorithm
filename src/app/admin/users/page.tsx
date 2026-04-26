import { listUsers } from "@/features/users/admin-actions";
import { UsersClient } from "@/features/users/components/users-client";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? Number(params.page) || 1 : 1;
  const q = typeof params.q === "string" ? params.q : "";

  const result = await listUsers({ page, pageSize: 20, q });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">
          View all registered users and manage their access roles.
        </p>
      </div>

      <UsersClient result={result} />
    </div>
  );
}
