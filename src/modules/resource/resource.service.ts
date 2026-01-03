import { eq, or } from 'drizzle-orm';
import { db } from '../../db';
import { NewResource, Resource, resources } from '../../db/schema';
import { ConflictError, InternalError } from '../../shared/errors';

export const resourceService = {
  async createResource(data: NewResource): Promise<Resource> {
    const [existingResource] = await db
      .select()
      .from(resources)
      .where(
        or(
          eq(resources.videoId, data.videoId!),
          eq(resources.playlistId, data.playlistId!)
        )
      );

    if (existingResource) {
      throw new ConflictError(
        `${data.videoId && 'Video already exist'} ${data.playlistId && 'Playlist already exist'}`
      );
    }

    const [newResource] = await db.insert(resources).values(data).returning();

    if (!newResource) {
      throw new InternalError(
        `${data.videoId ? 'Unable to add video' : 'Unable to add playlist'}`
      );
    }

    return newResource;
  },
};
