-- Custom SQL migration file, put your code below! --
ALTER TABLE "users" 
  ADD COLUMN "cf_verification_code" text,
  ADD COLUMN "cf_verification_expires" timestamp with time zone,
  ADD COLUMN "cf_pending_handle" text,
  ADD COLUMN "last_verification_requested_at" timestamp with time zone;
