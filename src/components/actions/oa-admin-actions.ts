"use server";

import { eq, and, asc, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/services/Database/client";
import {
  companies,
  companySections,
  oaProblems,
  companySectionProblems,
} from "@/services/Database/schema/oa";
import { requireAdmin } from "@/services/Auth/auth";

// ---------------------------------------------------------------------------
// Company Admin CRUD
// ---------------------------------------------------------------------------

export async function listCompaniesForAdmin() {
  await requireAdmin();

  const results = await db.execute(sql`
    SELECT 
      c.id, c.slug, c.name, c.logo, c.difficulty, c.description, c.is_published as "isPublished",
      COUNT(s.id) as "sectionCount"
    FROM ${companies} c
    LEFT JOIN ${companySections} s ON c.id = s.company_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `);

  return results.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      slug: r.slug as string,
      name: r.name as string,
      logo: r.logo as string | null,
      difficulty: r.difficulty as string,
      description: r.description as string | null,
      isPublished: r.isPublished as boolean,
      sectionCount: Number(r.sectionCount ?? 0),
    };
  });
}

export async function createCompanyAction(data: {
  name: string;
  slug: string;
  difficulty: string;
  description?: string;
  logo?: string;
  isPublished?: boolean;
}) {
  await requireAdmin();
  try {
    await db.insert(companies).values({
      name: data.name,
      slug: data.slug,
      difficulty: data.difficulty,
      description: data.description ?? null,
      logo: data.logo ?? null,
      isPublished: data.isPublished ?? true,
    });
    revalidatePath("/OA");
    revalidatePath("/admin/oa");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create company.",
    };
  }
}

export async function updateCompanyAction(
  id: string,
  data: {
    name?: string;
    slug?: string;
    difficulty?: string;
    description?: string;
    logo?: string;
    isPublished?: boolean;
  },
) {
  await requireAdmin();
  try {
    await db.update(companies).set(data).where(eq(companies.id, id));
    revalidatePath("/OA");
    revalidatePath(`/OA/${data.slug || ""}`);
    revalidatePath("/admin/oa");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update company.",
    };
  }
}

export async function deleteCompanyAction(id: string) {
  await requireAdmin();
  try {
    await db.delete(companies).where(eq(companies.id, id));
    revalidatePath("/OA");
    revalidatePath("/admin/oa");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete company.",
    };
  }
}

// ---------------------------------------------------------------------------
// Section Admin CRUD
// ---------------------------------------------------------------------------

export async function listCompanySectionsForAdmin(companyId: string) {
  await requireAdmin();

  const results = await db.execute(sql`
    SELECT 
      s.id, s.name, s.slug, s.sort_order as "sortOrder", s.description, s.is_published as "isPublished",
      COUNT(p.id) as "problemCount"
    FROM ${companySections} s
    LEFT JOIN ${companySectionProblems} p ON s.id = p.section_id
    WHERE s.company_id = ${companyId}::uuid
    GROUP BY s.id
    ORDER BY s.sort_order ASC
  `);

  return results.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      name: r.name as string,
      slug: r.slug as string,
      sortOrder: r.sortOrder as number,
      description: r.description as string | null,
      isPublished: r.isPublished as boolean,
      problemCount: Number(r.problemCount ?? 0),
    };
  });
}

export async function createCompanySectionAction(data: {
  companyId: string;
  name: string;
  slug: string;
  description?: string;
  isPublished?: boolean;
}) {
  await requireAdmin();
  try {
    const [result] = await db
      .select({ maxOrder: sql<number>`max(${companySections.sortOrder})` })
      .from(companySections)
      .where(eq(companySections.companyId, data.companyId));

    const nextOrder = (result?.maxOrder ?? -1) + 1;

    await db.insert(companySections).values({
      companyId: data.companyId,
      name: data.name,
      slug: data.slug,
      sortOrder: nextOrder,
      description: data.description ?? null,
      isPublished: data.isPublished ?? true,
    });

    revalidatePath("/OA");
    revalidatePath("/admin/oa");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create section.",
    };
  }
}

export async function updateCompanySectionAction(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    isPublished?: boolean;
  },
) {
  await requireAdmin();
  try {
    await db
      .update(companySections)
      .set(data)
      .where(eq(companySections.id, id));
    revalidatePath("/OA");
    revalidatePath("/admin/oa");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update section.",
    };
  }
}

export async function deleteCompanySectionAction(id: string) {
  await requireAdmin();
  try {
    await db.delete(companySections).where(eq(companySections.id, id));
    revalidatePath("/OA");
    revalidatePath("/admin/oa");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete section.",
    };
  }
}

