/**
 * Types for reciving youtube api response for playlist and video specific.
 * Types for sending data into db specific to playlist and video
 */

type Thumbnail = {
  url: string;
  width: number;
  height: number;
};

export type VideoAPIResponse = {
  title: string;
  publishedAt: string;
  description: string;
  channelId: string;
  channelTitle: string;
  thumbnails: {
    default: Thumbnail;
    medium: Thumbnail;
    high: Thumbnail;
    standard?: Thumbnail;
    maxres?: Thumbnail;
  };
  defaultAudioLanguage: string;
  duration: number;
  viewCount: string;
  likeCount: string;
};

export type PlaylistAPIResponse = {
  publishedAt: string;
  title: string;
  channelId: string;
  description: string;
  thumbnails: {
    default: Thumbnail;
    medium: Thumbnail;
    high: Thumbnail;
    standard?: Thumbnail;
    maxres?: Thumbnail;
  };
  channelTitle: string;
  itemCount: number;
};
