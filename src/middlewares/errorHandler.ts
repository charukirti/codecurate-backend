import type { NextFunction, Request, Response } from "express";
import { AppError, NotFoundError } from "../shared/errors.js";

interface ErrorResponse {
  success: false;
  message: string;
  code?: string | undefined;
  stack?: string | undefined;
}

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

// error handler for non-existing routes

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error = new NotFoundError(`Route ${req.originalUrl} `);
  next(error);
}