export async function moveCompanySectionOrder(
  sectionId: string,
  direction: "up" | "down",
) {
  await requireAdmin();
  const [section] = await db
    .select()
    .from(companySections)
    .where(eq(companySections.id, sectionId))
    .limit(1);

  if (!section) return { success: false, error: "Section not found." };

  const operator = direction === "up" ? sql`<` : sql`>`;
  const orderDirection =
    direction === "up"
      ? desc(companySections.sortOrder)
      : asc(companySections.sortOrder);

  const [sibling] = await db
    .select()
    .from(companySections)
    .where(
      and(
        eq(companySections.companyId, section.companyId),
        sql`${companySections.sortOrder} ${operator} ${section.sortOrder}`,
      ),
    )
    .orderBy(orderDirection)
    .limit(1);

  if (!sibling) return { success: true };

  const temp = section.sortOrder;
  await db
    .update(companySections)
    .set({ sortOrder: sibling.sortOrder })
    .where(eq(companySections.id, section.id));
  await db
    .update(companySections)
    .set({ sortOrder: temp })
    .where(eq(companySections.id, sibling.id));

  revalidatePath("/OA");
  revalidatePath("/admin/oa");
  return { success: true };
}

// ---------------------------------------------------------------------------
// OA Problem Admin CRUD
// ---------------------------------------------------------------------------

export async function listSectionProblemsForAdmin(sectionId: string) {
  await requireAdmin();
  return db
    .select({
      id: oaProblems.id,
      title: oaProblems.title,
      slug: oaProblems.slug,
      difficulty: oaProblems.difficulty,
      platform: oaProblems.platform,
      url: oaProblems.url,
      isPublished: oaProblems.isPublished,
      orderIndex: companySectionProblems.orderIndex,
      isRequired: companySectionProblems.isRequired,
    })
    .from(companySectionProblems)
    .innerJoin(
      oaProblems,
      eq(oaProblems.id, companySectionProblems.oaProblemId),
    )
    .where(eq(companySectionProblems.sectionId, sectionId))
    .orderBy(asc(companySectionProblems.orderIndex));
}

export async function createOAProblemAction(
  sectionId: string,
  problemData: {
    title: string;
    slug: string;
    difficulty: "easy" | "medium" | "hard";
    platform: "leetcode" | "gfg" | "codeforces";
    url: string;
    isPublished?: boolean;
    isRequired?: boolean;
  },
) {
  await requireAdmin();
  try {
    const [insertedProblem] = await db
      .insert(oaProblems)
      .values({
        title: problemData.title,
        slug: problemData.slug,
        difficulty: problemData.difficulty,
        platform: problemData.platform,
        url: problemData.url,
        isPublished: problemData.isPublished ?? true,
      })
      .returning({ id: oaProblems.id });

    const [result] = await db
      .select({
        maxIndex: sql<number>`max(${companySectionProblems.orderIndex})`,
      })
      .from(companySectionProblems)
      .where(eq(companySectionProblems.sectionId, sectionId));

    const nextIndex = (result?.maxIndex ?? -1) + 1;

    await db.insert(companySectionProblems).values({
      sectionId,
      oaProblemId: insertedProblem.id,
      orderIndex: nextIndex,
      isRequired: problemData.isRequired ?? true,
    });

    revalidatePath("/OA");
    revalidatePath("/admin/oa");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add problem.",
    };
  }
}

export async function deleteOAProblemAction(
  sectionId: string,
  problemId: string,
) {
  await requireAdmin();
  try {
    await db
      .delete(companySectionProblems)
      .where(
        and(
          eq(companySectionProblems.sectionId, sectionId),
          eq(companySectionProblems.oaProblemId, problemId),
        ),
      );

    await db.delete(oaProblems).where(eq(oaProblems.id, problemId));

    revalidatePath("/OA");
    revalidatePath("/admin/oa");
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to remove problem.",
    };
  }
}

export async function moveOAProblemOrder(
  sectionId: string,
  problemId: string,
  direction: "up" | "down",
) {
  await requireAdmin();
  const [mapping] = await db
    .select()
    .from(companySectionProblems)
    .where(
      and(
        eq(companySectionProblems.sectionId, sectionId),
        eq(companySectionProblems.oaProblemId, problemId),
      ),
    )
    .limit(1);

  if (!mapping) return { success: false, error: "Mapping not found." };

  const operator = direction === "up" ? sql`<` : sql`>`;
  const orderDirection =
    direction === "up"
      ? desc(companySectionProblems.orderIndex)
      : asc(companySectionProblems.orderIndex);

  const [sibling] = await db
    .select()
    .from(companySectionProblems)
    .where(
      and(
        eq(companySectionProblems.sectionId, sectionId),
        sql`${companySectionProblems.orderIndex} ${operator} ${mapping.orderIndex}`,
      ),
    )
    .orderBy(orderDirection)
    .limit(1);

  if (!sibling) return { success: true };

  const temp = mapping.orderIndex;
  await db
    .update(companySectionProblems)
    .set({ orderIndex: sibling.orderIndex })
    .where(eq(companySectionProblems.id, mapping.id));

  await db
    .update(companySectionProblems)
    .set({ orderIndex: temp })
    .where(eq(companySectionProblems.id, sibling.id));

  revalidatePath("/OA");
  revalidatePath("/admin/oa");
  return { success: true };
}
