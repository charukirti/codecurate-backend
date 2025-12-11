import type { Request, Response, NextFunction } from 'express';
import { SignUpInput } from './auth.schema';
import { authService } from './auth.service';

export async function signUp(
  req: Request<{}, {}, SignUpInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await authService.signUp(req.body);

    res.status(201).json({
      message: 'User created successfully',
      user: user,
    });
  } catch (error) {
    next(error);
  }
}
