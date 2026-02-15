import { NewResource, Resource } from '../../db/schema';
import {
  ConflictError,
  InternalError,
  NotFoundError,
} from '../../shared/errors';
import {
  PlaylistAPIResponse,
  VideoAPIResponse,
} from '../../types/youtube-api-response';
import { ResourceWithStats, StatsData } from './resource.types';
import { statsCache } from './resource.utils';
import { youtubeApiService } from './youtubeapi.service';
import { resourceRepository } from './resource.repository';

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
    // const conditions = [];
    let existingResource;

    if (data.videoId) {
      existingResource = await resourceRepository.findByVideoId(data.videoId);
    }
    if (data.playlistId) {
      existingResource = await resourceRepository.findByPlaylistId(
        data.playlistId
      );
    }

    if (existingResource) {
      const resourceType = data.type === 'video' ? 'Video' : 'Playlist';
      throw new ConflictError(`${resourceType} already exists`);
    }

    const newResource = await resourceRepository.create(data);

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

    const totalItems = await resourceRepository.countResources({
      codeLang,
      topic,
      type,
      search,
    });

    const data = await resourceRepository.findAllPaginated({
      search,
      topic,
      type,
      limit,
      offset,
    });

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
   * Retrieves single resource from database with viewCount and likeCount
   * @param id : parameter to for getting resource
   * @throws {NotFoundError} : if resource does not exist throws not found error
   * @returns {ResourceWithStats}: returns resource data with viewCount and likeCount
   */

  async getResourceById(id: string): Promise<ResourceWithStats> {
    const resource = await resourceRepository.findById(id);

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    let dynamicStas: StatsData = { viewCount: 0, likeCount: 0 };

    if (resource.type === 'video' && resource.videoId) {
      const { videoId } = resource;

      const cached = statsCache.get(videoId);

      if (cached) {
        dynamicStas = cached;
      } else {
        const freshStats = await youtubeApiService.getYouTubeStats(videoId);

        statsCache.set(videoId, freshStats);

        dynamicStas = freshStats;
      }
    }

    return {
      ...resource,
      ...dynamicStas,
    };
  },

  /**
   * retrieves at least 4 related resource based on the current resource's topic, codeLang.
   * uses three tier system to gather related resource
   * @param id : an id of the current resource (video/playlist)
   * @returns {Resource[]} : array of related resources(video/playlist)
   */

  async getRelatedResources(id: string): Promise<Resource[]> {
    const currentResource = await resourceRepository.findBasicById(id);

    if (!currentResource) {
      throw new NotFoundError('Resource does not exist.');
    }

    let relatedResources: Resource[] = [];

    if (currentResource.codeLang) {
      relatedResources = await resourceRepository.findRelatedByTopicAndCodeLang(
        currentResource.id,
        currentResource.topic,
        currentResource.codeLang,
        4
      );
    }

    if (relatedResources.length < 4) {
      const existingIds = relatedResources.map((resource) => resource.id);

      const additionalResources = await resourceRepository.findRelatedByTopic(
        currentResource.id,
        currentResource.topic,
        existingIds,
        4 - relatedResources.length
      );

      // merge with previously found array

      relatedResources = [...relatedResources, ...additionalResources];
    }

    // phase 3: fetch any resource with any topic

    if (relatedResources.length < 4) {
      const existingIds = relatedResources.map((resource) => resource.id);

      const additionalResources = await resourceRepository.findTopRated(
        currentResource.id,
        existingIds,
        4 - relatedResources.length
      );

      relatedResources = [...relatedResources, ...additionalResources];
    }

    return relatedResources;
  },

  /**
   * Deletes single resource from database based on provided id
   * @param id : gets resource id to delete resource
   * @throws {NotFoundError} : if resource does not exist or already deleted throws not found error
   */

  async deleteResourceById(id: string): Promise<void> {
    const deletedResource = await resourceRepository.delete(id);

    if (!deletedResource) {
      throw new NotFoundError('Resource not exist');
    }
  },
};
