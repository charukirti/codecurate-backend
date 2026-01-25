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
  decimal,
  index,
} from 'drizzle-orm/pg-core';

export const typeEnum = pgEnum('type', ['video', 'playlist']);

export const resources = pgTable(
  'resources',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    type: typeEnum('type').default('video').notNull(),
    videoId: varchar('youtube_id', { length: 100 }).unique(),
    playlistId: varchar('playlist_id', { length: 100 }).unique(),

    title: varchar('video_title', { length: 255 }).notNull(),
    description: text('video_description'),
    channelId: varchar('channel_id', { length: 100 }),
    channelName: varchar('channel_name', { length: 255 }).notNull(),
    publishedAt: timestamp('published_at').notNull(),
    thumbnails: jsonb('thumbnails').notNull(),
    itemCount: integer('item_count'),
    instructorName: varchar('instructor_name', { length: 255 }).notNull(),

    durationSeconds: integer('duration_seconds'),
    viewCount: bigint('view_count', { mode: 'number' }),
    likeCount: bigint('like_count', { mode: 'number' }),

    videoLang: varchar('video_lang', { length: 50 }).notNull(),
    codeLang: varchar('code_lang', { length: 50 }),
    topic: varchar('video_topic', { length: 100 }).notNull(),
    avgRating: decimal('avg_rating', { precision: 3, scale: 1 })
      .default('0')
      .notNull(),

    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_resources_topic').on(table.topic),
    index('idx_resources_title').on(table.title),
    index('idx_resources_code_lang').on(table.codeLang),
    index('idx_resources_videoLang').on(table.videoLang),
    index('idx_resources_channelName').on(table.channelName),
  ]
);

// type for data coming out of database after querying
export type Resource = typeof resources.$inferSelect;

// type for data going inside database
export type NewResource = typeof resources.$inferInsert;
