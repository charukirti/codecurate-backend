import { and, count, desc, eq, like, ne, notInArray, or } from 'drizzle-orm';
import { db } from '../../db';
import { NewResource, Resource, resources } from '../../db/schema';
import {
  ConflictError,
  InternalError,
  NotFoundError,
} from '../../shared/errors';
import {
  PlaylistAPIResponse,
  VideoAPIResponse,
} from '../../types/youtube-api-response';

export const resourceService = {
  /**
   * Prepares video data based on resource type and transforms to match with db schema
   * @param youtubeData : takes youtube api response
   * @param videoLang : takes audio language of the video
   * @param codeLang : takes coding language used in the video
   * @param topic : takes on which topic the video is based on
   * @param resourceType : type of the resource between video and playlist
   * @param videoId : takes extracted videoId from the url
   * @returns data that matches with database schema
   */

  prepareVideoData(
    youtubeData: VideoAPIResponse,
    videoLang: string,
    topic: string,
    resourceType: 'video' | 'playlist',
    videoId: string,
    instructorName: string,
    codeLang?: string,
    description?: string
  ): NewResource {
    return {
      ...youtubeData,
      videoLang: videoLang || youtubeData.defaultAudioLanguage || 'unknown',
      codeLang: codeLang,
      topic: topic,
      type: resourceType,
      videoId: videoId,
      instructorName: instructorName || youtubeData.channelName,
      description: description || null,
    };
  },

  /**
   * Prepares playlist data based on resource type and transforms to match with db schema
   * @param youtubeData : takes youtube api response
   * @param videoLang : takes audio language of the video
   * @param codeLang : takes coding language used in the video
   * @param topic : takes on which topic the video is based on
   * @param resourceType : type of the resource between video and playlist
   * @param playlistId : takes extracted playlistId from the url
   * @returns data that matches with database schema
   */
  preparePlaylistResource(
    youtubeData: PlaylistAPIResponse,
    playlistId: string,
    topic: string,
    videoLang: string,
    resourceType: 'video' | 'playlist',
    instructorName: string,
    codeLang?: string,
    description?: string
  ): NewResource {
    return {
      ...youtubeData,
      videoId: null,
      playlistId: playlistId,
      videoLang: videoLang || 'unknown',
      codeLang: codeLang,
      topic: topic,
      type: resourceType,
      instructorName: instructorName || youtubeData.channelName,
      description: description || null,
    };
  },

  /**
   * Creates a new resource (video or playlist) in the database
   * Checks for duplicates before insertion
   * @param {NewResource} data : The resource data including type, topic, channel info, etc.
   * @returns {Promise<Resource>}: The newly created resource with generated ID and timestamps
   * @throws {ConflictError} : If a resource with the same videoId or playlistId already exists
   * @throws {InternalError} : If database insertion fails
   */

  async createResource(data: NewResource): Promise<Resource> {
    const conditions = [];

    if (data.videoId) {
      conditions.push(eq(resources.videoId, data.videoId));
    }
    if (data.playlistId) {
      conditions.push(eq(resources.playlistId, data.playlistId));
    }

    const [existingResource] = await db
      .select()
      .from(resources)
      .where(or(...conditions));

    if (existingResource) {
      const resourceType = data.type === 'video' ? 'Video' : 'Playlist';
      throw new ConflictError(`${resourceType} already exists`);
    }

    const [newResource] = await db.insert(resources).values(data).returning();

    if (!newResource) {
      throw new InternalError(
        `${data.videoId ? 'Unable to add video' : 'Unable to add playlist'}`
      );
    }

    return newResource;
  },

  /**
   * Retrieves paginated list of resources with optional filters and search
   * Supports filtering by coding language, topic, and resource type
   * Supports searching by title or channel name
   * @param {object} params : Query parameters for filtering and pagination
   * @returns {Promise<Object>} : Object containing data array and pagination metadata
   */

  async getResources(params: {
    search?: string;
    codeLang?: string;
    topic?: string;
    type?: 'video' | 'playlist';
    page: number;
    limit: number;
  }) {
    const { page, limit, codeLang, topic, type, search } = params;
    const offset = (page - 1) * limit;

    let conditions = [];

    if (codeLang) {
      conditions.push(eq(resources.codeLang, codeLang));
    }

    if (topic) {
      conditions.push(eq(resources.topic, topic));
    }

    if (type) {
      conditions.push(eq(resources.type, type));
    }

    if (search?.trim()) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(resources.title, searchTerm),
          like(resources.channelName, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: count() })
      .from(resources)
      .where(whereClause);

    const totalItems = Number(countResult?.count || 0);

    const data = await db
      .select()
      .from(resources)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(resources.createdAt));

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
      },
    };
  },

  /**
   * Retrieves single resource from database
   * @param id : parameter to for getting resource
   * @throws {NotFoundError} : if resource does not exist throws not found error
   * @returns : if resource exist returns data array
   */

  async getResourceById(id: string): Promise<Resource> {
    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id));

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    return resource;
  },

  async getRelatedResources(id: string) {
    const startTime = Date.now();
    const [currentResource] = await db
      .select({
        id: resources.id,
        topic: resources.topic,
        codeLang: resources.codeLang,
      })
      .from(resources)
      .where(eq(resources.id, id));

    if (!currentResource) {
      throw new NotFoundError('Resource does not exist.');
    }

    // phase 1: strict check: all conditions must match

    const conditions = [
      eq(resources.topic, currentResource.topic),
      ne(resources.id, currentResource.id),
    ];

    if (currentResource.codeLang) {
      conditions.push(eq(resources.codeLang, currentResource.codeLang));
    }

    let relatedResources = await db.query.resources.findMany({
      where: and(...conditions),
      limit: 4,
      orderBy: desc(resources.avgRating),
    });

    // phase 2 : fetch by only topic if codeLang not matches

    if (relatedResources.length < 4) {
      // get existing ids

      const existingIds = relatedResources.map((resource) => resource.id);

      // find resources by same topic but should not conflict with existing elements in relatedResources

      const tierTwoConditions = [
        eq(resources.topic, currentResource.topic),
        ne(resources.id, currentResource.id),
        notInArray(resources.id, existingIds),
      ];

      const additionalResources = await db.query.resources.findMany({
        where: and(...tierTwoConditions),
        limit: 4 - relatedResources.length,
        orderBy: desc(resources.avgRating),
      });

      // merge with previously found array

      relatedResources = [...relatedResources, ...additionalResources];
    }

    // phase 3: fetch any resource with any topic

    if (relatedResources.length < 4) {
      const existingIds = relatedResources.map((resource) => resource.id);

      const anyTopRatedResources = await db.query.resources.findMany({
        where: and(
          ne(resources.id, currentResource.id),
          notInArray(resources.id, existingIds)
        ),

        limit: 4 - relatedResources.length,
        orderBy: desc(resources.avgRating),
      });

      relatedResources = [...relatedResources, ...anyTopRatedResources];
    }

    const duration = Date.now() - startTime;
    console.log(`getRelatedResources took ${duration}ms for resource ${id}`);

    return relatedResources;
  },

  /**
   * Deletes single resource from database based on provided id
   * @param id : gets resource id to delete resource
   * @throws {NotFoundError} : if resource does not exist or already deleted throws not found error
   */

  async deleteResourceById(id: string): Promise<void> {
    const [deletedResource] = await db
      .delete(resources)
      .where(eq(resources.id, id))
      .returning();

    if (!deletedResource) {
      throw new NotFoundError('Resource not exist');
    }
  },
};
