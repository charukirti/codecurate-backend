CREATE INDEX "idx_resources_topic_codelang_rating" ON "resources" USING btree ("video_topic","code_lang","avg_rating" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_resources_topic_tier" ON "resources" USING btree ("video_topic","avg_rating" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_resources_rating" ON "resources" USING btree ("avg_rating" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "resources" DROP COLUMN "view_count";--> statement-breakpoint
ALTER TABLE "resources" DROP COLUMN "like_count";