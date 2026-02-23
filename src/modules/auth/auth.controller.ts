import type { Request, Response, NextFunction } from 'express';
import {
  SignInInput,
  SignUpInput,
  verifyEmailQuerySchema,
} from './auth.schema';
import { authService } from './auth.service';
import appConfig from '../../config/app.config';
import { UnauthorizedError } from '../../shared/errors';

export async function signUp(
  req: Request<{}, {}, SignUpInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await authService.signUp(req.body);

    res.status(201).json({
      message: 'User created successfully',
      data: user,
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
      data: userData,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function signOut(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedError('User not authenticated');
    }
    await authService.signOut(userId);

    res.clearCookie('refreshToken');

    res.status(200).json({
      message: 'User successfully signed out',
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshToken(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: appConfig.node_env === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'New refresh token generated',
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = verifyEmailQuerySchema.parse(req.query);

    await authService.verifyEmail(token);

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
}
