CREATE TABLE "reviewLikes" (
	"user_id" uuid NOT NULL,
	"review_id" uuid NOT NULL,
	CONSTRAINT "reviewLikes_user_id_review_id_pk" PRIMARY KEY("user_id","review_id")
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "review_like_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "reviewLikes" ADD CONSTRAINT "reviewLikes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviewLikes" ADD CONSTRAINT "reviewLikes_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;