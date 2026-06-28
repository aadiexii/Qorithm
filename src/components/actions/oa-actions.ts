"use server";

import { and, asc, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/services/Database/client";
import {
  companies,
  companySections,
  oaProblems,
  companySectionProblems,
  userOaProblemStates,
} from "@/services/Database/schema/oa";
import { getCurrentSession } from "@/services/Auth/auth";

// ---------------------------------------------------------------------------
// Read Actions
// ---------------------------------------------------------------------------

/**
 * Returns all published companies sorted by name.
 */
export async function getCompanies() {
  return db
    .select({
      id: companies.id,
      slug: companies.slug,
      name: companies.name,
      logo: companies.logo,
      difficulty: companies.difficulty,
      description: companies.description,
      isPublished: companies.isPublished,
      createdAt: companies.createdAt,
      updatedAt: companies.updatedAt,
      sectionCount: count(companySections.id),
    })
    .from(companies)
    .leftJoin(
      companySections,
      and(
        eq(companySections.companyId, companies.id),
        eq(companySections.isPublished, true),
      ),
    )
    .where(eq(companies.isPublished, true))
    .groupBy(companies.id)
    .orderBy(asc(companies.name));
}

/**
 * Returns a company's details along with its published sections and problem progress.
 */
export async function getCompanyBySlug(slug: string) {
  const session = await getCurrentSession();
  if (!session) return null;

  const [company] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.slug, slug), eq(companies.isPublished, true)))
    .limit(1);

  if (!company) return null;

  const sections = await db
    .select()
    .from(companySections)
    .where(
      and(
        eq(companySections.companyId, company.id),
        eq(companySections.isPublished, true),
      ),
    )
    .orderBy(asc(companySections.sortOrder));

  const sectionList = [];
  for (const section of sections) {
    // get count of problems
    const [totalRes] = await db
      .select({ value: count() })
      .from(companySectionProblems)
      .innerJoin(
        oaProblems,
        eq(oaProblems.id, companySectionProblems.oaProblemId),
      )
      .where(
        and(
          eq(companySectionProblems.sectionId, section.id),
          eq(oaProblems.isPublished, true),
        ),
      );

    // get count of solved problems by the user
    const [solvedRes] = await db
      .select({ value: count() })
      .from(companySectionProblems)
      .innerJoin(
        oaProblems,
        eq(oaProblems.id, companySectionProblems.oaProblemId),
      )
      .innerJoin(
        userOaProblemStates,
        and(
          eq(userOaProblemStates.oaProblemId, oaProblems.id),
          eq(userOaProblemStates.userId, session.user.id),
          eq(userOaProblemStates.status, "solved"),
        ),
      )
      .where(
        and(
          eq(companySectionProblems.sectionId, section.id),
          eq(oaProblems.isPublished, true),
        ),
      );

    sectionList.push({
      ...section,
      totalProblems: totalRes?.value ?? 0,
      solvedProblems: solvedRes?.value ?? 0,
    });
  }

  return {
    company,
    sections: sectionList,
  };
}

/**
 * Returns all published problems in a company section with the user's progress.
 */
export async function getSectionProblems(sectionId: string) {
  const session = await getCurrentSession();
  if (!session) return [];

  return db
    .select({
      problemId: oaProblems.id,
      title: oaProblems.title,
      slug: oaProblems.slug,
      difficulty: oaProblems.difficulty,
      platform: oaProblems.platform,
      url: oaProblems.url,
      orderIndex: companySectionProblems.orderIndex,
      isRequired: companySectionProblems.isRequired,
      status: userOaProblemStates.status,
      bookmarked: userOaProblemStates.bookmarked,
      note: userOaProblemStates.note,
    })
    .from(companySectionProblems)
    .innerJoin(
      oaProblems,
      eq(oaProblems.id, companySectionProblems.oaProblemId),
    )
    .leftJoin(
      userOaProblemStates,
      and(
        eq(userOaProblemStates.oaProblemId, oaProblems.id),
        eq(userOaProblemStates.userId, session.user.id),
      ),
    )
    .where(
      and(
        eq(companySectionProblems.sectionId, sectionId),
        eq(oaProblems.isPublished, true),
      ),
    )
    .orderBy(asc(companySectionProblems.orderIndex));
}

// ---------------------------------------------------------------------------
// Mutation Actions
// ---------------------------------------------------------------------------

/**
 * Upserts the authenticated user's state (status, bookmark, note) for an OA problem.
 */
export async function updateOAProblemState(
  problemId: string,
  state: {
    status?: "not_started" | "tried" | "solved";
    bookmarked?: boolean;
    note?: string | null;
  },
) {
  const session = await getCurrentSession();
  if (!session) return { success: false, message: "Unauthorized." };

  const now = new Date();
  const setFields: {
    status?: "not_started" | "tried" | "solved";
    bookmarked?: boolean;
    note?: string | null;
    updatedAt: Date;
  } = { updatedAt: now };

  if (state.status !== undefined) setFields.status = state.status;
  if (state.bookmarked !== undefined) setFields.bookmarked = state.bookmarked;
  if (state.note !== undefined) setFields.note = state.note;

  try {
    await db
      .insert(userOaProblemStates)
      .values({
        userId: session.user.id,
        oaProblemId: problemId,
        status: state.status ?? "not_started",
        bookmarked: state.bookmarked ?? false,
        note: state.note ?? null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [userOaProblemStates.userId, userOaProblemStates.oaProblemId],
        set: setFields,
      });

    revalidatePath("/OA");
    return { success: true };
  } catch (error) {
    console.error("Failed to update OA problem state:", error);
    return { success: false, message: "Failed to update problem state." };
  }
}
