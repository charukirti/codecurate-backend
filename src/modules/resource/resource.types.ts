import { Resource } from '../../db/schema';

export type StatsData = {
  viewCount: number;
  likeCount: number;
};

export type CachedStats = {
  data: StatsData;
  timestamp: number;
};

export type ResourceWithStats = Resource & StatsData;
