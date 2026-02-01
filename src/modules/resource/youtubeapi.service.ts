import axios from 'axios';
import {
  PlaylistAPIResponse,
  VideoAPIResponse,
} from '../../types/youtube-api-response';
import appConfig from '../../config/app.config';
import { NotFoundError } from '../../shared/errors';
import { parseISOtoSeconds } from '../../utils/parseToSeconds';

export const youtubeApiService = {
  async getVideoDetails(videoId: string): Promise<VideoAPIResponse> {
    const response = await axios.get(`${appConfig.yt_api_url}/videos`, {
      params: {
        id: videoId,
        part: 'snippet,contentDetails,statistics',
        key: appConfig.yt_api_key,
      },
    });

    const items = response.data.items;

    if (!items || items.length === 0) {
      throw new NotFoundError('Video does not exists');
    }

    const video = items[0];
    const snippet = video.snippet;
    const content = video.contentDetails;

    const duration = parseISOtoSeconds(content.duration);

    return {
      title: snippet.title,
      rawDescription: snippet.description,
      channelId: snippet.channelId,
      publishedAt: new Date(snippet.publishedAt),
      channelName: snippet.channelTitle,
      thumbnails: snippet.thumbnails,
      defaultAudioLanguage: snippet.defaultAudioLanguage,
      durationSeconds: duration || 0,
    };
  },

  async getPlaylistDetails(playlistId: string): Promise<PlaylistAPIResponse> {
    const response = await axios.get(`${appConfig.yt_api_url}/playlists`, {
      params: {
        id: playlistId,
        part: 'snippet,contentDetails',
        key: appConfig.yt_api_key,
      },
    });

    const items = response.data.items;

    if (!items || items.length === 0) {
      throw new NotFoundError('Playlist does not exists');
    }

    const playlist = items[0];

    const snippet = playlist.snippet;
    const content = playlist.contentDetails;

    return {
      channelId: snippet.channelId,
      channelName: snippet.channelTitle,
      title: snippet.title,
      rawDescription: snippet.description,
      thumbnails: snippet.thumbnails,
      itemCount: content.itemCount,
      publishedAt: new Date(snippet.publishedAt),
    };
  },
};
