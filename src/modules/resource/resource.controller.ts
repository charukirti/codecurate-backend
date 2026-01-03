import { Request, Response, NextFunction } from 'express';
import { createResourceInput } from './resource.schema';
import { extractVideoUrl } from '../../utils/extractVideoUrl';
import { youtubeApiService } from './youtubeapi.service';
import { resourceService } from './resource.service';
import { NewResource } from '../../db/schema';

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

      const resourceData: NewResource = {
        title: youtubeData.title,
        description: youtubeData.description,
        thumbnails: youtubeData.thumbnails,
        publishedAt: new Date(youtubeData.publishedAt),
        channelName: youtubeData.channelTitle,
        channelId: youtubeData.channelId,
        videoId: videoId,
        viewCount: Number(youtubeData.viewCount),
        likeCount: Number(youtubeData.likeCount),
        videoLang: videoLang || youtubeData.defaultAudioLanguage,
        codeLang: codeLang,
        topic: topic,
        type: resourceType,
        durationSeconds: youtubeData.duration,
      };
      savedResource = await resourceService.createResource(resourceData);
    } else {
      youtubeData = await youtubeApiService.getPlaylistDetails(playlistId!);
      const resourceData: NewResource = {
        playlistId: playlistId,
        channelId: youtubeData.channelId,
        channelName: youtubeData.channelTitle,
        title: youtubeData.title,
        description: youtubeData.description,
        itemCount: youtubeData.itemCount,
        thumbnails: youtubeData.thumbnails,
        codeLang: codeLang,
        topic: topic,
        videoLang: videoLang || 'unknown',
        type: resourceType,
        publishedAt: new Date(youtubeData.publishedAt),
      };
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
