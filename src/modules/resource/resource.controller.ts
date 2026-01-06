import { Request, Response, NextFunction } from 'express';
import { createResourceInput, getResourcesQuery } from './resource.schema';
import { extractVideoUrl } from '../../utils/extractVideoUrl';
import { youtubeApiService } from './youtubeapi.service';
import { resourceService } from './resource.service';

export async function createResource(
  req: Request<{}, {}, createResourceInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const { url, codeLang, videoLang, topic, resourceType } = req.body;

    const { videoId, playlistId } = extractVideoUrl(url);

    let youtubeData;
    let savedResource;

    if (videoId) {
      youtubeData = await youtubeApiService.getVideoDetails(videoId!);

      const resourceData = resourceService.prepareVideoData(
        youtubeData,
        videoLang!,
        codeLang,
        topic,
        resourceType,
        videoId
      );

      savedResource = await resourceService.createResource(resourceData);
    } else {
      youtubeData = await youtubeApiService.getPlaylistDetails(playlistId!);

      const resourceData = resourceService.preparePlaylistResource(
        youtubeData,
        playlistId!,
        codeLang,
        topic,
        videoLang!,
        resourceType
      );

      savedResource = await resourceService.createResource(resourceData);
    }

    res.status(201).json({
      message: `${videoId ? 'video data extracted successfully' : 'Playlist data extracted successfully'}`,

      data: savedResource,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllResources(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      search,
      codeLang,
      topic,
      type,
      page = 1,
      limit = 10,
    } = req.query as unknown as getResourcesQuery;

    const { data, pagination } = await resourceService.getResources({
      search,
      codeLang,
      topic,
      type,
      page,
      limit,
    });

    res.status(200).json({
      message: 'Fetched all resources successfully',
      data,
      pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const resource = await resourceService.getResourceById(id!);

    res.status(200).json({
      message: 'Fetched resource successfully',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    await resourceService.deleteResourceById(id!);

    res.status(200).json({
      message: 'resource deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
