import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
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
    rawDescription: text('raw_description'),
    description: text('description'),
    channelId: varchar('channel_id', { length: 100 }),
    channelName: varchar('channel_name', { length: 255 }).notNull(),
    publishedAt: timestamp('published_at').notNull(),
    thumbnails: jsonb('thumbnails').notNull(),
    itemCount: integer('item_count'),
    instructorName: varchar('instructor_name', { length: 255 }).notNull(),

    durationSeconds: integer('duration_seconds'),

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

    index('idx_resources_topic_codelang_rating').on(
      table.topic,
      table.codeLang,
      table.avgRating.desc()
    ),
    index('idx_resources_topic_tier').on(table.topic, table.avgRating.desc()),
    index('idx_resources_rating').on(table.avgRating.desc()),
  ]
);

// type for data coming out of database after querying
export type Resource = typeof resources.$inferSelect;

// type for data going inside database
export type NewResource = typeof resources.$inferInsert;
