import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const resourceTags = pgTable('resourceTags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('tag_name', { length: 50 }).notNull().unique(),
});

export type ResourceTags = typeof resourceTags.$inferSelect;
export type NewResourceTags = typeof resourceTags.$inferInsert;
