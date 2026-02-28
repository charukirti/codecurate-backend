import { inArray } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { Tags, tags } from '../../../db/schema/tags.js';

export const tagsRepository = {
  async findAll(): Promise<Tags[]> {
    const allTags = await db.select().from(tags);
    return allTags;
  },

  async findByIds(tagIds: string[]): Promise<Tags[]> {
    const validTags = await db
      .select()
      .from(tags)
      .where(inArray(tags.id, tagIds));

    return validTags;
  },
};
