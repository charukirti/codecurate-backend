export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    if (process.env.NODE_ENV === "development") {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication Required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbidenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConfilctError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class InternalError extends AppError {
  constructor(message: string = "Internal server error") {
    super(message, 500, "INTERNAL_ERROR");
  }
}
