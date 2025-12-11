import type { Request, Response, NextFunction } from 'express';
import z from 'zod';
import { ValidationError } from '../shared/errors';

export const validate = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
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
