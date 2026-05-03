"use server";

import { eq, and, asc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { sheetSections, sheetSectionProblems } from "@/db/schema/sheet";
import { problems } from "@/db/schema/problems";
import { requireAdmin } from "@/server/auth";

export async function listSectionsForAdmin() {
  await requireAdmin();
  return db.select().from(sheetSections).orderBy(asc(sheetSections.sortOrder));
}

export async function searchProblemsForMapping(query: string = "") {
  await requireAdmin();
  
  const search = `%${query}%`;
  return db
    .select({
      id: problems.id,
      title: problems.title,
      source: problems.source,
      rating: problems.rating,
      externalDifficulty: problems.externalDifficulty,
      platform: problems.platform,
    })
    .from(problems)
    .where(query ? sql`${problems.title} ILIKE ${search} OR ${problems.source} ILIKE ${search}` : undefined)
    .orderBy(asc(problems.title))
    .limit(50);
}

export async function getSectionMappings(sectionId: string) {
  await requireAdmin();
  
  return db
    .select({
      problemId: problems.id,
      title: problems.title,
      source: problems.source,
      rating: problems.rating,
      externalDifficulty: problems.externalDifficulty,
      platform: problems.platform,
      orderIndex: sheetSectionProblems.orderIndex,
    })
    .from(sheetSectionProblems)
    .innerJoin(problems, eq(problems.id, sheetSectionProblems.problemId))
    .where(eq(sheetSectionProblems.sectionId, sectionId))
    .orderBy(asc(sheetSectionProblems.orderIndex));
}

export async function addProblemToSection(sectionId: string, problemId: string) {
  await requireAdmin();

  // Find max order index
  const [result] = await db
    .select({ maxOrder: sql<number>`max(${sheetSectionProblems.orderIndex})` })
    .from(sheetSectionProblems)
    .where(eq(sheetSectionProblems.sectionId, sectionId));

  const nextOrder = (result?.maxOrder ?? -1) + 1;

  try {
    await db.insert(sheetSectionProblems).values({
      sectionId,
      problemId,
      orderIndex: nextOrder,
    });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "23505") {
      return { success: false, error: "Problem is already mapped to this section." };
    }
    throw err;
  }

  revalidatePath("/admin/sheet");
  revalidatePath("/sheet");
  return { success: true };
}

export async function removeProblemFromSection(sectionId: string, problemId: string) {
  await requireAdmin();

  await db
    .delete(sheetSectionProblems)
    .where(
      and(
        eq(sheetSectionProblems.sectionId, sectionId),
        eq(sheetSectionProblems.problemId, problemId)
      )
    );

  revalidatePath("/admin/sheet");
  revalidatePath("/sheet");
  return { success: true };
}

export async function moveProblemOrder(
  sectionId: string,
  problemId: string,
  direction: "up" | "down"
) {
  await requireAdmin();

  const mappings = await db
    .select({ problemId: sheetSectionProblems.problemId, orderIndex: sheetSectionProblems.orderIndex })
    .from(sheetSectionProblems)
    .where(eq(sheetSectionProblems.sectionId, sectionId))
    .orderBy(asc(sheetSectionProblems.orderIndex));

  const currentIndex = mappings.findIndex((m) => m.problemId === problemId);
  if (currentIndex === -1) return { success: false, error: "Mapping not found" };

  if (direction === "up" && currentIndex === 0) return { success: true }; // Already at top
  if (direction === "down" && currentIndex === mappings.length - 1) return { success: true }; // Already at bottom

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  const currentMap = mappings[currentIndex];
  const targetMap = mappings[targetIndex];

  // Swap order indexes
  await db.transaction(async (tx) => {
    // Temp order to avoid unique constraint violations
    const tempOrder = -9999;
    
    await tx
      .update(sheetSectionProblems)
      .set({ orderIndex: tempOrder })
      .where(
        and(
          eq(sheetSectionProblems.sectionId, sectionId),
          eq(sheetSectionProblems.problemId, currentMap.problemId)
        )
      );

    await tx
      .update(sheetSectionProblems)
      .set({ orderIndex: currentMap.orderIndex })
      .where(
        and(
          eq(sheetSectionProblems.sectionId, sectionId),
          eq(sheetSectionProblems.problemId, targetMap.problemId)
        )
      );

    await tx
      .update(sheetSectionProblems)
      .set({ orderIndex: targetMap.orderIndex })
      .where(
        and(
          eq(sheetSectionProblems.sectionId, sectionId),
          eq(sheetSectionProblems.problemId, currentMap.problemId)
        )
      );
  });

  revalidatePath("/admin/sheet");
  revalidatePath("/sheet");
  return { success: true };
}
