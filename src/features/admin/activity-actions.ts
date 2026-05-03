"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/server/auth";
import { users } from "@/db/schema/auth";
import { userProblemStates } from "@/db/schema/tracking";
import { problems } from "@/db/schema/problems";

export type ActivityEvent = {
  id: string;
  type: "signup" | "solve";
  timestamp: Date;
  user: {
    name: string | null;
    email: string;
  };
  details?: {
    problemTitle?: string;
  };
};

export async function getRecentActivity(limit = 50): Promise<ActivityEvent[]> {
  await requireAdmin();

  // We'll use a UNION query to get both signups and solves in chronological order
  const results = await db.execute(sql`
    (
      SELECT 
        u.id as "eventId", 
        'signup' as "type", 
        u.created_at as "timestamp", 
        u.name as "userName", 
        u.email as "userEmail", 
        NULL as "problemTitle"
      FROM ${users} u
    )
    UNION ALL
    (
      SELECT 
        s.id as "eventId", 
        'solve' as "type", 
        s.updated_at as "timestamp", 
        u.name as "userName", 
        u.email as "userEmail", 
        p.title as "problemTitle"
      FROM ${userProblemStates} s
      INNER JOIN ${users} u ON s.user_id = u.id
      INNER JOIN ${problems} p ON s.problem_id = p.id
      WHERE s.status = 'solved'
    )
    ORDER BY "timestamp" DESC
    LIMIT ${limit}
  `);

  return results.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.eventId as string,
      type: r.type as "signup" | "solve",
      timestamp: new Date(r.timestamp as string | Date),
      user: {
        name: (r.userName as string) || null,
        email: r.userEmail as string,
      },
      details: r.problemTitle ? { problemTitle: r.problemTitle as string } : undefined,
    };
  });
}
