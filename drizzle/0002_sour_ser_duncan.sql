CREATE INDEX "idx_resources_topic" ON "resources" USING btree ("video_topic");--> statement-breakpoint
CREATE INDEX "idx_resources_title" ON "resources" USING btree ("video_title");--> statement-breakpoint
CREATE INDEX "idx_resources_code_lang" ON "resources" USING btree ("code_lang");--> statement-breakpoint
CREATE INDEX "idx_resources_videoLang" ON "resources" USING btree ("video_lang");--> statement-breakpoint
CREATE INDEX "idx_resources_channelName" ON "resources" USING btree ("channel_name");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");