import { Request, Response, NextFunction } from 'express';
import { userService } from './users.service';
import {
  DeleteUserInput,
  getUserReviewsQuerySchema,
  UpdateUserInput,
  UsersReviewsParam,
} from './users.schema';
import { UnauthorizedError, ValidationError } from '../../shared/errors';

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const user = await userService.getProfile(userId);

    res.status(200).json({
      message: 'user data retrived successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: Request<{}, {}, UpdateUserInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const data = req.body;

    const user = await userService.updateProfile(userId, data);

    res.status(200).json({
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserReviews(
  req: Request<UsersReviewsParam, {}, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const { username } = req.params;
    const { page, limit, sort } = getUserReviewsQuerySchema.parse(req.query);

    const { reviews, pagination } = await userService.getUserReviews({
      username,
      page,
      limit,
      sort,
    });

    res.status(200).json({
      message: 'User reviews retrieved successfully',
      data: {
        reviews,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: Request<{}, {}, DeleteUserInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const { password, confirmDeletion } = req.body;

    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (!confirmDeletion) {
      throw new ValidationError('You must confirm account deletion');
    }

    await userService.deleteUser(userId, password);

    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
}
