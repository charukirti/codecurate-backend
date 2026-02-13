import { db } from '../../db';
import { Reviews, Tags, UserData } from '../../db/schema';

export type reviewData = {
  userId: string;
  resourceId: string;
  reviewText?: string;
  rating: number;
  tagIds: string[];
};

export type ReviewResponse = Reviews & {
  user: Pick<UserData, 'id' | 'username'>;
  tags: Tags[];
};

export type PaginatedReviewsResponse = {
  reviews: ReviewResponse[];
  pagination: {
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
};

/* ---- Return type for addReply ---- */

export type replyResponse = {
  id: string;
  username: string;
  replyText: string;
  createdAt: Date | null;
};

/* ---- Return type for getAllReply ---- */

export type paginatedRepliesResponse = {
  replies: {
    id: string;
    replyText: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    user: { username: string };
  }[];
  pagination: {
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/* --------- reviews repository types ----------- */

export type createReviewData = {
  userId: string;
  resourceId: string;
  reviewText?: string;
  rating: number;
};

export type ReviewWithRelations = Reviews & {
  user: {
    id: string;
    username: string;
  };
  reviewTags: {
    reviewId: string;
    tagId: string;
    tag: Tags;
  }[];
};
