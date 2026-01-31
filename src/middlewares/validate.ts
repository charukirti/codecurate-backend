import z from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../shared/errors';

/**
 * Middleware to validate request with zod scheams
 * * It validates `req.body`, `req.params` simultaneously
 * @throws {ValidationError} - if validation fails
 * @param validators - Object containing optional zod schemas for body, query and params
 * @returns Express middleware function
 */

interface RequestValidators {
  body?: z.ZodType;
  params?: z.ZodType;
}

export const validate = (validators: RequestValidators) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (validators.params) {
        validators.params.parse(req.params);
      }

      if (validators.body) {
        req.body = validators.body.parse(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0];
        const field = firstIssue?.path.join('.') || undefined;

        let message;

        if (firstIssue?.code === 'invalid_type' && firstIssue.path.length > 0) {
          const fieldName = firstIssue.path.join('.');
          message = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        } else {
          message = firstIssue?.message;
        }

        return next(new ValidationError(message!, field));
      }

      next(error);
    }
  };
};
