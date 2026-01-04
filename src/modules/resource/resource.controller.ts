import { Request, Response, NextFunction } from 'express';
import { createResourceInput } from './resource.schema';
import { extractVideoUrl } from '../../utils/extractVideoUrl';
import { youtubeApiService } from './youtubeapi.service';
import { resourceService } from './resource.service';

export async function getVideoData(
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
