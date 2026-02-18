-- Add 'organization' to institution_type enum
ALTER TYPE "institution_type" ADD VALUE IF NOT EXISTS 'organization';

-- Add business ID fields and organization profile fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "business_id" varchar(50);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "business_id_country" varchar(2);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "website_url" varchar(500);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "description" text;

CREATE INDEX IF NOT EXISTS "users_business_id_idx" ON "users" ("business_id") WHERE "business_id" IS NOT NULL;
