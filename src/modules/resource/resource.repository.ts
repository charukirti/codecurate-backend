import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { resources } from '../../db/schema';
import { Transaction } from '../reviews/reviews.types';

export const resourceRepository = {
  async findById(resourceId: string) {
    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, resourceId));

    return resource;
  },

  async updateAvgRating(
    newAverage: string,
    resourceId: string,
    tx: Transaction
  ): Promise<void> {
    await tx
      .update(resources)
      .set({
        avgRating: newAverage,
      })
      .where(eq(resources.id, resourceId));
  },
};
