CREATE TABLE "resourceTags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_name" varchar(50) NOT NULL,
	CONSTRAINT "resourceTags_tag_name_unique" UNIQUE("tag_name")
);
--> statement-breakpoint
CREATE TABLE "resourceTagsResources" (
	"resource_id" uuid NOT NULL,
	"resource_tag_id" uuid NOT NULL,
	CONSTRAINT "resourceTagsResources_resource_id_resource_tag_id_pk" PRIMARY KEY("resource_id","resource_tag_id")
);
--> statement-breakpoint
CREATE TABLE "tagSynonyms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL,
	"synonyms" varchar(50) NOT NULL,
	CONSTRAINT "tagSynonyms_synonyms_unique" UNIQUE("synonyms")
);
--> statement-breakpoint
ALTER TABLE "resourceTagsResources" ADD CONSTRAINT "resourceTagsResources_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resourceTagsResources" ADD CONSTRAINT "resourceTagsResources_resource_tag_id_resourceTags_id_fk" FOREIGN KEY ("resource_tag_id") REFERENCES "public"."resourceTags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tagSynonyms" ADD CONSTRAINT "tagSynonyms_tag_id_resourceTags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."resourceTags"("id") ON DELETE no action ON UPDATE no action;