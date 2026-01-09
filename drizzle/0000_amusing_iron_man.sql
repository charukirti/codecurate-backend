CREATE TYPE "public"."type" AS ENUM('video', 'playlist');--> statement-breakpoint
CREATE TYPE "public"."role_enum" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "type" DEFAULT 'video' NOT NULL,
	"youtube_id" varchar(100),
	"playlist_id" varchar(100),
	"video_title" varchar(255) NOT NULL,
	"video_description" text,
	"channel_id" varchar(100),
	"channel_name" varchar(255) NOT NULL,
	"published_at" timestamp NOT NULL,
	"thumbnails" jsonb NOT NULL,
	"item_count" integer,
	"duration_seconds" integer,
	"view_count" bigint,
	"like_count" bigint,
	"video_lang" varchar(50) NOT NULL,
	"code_lang" varchar(50) NOT NULL,
	"video_topic" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "resources_youtube_id_unique" UNIQUE("youtube_id"),
	CONSTRAINT "resources_playlist_id_unique" UNIQUE("playlist_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role_enum" DEFAULT 'user' NOT NULL,
	"refresh_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"resource_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"review_text" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rating_range" CHECK (rating >= 1 AND rating <= 10)
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"display_name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_display_name_unique" UNIQUE("display_name")
);
--> statement-breakpoint
CREATE TABLE "review_tags" (
	"review_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "review_tags_review_id_tag_id_pk" PRIMARY KEY("review_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_tags" ADD CONSTRAINT "review_tags_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_tags" ADD CONSTRAINT "review_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_resource" ON "reviews" USING btree ("user_id","resource_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_resource_id" ON "reviews" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "idx_reviews_user_id" ON "reviews" USING btree ("user_id");