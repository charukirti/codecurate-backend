import { Request, Response, NextFunction } from 'express';
import { reviewReplyService } from '../services/reply.service';
import {
  AddReplyInput,
  getRepliesQuerySchema,
  ReviewAndReplyIdParams,
  ReviewAndResourceParams,
  ReviewIdParams,
} from '../reviews.schema';
import { UnauthorizedError } from '../../../shared/errors';
export async function addReply(
  req: Request<ReviewAndResourceParams, {}, AddReplyInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { reviewId } = req.params;

    const { replyText } = req.body;

    const reply = await reviewReplyService.addReply({
      reviewId,
      userId,
      replyText,
    });

    res.status(201).json({
      message: 'Reply added successfully',
      data: reply,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReply(
  req: Request<ReviewAndReplyIdParams, {}, AddReplyInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { reviewId, replyId } = req.params;
    const { replyText } = req.body;

    const reply = await reviewReplyService.updateReply({
      reviewId,
      userId,
      replyId,
      replyText,
    });

    res.status(200).json({
      message: 'Reply updated successfully',
      data: reply,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllReplies(
  req: Request<ReviewIdParams, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const { reviewId } = req.params;
    const { page, limit } = getRepliesQuerySchema.parse(req.query);

    const { replies, pagination } = await reviewReplyService.getAllReplies({
      reviewId,
      page,
      limit,
    });

    res.status(200).json({
      message: 'Fetched all replies successfully',
      data: {
        replies,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReply(
  req: Request<ReviewAndReplyIdParams, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    const { replyId } = req.params;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    await reviewReplyService.deleteReply({ replyId, userId });

    res.status(200).json({
      message: 'Reply deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
