import { Reviews, Tags, User } from '../../db/schema';

export type reviewData = {
  userId: string;
  resourceId: string;
  reviewText?: string;
  rating: number;
  tagIds: string[];
};

export type ReviewResponse = Reviews & {
  user: Pick<User, 'id' | 'username'>;
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
