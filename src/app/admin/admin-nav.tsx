"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, Hash, FileSpreadsheet, Activity, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Problems", href: "/admin/problems", icon: BookOpen },
  { label: "Topics", href: "/admin/topics", icon: Hash },
  { label: "Sheets", href: "/admin/sheet", icon: FileSpreadsheet },
  { label: "Import", href: "/admin/import", icon: Upload },
  { label: "Activity", href: "/admin/activity", icon: Activity },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full flex-col gap-2">
      <div className="mb-4 hidden px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:block">
        Admin Console
      </div>
      <div className="flex flex-row overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0 hide-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline-block">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
