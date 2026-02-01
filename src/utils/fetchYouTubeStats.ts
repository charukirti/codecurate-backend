import axios from 'axios';
import appConfig from '../config/app.config';
import { NotFoundError } from '../shared/errors';
import { StatsData } from '../modules/resource/resource.types';

export async function fetchYouTubeStats(
  videoId: string | null
): Promise<StatsData> {
  const response = await axios.get(`${appConfig.yt_api_url}/videos`, {
    params: {
      id: videoId,
      part: 'statistics',
      key: appConfig.yt_api_key,
    },
  });

  const items = response.data.items;

  if (!items || items.length === 0) {
    throw new NotFoundError('Video not found');
  }

  const video = items[0];
  const stats = video.statistics;

  return {
    viewCount: parseInt(stats.viewCount),
    likeCount: parseInt(stats.likeCount),
  };
}
