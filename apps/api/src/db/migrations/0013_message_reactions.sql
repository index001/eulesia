-- Create message_reactions table
CREATE TABLE IF NOT EXISTS "message_reactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "message_id" uuid NOT NULL REFERENCES "room_messages"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "emoji" varchar(20) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "message_reactions_message_idx" ON "message_reactions" ("message_id");
CREATE UNIQUE INDEX IF NOT EXISTS "message_reactions_unique_idx" ON "message_reactions" ("message_id", "user_id", "emoji");
