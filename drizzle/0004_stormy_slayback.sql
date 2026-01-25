ALTER TABLE "resources" ALTER COLUMN "instructor_name" DROP DEFAULT;--> statement-breakpoint
UPDATE "resources" SET "instructor_name" = "channel_name";--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "instructor_name" SET NOT NULL;--> statement-breakpoint