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
  publishedAt: Date;
  rawDescription: string;
  channelId: string;
  channelName: string;
  thumbnails: {
    default: Thumbnail;
    medium: Thumbnail;
    high: Thumbnail;
    standard?: Thumbnail;
    maxres?: Thumbnail;
  };
  defaultAudioLanguage: string;
  durationSeconds: number;
};

export type PlaylistAPIResponse = {
  publishedAt: Date;
  title: string;
  channelId: string;
  rawDescription: string;
  thumbnails: {
    default: Thumbnail;
    medium: Thumbnail;
    high: Thumbnail;
    standard?: Thumbnail;
    maxres?: Thumbnail;
  };
  channelName: string;
  itemCount: number;
};
