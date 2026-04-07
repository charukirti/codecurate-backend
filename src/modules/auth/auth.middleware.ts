import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors.js';
import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth.config.js';

/**
 * Middleware to validate JWT token for authenticated users
 * @param req - Express request object containing authorization header
 * @param res - Express response object
 * @param next - Express next middleware function
 * @throws {UnauthorizedError} if token is missing, invalid, or expired
 */

export function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer')) {
      throw new UnauthorizedError('No access token provided');
    }

    const token = header.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Token is missing');
    }

    const decoded = jwt.verify(token, authConfig.access_secret) as {
      userId: string;
      role: 'admin' | 'user';
      isVerified: boolean;
    };

    req.userId = decoded.userId;
    req.role = decoded.role;
    req.isVerified = decoded.isVerified;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Invalid token'));
    }

    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Token has been expired'));
    }

    next(error);
  }
}

/**
 * Middleware to optionally verify JWT token for authenticated users
 * If token is valid, userId and role will be added to request object
 * If token is missing or invalid, request will proceed without authentication
 * @param req - Express request object containing authorization header
 * @param res - Express response object
 * @param next - Express next middleware function
 */

export function optionalVerifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer')) {
      return next();
    }

    const token = header.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, authConfig.access_secret) as {
      userId: string;
      role: 'admin' | 'user';
    };

    req.userId = decoded.userId;
    req.role = decoded.role;

    next();
  } catch {
    next();
  }
}

/**
 * Middleware to verify authenticated user has admin role
 * @param req - Express request object with user role from token
 * @param res - Express response object
 * @param next - Express next middleware function
 * @throws {ForbiddenError} if user is not an admin
 */

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.role !== 'admin') {
    return next(new ForbiddenError('Only admin can access this route'));
  }
  next();
}

/**
 * Middleware to verify authenticated user has verified email
 * @param req - Express request object with isVerified flag from token
 * @param res - Express response object
 * @param next - Express next middleware function
 * @throws {ForbiddenError} if user's email is not verified
 */

export function requireVerified(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.isVerified) {
    return next(
      new ForbiddenError('Email verification is required to access this route')
    );
  }
  next();
}
