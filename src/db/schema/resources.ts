import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  bigint,
} from "drizzle-orm/pg-core";

export const typeEnum = pgEnum("type", ["video", "playlist"]);

export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),

  type: typeEnum("type").default("video").notNull(),
  videoId: varchar("youtube_id", { length: 100 }).unique(),
  playlistId: varchar("playlist_id", { length: 100 }).unique(),

  title: varchar("video_title", { length: 255 }).notNull(),
  description: text("video_description").notNull(),
  channelId: varchar("channel_id", { length: 100 }),
  channelName: varchar("channel_name", { length: 255 }).notNull(),
  publishedAt: timestamp("published_at").notNull(),
  thumbnails: jsonb("thumbnails").notNull(),

  durationIso: varchar("duration_iso", { length: 20 }),
  durationSeconds: integer("duration_seconds"),
  viewCount: bigint("view_count", { mode: "number" }),
  likeCount: bigint("like_count", { mode: "number" }),

  videoLang: varchar("video_lang").notNull(),
  codeLang: varchar("code_lang").notNull(),
  topic: varchar("video_topic", { length: 100 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// type for data coming out of database after querying
export type Resource = typeof resources.$inferSelect;

// type for data going inside database
export type NewResource = typeof resources.$inferInsert;
