import { Reviews, ReviewTag, Tags } from '../../db/schema';

export type reviewData = {
  userId: string;
  resourceId: string;
  reviewText?: string;
  rating: number;
  tagIds: string[];
};

export type ReviewWithTags = Reviews & {
  reviewTags: (ReviewTag & { tag: Tags })[];
};
