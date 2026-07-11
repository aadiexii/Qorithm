import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  firstName: text("first_name"),
  username: text("username"),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  codeforcesHandle: text("codeforces_handle"),
  cfVerificationCode: text("cf_verification_code"),
  cfVerificationExpires: timestamp("cf_verification_expires", { withTimezone: true }),
  cfPendingHandle: text("cf_pending_handle"),
  lastVerificationRequestAt: timestamp("last_verification_requested_at", { withTimezone: true }),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
