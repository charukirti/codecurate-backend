import { eq, or } from 'drizzle-orm';
import { db } from '../../db';
import { NewResource, Resource, resources } from '../../db/schema';
import { ConflictError, InternalError } from '../../shared/errors';
import {
  PlaylistAPIResponse,
  VideoAPIResponse,
} from '../../types/youtube-api-response';

export const resourceService = {
  prepareVideoData(
    youtubeData: VideoAPIResponse,
    videoLang: string,
    codeLang: string,
    topic: string,
    resourceType: 'video' | 'playlist',
    videoId: string
  ): NewResource {
    return {
      ...youtubeData,
      videoLang: videoLang || youtubeData.defaultAudioLanguage || 'unknown',
      topic: topic,
      type: resourceType,
      codeLang: codeLang,
      videoId: videoId,
    };
  },

  preparePlaylistResource(
    youtubeData: PlaylistAPIResponse,
    playlistId: string,
    codeLang: string,
    topic: string,
    videoLang: string,
    resourceType: 'video' | 'playlist'
  ): NewResource {
    return {
      ...youtubeData,
      videoId: null,
      playlistId: playlistId,
      videoLang: videoLang || 'unknown',
      codeLang: codeLang,
      topic: topic,
      type: resourceType,
    };
  },

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
