import { Request, Response, NextFunction } from 'express';
import { userService } from './users.service';
import { UpdateUserInput } from './users.schema';

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    const user = await userService.getProfile(userId!);

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
    const userId = req.userId!;
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
