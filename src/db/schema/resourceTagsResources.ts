import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { resources } from './resources.js';
import { resourceTags } from './resourceTags.js';

export const resourceTagsResources = pgTable(
  'resourceTagsResources',
  {
    resourceId: uuid('resource_id')
      .references(() => resources.id)
      .notNull(),
    resourceTagsId: uuid('resource_tag_id')
      .references(() => resourceTags.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.resourceId, table.resourceTagsId] })]
);

export type ResourceTagsResources = typeof resourceTagsResources.$inferSelect;
export type NewResourceTagsResources =
  typeof resourceTagsResources.$inferInsert;
