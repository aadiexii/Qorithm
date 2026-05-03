import { redirect } from "next/navigation";

import { requireAdmin } from "@/server/auth";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Sidebar for Desktop, Top nav for mobile */}
        <aside className="w-full lg:w-48 lg:shrink-0">
          <AdminNav />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
