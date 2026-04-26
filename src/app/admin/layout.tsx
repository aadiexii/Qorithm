import { redirect } from "next/navigation";

import { requireAdmin } from "@/server/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="flex items-center gap-6 border-b border-border pb-4 text-sm text-muted-foreground">
        <a href="/admin/problems" className="transition hover:text-foreground">
          Problems
        </a>
        <a href="/admin/topics" className="transition hover:text-foreground">
          Topics
        </a>
        <a href="/admin/sheet" className="transition hover:text-foreground">
          Sheet
        </a>
        <a href="/admin/users" className="transition hover:text-foreground">
          Users
        </a>
        <a href="/admin/import" className="transition hover:text-foreground">
          Import
        </a>
      </div>
      {children}
    </div>
  );
}
