import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { resourceTags } from './resourceTags.js';

export const resourceTagsSynonyms = pgTable('tagSynonyms', {
  id: uuid('id').defaultRandom().primaryKey(),
  tag_id: uuid('tag_id')
    .references(() => resourceTags.id)
    .notNull(),
  synonyms: varchar('synonyms', { length: 50 }).notNull().unique(),
});

export type ResourceTagsSynonyms = typeof resourceTagsSynonyms.$inferSelect;
export type NewResourceTagsSynonyms = typeof resourceTagsSynonyms.$inferInsert;
