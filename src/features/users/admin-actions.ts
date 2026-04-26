"use server";

import { eq, desc, ilike, or, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users } from "@/db/schema/auth";
import { requireAdmin } from "@/server/auth";

export async function listUsers({ page = 1, pageSize = 20, q = "" }: { page?: number; pageSize?: number; q?: string } = {}) {
  await requireAdmin();

  const offset = (page - 1) * pageSize;
  const searchPattern = q ? `%${q}%` : undefined;

  const whereClause = searchPattern
    ? or(ilike(users.name, searchPattern), ilike(users.email, searchPattern))
    : undefined;

  const items = await db
    .select()
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);

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
