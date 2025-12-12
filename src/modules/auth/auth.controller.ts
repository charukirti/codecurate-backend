import type { Request, Response, NextFunction } from 'express';
import { SignInInput, SignUpInput } from './auth.schema';
import { authService } from './auth.service';
import appConfig from '../../config/app.config';

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

export async function signIn(
  req: Request<{}, {}, SignInInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const { accessToken, refreshToken, userData } = await authService.signIn(
      req.body
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: appConfig.node_env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'User signed in successfully',
      user: userData,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}
