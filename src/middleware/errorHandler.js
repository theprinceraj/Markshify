import logger from '../utilities/logger.js';

/**
 * Custom error class for application-specific errors with status codes.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for input validation failures.
 */
export class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/**
 * Processing error for OCR and image processing failures.
 */
export class ProcessingError extends AppError {
  constructor(message, details = {}) {
    super(message, 422, 'PROCESSING_ERROR');
    this.details = details;
  }
}

/**
 * Database error for Firebase operation failures.
 */
export class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 503, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * Global error handling middleware.
 * Provides consistent error responses and logging.
 */
export function errorHandler(err, req, res, next) {
  // Default to 500 if no status code
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log the error with context
  logger.error('Request error', {
    error: err,
    requestId: req.requestId,
    path: req.path,
    method: req.method,
    statusCode,
    isOperational,
  });

  // Don't expose internal errors in production
  const message = isOperational 
    ? err.message 
    : 'An unexpected error occurred. Please try again later.';

  // Build error response
  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Async handler wrapper to catch errors in async route handlers.
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function with error handling
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not found handler for undefined routes.
 */
export function notFoundHandler(req, res, next) {
  const error = new AppError(`Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND');
  next(error);
}
