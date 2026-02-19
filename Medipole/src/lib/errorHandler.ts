/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Centralized Error Handler Utility
 *
 * This module provides unified error handling across all API routes.
 * It integrates with the logger for structured logging and responseHandler
 * for consistent API responses.
 *
 * Key Features:
 * - Classifies errors by type (Validation, Database, Authentication, etc.)
 * - Environment-aware responses (detailed in dev, safe messages in prod)
 * - Integrated structured logging with context
 * - Custom error types for business logic errors
 */

import { NextResponse } from "next/server";
import { logger } from "./logger";
import { sendError, sendSuccess } from "./responseHandler";
import { ERROR_CODES, ERROR_CATEGORIES } from "./errorCodes";

// Define LogContext type for error handling
interface LogContext {
  endpoint?: string;
  method?: string;
  [key: string]: any;
}

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Custom Application Error Class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public category: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Validation Error - Use for input validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      ERROR_CODES.VALIDATION_ERROR,
      ERROR_CATEGORIES.VALIDATION,
      400,
      details
    );
    this.name = "ValidationError";
  }
}

/**
 * Database Error - Use for database operation failures
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      ERROR_CODES.DATABASE_FAILURE,
      ERROR_CATEGORIES.DATABASE,
      500,
      details
    );
    this.name = "DatabaseError";
  }
}

/**
 * Authentication Error - Use for auth failures
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed", details?: any) {
    super(
      message,
      ERROR_CODES.UNAUTHORIZED,
      ERROR_CATEGORIES.AUTHENTICATION,
      401,
      details
    );
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization Error - Use for permission/access failures
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Access forbidden", details?: any) {
    super(
      message,
      ERROR_CODES.FORBIDDEN,
      ERROR_CATEGORIES.AUTHORIZATION,
      403,
      details
    );
    this.name = "AuthorizationError";
  }
}

/**
 * Not Found Error - Use for missing resources
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(
      `${resource} not found`,
      ERROR_CODES.NOT_FOUND,
      ERROR_CATEGORIES.RESOURCE,
      404
    );
    this.name = "NotFoundError";
  }
}

/**
 * Business Logic Error - Use for application-specific business rule violations
 */
export class BusinessError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      ERROR_CODES.BUSINESS_RULE_VIOLATION,
      ERROR_CATEGORIES.BUSINESS,
      400,
      details
    );
    this.name = "BusinessError";
  }
}

/**
 * Classify errors and determine appropriate response
 */
function classifyError(error: any): {
  message: string;
  code: string;
  category: string;
  statusCode: number;
  details?: any;
  isAppError: boolean;
} {
  // Handle custom AppError instances
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      category: error.category,
      statusCode: error.statusCode,
      details: error.details,
      isAppError: true,
    };
  }

  // Handle Prisma validation errors
  if (error?.code === "P2025") {
    // Record not found
    return {
      message: "Resource not found",
      code: ERROR_CODES.NOT_FOUND,
      category: ERROR_CATEGORIES.RESOURCE,
      statusCode: 404,
      isAppError: false,
    };
  }

  if (error?.code?.startsWith("P202")) {
    // Unique constraint violation
    return {
      message: "This resource already exists",
      code: ERROR_CODES.ALREADY_EXISTS,
      category: ERROR_CATEGORIES.RESOURCE,
      statusCode: 409,
      details: isDevelopment ? error.meta : undefined,
      isAppError: false,
    };
  }

  if (error?.code?.startsWith("P")) {
    // Other Prisma errors
    return {
      message: "Database operation failed",
      code: ERROR_CODES.DATABASE_FAILURE,
      category: ERROR_CATEGORIES.DATABASE,
      statusCode: 500,
      details: isDevelopment ? error.meta : undefined,
      isAppError: false,
    };
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return {
      message: error.message || "An unexpected error occurred",
      code: ERROR_CODES.INTERNAL_ERROR,
      category: ERROR_CATEGORIES.INTERNAL,
      statusCode: 500,
      isAppError: false,
    };
  }

  // Handle unknown errors
  return {
    message: "An unexpected error occurred",
    code: ERROR_CODES.UNEXPECTED_ERROR,
    category: ERROR_CATEGORIES.INTERNAL,
    statusCode: 500,
    isAppError: false,
  };
}

/**
 * Main error handler function
 *
 * @param error - The error object to handle
 * @param context - Context information (endpoint, method, userId, etc.)
 * @returns NextResponse with appropriate error response
 */
export function handleError(error: any, context?: LogContext): NextResponse {
  const { message, code, category, statusCode, details, isAppError } =
    classifyError(error);

  const userMessage = isDevelopment
    ? message
    : getProductionErrorMessage(statusCode);

  // Log the error with full details
  logger.error(`Error in ${context?.endpoint || "API"}`, {
    metadata: {
      endpoint: context?.endpoint,
      method: context?.method,
      stack: error instanceof Error ? error.stack : undefined,
      errorCode: code,
      category,
      statusCode,
      details: isDevelopment ? details : undefined,
      isApplicationError: isAppError,
    },
  });

  // Return standardized error response
  return sendError(
    userMessage,
    code,
    statusCode,
    isDevelopment ? { message, details, stack: error?.stack } : undefined
  );
}

/**
 * Get user-friendly error message for production
 */
function getProductionErrorMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "Authentication required. Please log in.",
    403: "You do not have permission to access this resource.",
    404: "The requested resource was not found.",
    409: "This resource already exists.",
    500: "Something went wrong. Please try again later.",
    502: "Service temporarily unavailable. Please try again later.",
    503: "Service is under maintenance. Please try again later.",
  };

  return messages[statusCode] || messages[500];
}

/**
 * Async error handler wrapper for route handlers
 * Automatically catches and handles errors in async operations
 *
 * @param handler - The async handler function
 * @param context - Context information for logging
 * @returns Wrapped handler function
 */
export function withErrorHandler(
  handler: (req: Request) => Promise<NextResponse>,
  context?: Omit<LogContext, "endpoint" | "method">
) {
  return async (req: Request): Promise<NextResponse> => {
    const startTime = Date.now();
    const { pathname } = new URL(req.url);
    const handlerContext: LogContext = {
      endpoint: pathname,
      method: req.method,
      ...context,
    };

    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;

      logger.info(`${req.method} ${pathname} completed`, {
        metadata: {
          duration,
          statusCode: response.status,
        },
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.info(`${req.method} ${pathname} failed`, {
        metadata: {
          duration,
        },
      });

      return handleError(error, handlerContext);
    }
  };
}

/**
 * Success response wrapper with automatic logging
 *
 * @param data - Response data
 * @param message - Success message
 * @param statusCode - HTTP status code (default: 200)
 * @param context - Context information for logging
 * @returns NextResponse with success response
 */
export function handleSuccess(
  data: any,
  message: string = "Success",
  statusCode: number = 200,
  context?: LogContext
): NextResponse {
  logger.info(`Success response from ${context?.endpoint || "API"}`, {
    metadata: {
      endpoint: context?.endpoint,
      method: context?.method,
      statusCode,
    },
  });

  return sendSuccess(data, message, statusCode);
}
