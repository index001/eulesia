CREATE TABLE IF NOT EXISTS "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conversations_updated_idx" ON "conversations" USING btree ("updated_at" DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversation_participants" (
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"last_read_at" timestamp with time zone DEFAULT now(),
	"is_muted" boolean DEFAULT false,
	"joined_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "conversation_participants_conversation_id_user_id_pk" PRIMARY KEY("conversation_id","user_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conv_participants_user_idx" ON "conversation_participants" USING btree ("user_id");
--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "direct_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"content" text NOT NULL,
	"content_html" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dm_conversation_idx" ON "direct_messages" USING btree ("conversation_id","created_at");
--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
