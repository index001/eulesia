-- Add score column to club_threads
ALTER TABLE "club_threads" ADD COLUMN IF NOT EXISTS "score" integer DEFAULT 0;

-- Add score column to club_comments
ALTER TABLE "club_comments" ADD COLUMN IF NOT EXISTS "score" integer DEFAULT 0;

-- Create club_thread_votes table
CREATE TABLE IF NOT EXISTS "club_thread_votes" (
  "thread_id" uuid NOT NULL REFERENCES "club_threads"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "value" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("thread_id", "user_id")
);

CREATE INDEX IF NOT EXISTS "club_thread_votes_thread_idx" ON "club_thread_votes" ("thread_id");

-- Create club_comment_votes table
CREATE TABLE IF NOT EXISTS "club_comment_votes" (
  "comment_id" uuid NOT NULL REFERENCES "club_comments"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "value" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  PRIMARY KEY ("comment_id", "user_id")
);

CREATE INDEX IF NOT EXISTS "club_comment_votes_comment_idx" ON "club_comment_votes" ("comment_id");
