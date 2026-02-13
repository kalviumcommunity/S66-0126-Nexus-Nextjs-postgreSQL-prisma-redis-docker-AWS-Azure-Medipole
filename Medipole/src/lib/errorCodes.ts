/**
 * Standardized Error Codes for Medipole API
 *
 * This file defines common error codes used throughout the application
 * to ensure consistent error handling and easier debugging.
 */

export const ERROR_CODES = {
  // Validation Errors (400 series)
  VALIDATION_ERROR: "E001",
  MISSING_REQUIRED_FIELD: "E002",
  INVALID_FORMAT: "E003",
  INVALID_CREDENTIALS: "E004",

  // Authentication & Authorization Errors (401/403 series)
  UNAUTHORIZED: "E101",
  FORBIDDEN: "E102",
  TOKEN_EXPIRED: "E103",
  INVALID_TOKEN: "E104",
  INSUFFICIENT_PERMISSIONS: "E105",

  // Resource Errors (404/409 series)
  NOT_FOUND: "E201",
  ALREADY_EXISTS: "E202",
  CONFLICT: "E203",

  // Database Errors (500 series)
  DATABASE_FAILURE: "E301",
  CONNECTION_ERROR: "E302",
  TRANSACTION_FAILED: "E303",
  QUERY_ERROR: "E304",

  // External Service Errors (500 series)
  EXTERNAL_SERVICE_ERROR: "E401",
  SERVICE_UNAVAILABLE: "E402",
  TIMEOUT_ERROR: "E403",

  // Internal Errors (500 series)
  INTERNAL_ERROR: "E500",
  UNEXPECTED_ERROR: "E501",
  NOT_IMPLEMENTED: "E502",

  // Business Logic Errors (400 series)
  BUSINESS_RULE_VIOLATION: "E601",
  INVALID_OPERATION: "E602",
  QUOTA_EXCEEDED: "E603",
} as const;

/**
 * Type-safe error codes
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Error categories for grouping similar errors
 */
export const ERROR_CATEGORIES = {
  VALIDATION: "VALIDATION",
  AUTHENTICATION: "AUTHENTICATION",
  AUTHORIZATION: "AUTHORIZATION",
  RESOURCE: "RESOURCE",
  DATABASE: "DATABASE",
  EXTERNAL: "EXTERNAL",
  INTERNAL: "INTERNAL",
  BUSINESS: "BUSINESS",
} as const;

/**
 * HTTP status code mappings for error categories
 */
export const ERROR_STATUS_CODES: Record<string, number> = {
  [ERROR_CATEGORIES.VALIDATION]: 400,
  [ERROR_CATEGORIES.AUTHENTICATION]: 401,
  [ERROR_CATEGORIES.AUTHORIZATION]: 403,
  [ERROR_CATEGORIES.RESOURCE]: 404,
  [ERROR_CATEGORIES.DATABASE]: 500,
  [ERROR_CATEGORIES.EXTERNAL]: 502,
  [ERROR_CATEGORIES.INTERNAL]: 500,
  [ERROR_CATEGORIES.BUSINESS]: 400,
};
