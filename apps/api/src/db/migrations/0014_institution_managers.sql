-- Enums for institution manager roles and claim status
DO $$ BEGIN
  CREATE TYPE "institution_manager_role" AS ENUM ('owner', 'editor');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "institution_claim_status" AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Institution managers: links human users to institution accounts they manage
CREATE TABLE IF NOT EXISTS "institution_managers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "institution_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" "institution_manager_role" NOT NULL DEFAULT 'editor',
  "status" "institution_claim_status" NOT NULL DEFAULT 'pending',
  "created_at" timestamp with time zone DEFAULT now(),
  "approved_at" timestamp with time zone,
  "approved_by" uuid REFERENCES "users"("id")
);

CREATE INDEX IF NOT EXISTS "institution_managers_institution_idx" ON "institution_managers" ("institution_id");
CREATE INDEX IF NOT EXISTS "institution_managers_user_idx" ON "institution_managers" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "institution_managers_unique_idx" ON "institution_managers" ("institution_id", "user_id");
