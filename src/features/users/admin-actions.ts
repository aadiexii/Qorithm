"use server";

import { eq, ilike, or, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users } from "@/db/schema/auth";
import { userProblemStates } from "@/db/schema/tracking";
import { requireAdmin } from "@/server/auth";

export async function listUsers({ page = 1, pageSize = 20, q = "" }: { page?: number; pageSize?: number; q?: string } = {}) {
  await requireAdmin();

  const offset = (page - 1) * pageSize;
  const searchPattern = q ? `%${q}%` : undefined;

  const whereClause = searchPattern
    ? or(ilike(users.name, searchPattern), ilike(users.email, searchPattern))
    : undefined;

  // We need to fetch basic user data + aggregated stats (solves, attempts, last active)
  // To avoid N+1 and keep it efficient, we use a single query with LEFT JOIN and GROUP BY
  const itemsQuery = await db.execute(sql`
    SELECT 
      u.id, u.name, u.email, u.image, u.role, u.created_at as "createdAt",
      COUNT(DISTINCT s.problem_id) as "totalAttempted",
      SUM(CASE WHEN s.status = 'solved' THEN 1 ELSE 0 END) as "totalSolved",
      MAX(s.updated_at) as "lastActive"
    FROM ${users} u
    LEFT JOIN ${userProblemStates} s ON u.id = s.user_id
    ${whereClause ? sql`WHERE u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern}` : sql``}
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `);

  const items = itemsQuery.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      name: r.name as string | null,
      email: r.email as string,
      image: r.image as string | null,
      role: r.role as string,
      createdAt: new Date(r.createdAt as string | Date),
      totalAttempted: Number(r.totalAttempted ?? 0),
      totalSolved: Number(r.totalSolved ?? 0),
      lastActive: r.lastActive ? new Date(r.lastActive as string | Date) : null,
    };
  });

  const [totalResult] = await db
    .select({ value: count() })
    .from(users)
    .where(whereClause);

  const total = totalResult?.value ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return { items, total, page, pageSize, totalPages };
}

export async function setUserRole(userId: string, newRole: "user" | "admin") {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Unauthorized" };

  if (userId === session.user.id && newRole === "user") {
    return { success: false, error: "Cannot demote yourself." };
  }

  await db
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, userId));

  revalidatePath("/admin/users");
  return { success: true };
}
