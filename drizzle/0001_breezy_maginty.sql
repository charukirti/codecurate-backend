ALTER TABLE "resources" ALTER COLUMN "video_description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "video_lang" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "code_lang" SET DATA TYPE varchar(50);