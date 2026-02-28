/**
 * cache map that stores youtube videos like count and view count for 24 hrs.
 */

import { CachedStats, StatsData } from './resource.types.js';

const CACHE_TTL = 24 * 60 * 60 * 1000;

const cache = new Map<string, CachedStats>();

export const statsCache = {
  get(videoId: string): StatsData | null {
    const item = cache.get(videoId);

    if (!item) return null;

    if (Date.now() - item.timestamp > CACHE_TTL) {
      cache.delete(videoId);
      return null;
    }

    return { viewCount: item.data.viewCount, likeCount: item.data.likeCount };
  },

  set(videoId: string, data: StatsData) {
    cache.set(videoId, {
      data,
      timestamp: Date.now(),
    });
  },
};
