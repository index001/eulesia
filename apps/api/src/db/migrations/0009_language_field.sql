ALTER TABLE "threads" ADD COLUMN "language" varchar(10);
ALTER TABLE "comments" ADD COLUMN "language" varchar(10);
ALTER TABLE "club_threads" ADD COLUMN "language" varchar(10);
ALTER TABLE "club_comments" ADD COLUMN "language" varchar(10);
CREATE INDEX "threads_language_idx" ON "threads" USING btree ("language");
CREATE INDEX "club_threads_language_idx" ON "club_threads" USING btree ("language");
