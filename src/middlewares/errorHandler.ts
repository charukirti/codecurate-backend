import type { NextFunction, Request, Response } from "express";
import { AppError, NotFoundError } from "../shared/errors.js";

interface ErrorResponse {
  success: false;
  message: string;
  code?: string | undefined;
  stack?: string | undefined;
}

/**
 * Central error handler middleware
 * 
 * Purpose: Catches All errors in API and sends proper response
 * 
 * How it works: 
 * 1. Checks error is instance of AppError class or unexpected error
 * 2. For custom errors(AppError): send response with proper status code
 * 3. For unexpected errors: Send 500 and hide details in production

*/

export function ErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
  }

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      message: err.message,
      code: err.code,
    };

    // Send error stack only in development
    if (process.env.NODE_ENV === "development" && err.stack) {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  const errorResponse: ErrorResponse = {
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  };

  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(500).json(errorResponse);
}

/**
  404 Handler for handling Non-existing route

  Purpose: Catches request to non-existing routes.
 */

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = new NotFoundError(`Route ${req.originalUrl} `);
  next(error);
}
