ALTER TABLE "reviewLikes" DROP CONSTRAINT "reviewLikes_user_id_review_id_pk";--> statement-breakpoint
ALTER TABLE "reviewLikes" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "reviewLikes" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
CREATE INDEX "idx_review_like_count" ON "reviews" USING btree ("review_like_count");