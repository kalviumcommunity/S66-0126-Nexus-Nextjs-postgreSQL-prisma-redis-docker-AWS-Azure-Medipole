import { NextResponse } from "next/server";

/**
 * Unified API Response Handler
 *
 * This utility provides consistent response formatting across all API endpoints
 * to improve developer experience and observability.
 */

/**
 * Send a successful response with standardized format
 *
 * @param data - The response data payload
 * @param message - Success message (default: "Success")
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with standardized success format
 */
export const sendSuccess = (data: any, message = "Success", status = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Send an error response with standardized format
 *
 * @param message - Error message (default: "Something went wrong")
 * @param code - Error code for identification (default: "INTERNAL_ERROR")
 * @param status - HTTP status code (default: 500)
 * @param details - Additional error details for debugging
 * @returns NextResponse with standardized error format
 */
export const sendError = (
  message = "Something went wrong",
  code = "INTERNAL_ERROR",
  status = 500,
  details?: any
) => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code,
        details,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Send a validation error response (400 Bad Request)
 *
 * @param message - Validation error message
 * @param details - Field-specific validation details
 * @returns NextResponse with 400 status
 */
export const sendValidationError = (
  message = "Validation failed",
  details?: any
) => {
  return sendError(message, "VALIDATION_ERROR", 400, details);
};

/**
 * Send a not found error response (404 Not Found)
 *
 * @param message - Not found message
 * @returns NextResponse with 404 status
 */
export const sendNotFound = (message = "Resource not found") => {
  return sendError(message, "NOT_FOUND", 404);
};

/**
 * Send an unauthorized error response (401 Unauthorized)
 *
 * @param message - Unauthorized message
 * @returns NextResponse with 401 status
 */
export const sendUnauthorized = (message = "Unauthorized access") => {
  return sendError(message, "UNAUTHORIZED", 401);
};

/**
 * Send a forbidden error response (403 Forbidden)
 *
 * @param message - Forbidden message
 * @returns NextResponse with 403 status
 */
export const sendForbidden = (message = "Access forbidden") => {
  return sendError(message, "FORBIDDEN", 403);
};
