"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listUsers, setUserRole } from "../admin-actions";
import { PaginationControls } from "@/features/problems/components/pagination-controls";

type ListUsersResult = Awaited<ReturnType<typeof listUsers>>;

export function UsersClient({ result }: { result: ListUsersResult }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") ?? "";
      if (query !== currentQ) {
        const params = new URLSearchParams(searchParams);
        if (query) {
          params.set("q", query);
        } else {
          params.delete("q");
        }
        params.set("page", "1"); // reset page on new search
        startTransition(() => {
          router.push(`${pathname}?${params.toString()}`);
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams]);

  const handleRoleChange = (userId: string, newRole: "user" | "admin") => {
    startTransition(async () => {
      const res = await setUserRole(userId, newRole);
      if (!res.success) {
        alert(res.error);
      }
    });
  };

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage user roles and access ({result.total} total).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Solved</TableHead>
                <TableHead className="text-right">Attempted</TableHead>
                <TableHead className="w-32 text-right">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                result.items.map((user) => (
                  <TableRow key={user.id} className={isPending ? "opacity-50 pointer-events-none" : ""}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }).format(new Date(user.createdAt))}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {user.lastActive
                        ? new Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }).format(new Date(user.lastActive))
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-500">
                      {user.totalSolved}
                    </TableCell>
                    <TableCell className="text-right font-medium text-muted-foreground">
                      {user.totalAttempted}
                    </TableCell>
                    <TableCell className="text-right">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as "user" | "admin")}
                        disabled={isPending}
                        className="h-8 w-full rounded border border-border bg-background px-2 text-xs font-medium"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {result.totalPages > 1 && (
          <div className="pt-2">
            <PaginationControls page={result.page} totalPages={result.totalPages} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
