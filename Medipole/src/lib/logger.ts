/* eslint-disable @typescript-eslint/no-explicit-any, no-console */

/**
 * Structured Logger Utility
 *
 * This module provides a centralized logging mechanism with structured JSON output
 * for better observability and debugging across all environments.
 *
 * Features:
 * - Environment-aware logging (dev shows full details, prod redacts sensitive info)
 * - Structured JSON format for easy parsing by log aggregation tools
 * - Timestamps and request context tracking
 * - Performance monitoring with duration tracking
 */

export interface LogContext {
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  [key: string]: any;
}

export interface LogMeta {
  context?: LogContext;
  duration?: number; // in milliseconds
  stack?: string;
  [key: string]: any;
}

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

/**
 * Config for sensitive fields that should be redacted in production
 */
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "secret",
  "apiKey",
  "Authorization",
  "accessToken",
  "refreshToken",
];

/**
 * Redact sensitive information from objects
 */
function redactSensitiveData(obj: any): any {
  if (!isProduction || !obj || typeof obj !== "object") {
    return obj;
  }

  const redacted = { ...obj };
  for (const field of SENSITIVE_FIELDS) {
    if (field in redacted) {
      redacted[field] = "[REDACTED]";
    }
  }
  return redacted;
}

/**
 * Format log output based on environment
 */
function formatLog(
  level: "info" | "warn" | "error" | "debug",
  message: string,
  meta?: LogMeta
) {
  const timestamp = new Date().toISOString();

  const logEntry: any = {
    timestamp,
    level,
    message,
    environment: process.env.NODE_ENV || "unknown",
  };

  if (meta) {
    const { context, duration, stack, ...rest } = meta;

    if (context) {
      logEntry.context = redactSensitiveData(context);
    }

    if (duration !== undefined) {
      logEntry.duration_ms = duration;
    }

    // In production, redact stack traces; in development, show them
    if (stack) {
      logEntry.stack = isDevelopment ? stack : "[REDACTED]";
    }

    // Add remaining metadata
    logEntry.meta = redactSensitiveData(rest);
  }

  return logEntry;
}

/**
 * Logger object with methods for different log levels
 */
export const logger = {
  /**
   * Log informational messages
   */
  info: (message: string, meta?: LogMeta) => {
    const logEntry = formatLog("info", message, meta);
    console.log(JSON.stringify(logEntry));
  },

  /**
   * Log warning messages
   */
  warn: (message: string, meta?: LogMeta) => {
    const logEntry = formatLog("warn", message, meta);
    console.warn(JSON.stringify(logEntry));
  },

  /**
   * Log error messages with stack traces
   */
  error: (message: string, meta?: LogMeta) => {
    const logEntry = formatLog("error", message, meta);
    console.error(JSON.stringify(logEntry));
  },

  /**
   * Log debug messages (only shown in development)
   */
  debug: (message: string, meta?: LogMeta) => {
    if (isDevelopment) {
      const logEntry = formatLog("debug", message, meta);
      console.debug(JSON.stringify(logEntry));
    }
  },

  /**
   * Convenience method for logging with context
   */
  withContext: (context: LogContext) => {
    return {
      info: (message: string, meta?: Omit<LogMeta, "context">) =>
        logger.info(message, { ...meta, context }),
      warn: (message: string, meta?: Omit<LogMeta, "context">) =>
        logger.warn(message, { ...meta, context }),
      error: (message: string, meta?: Omit<LogMeta, "context">) =>
        logger.error(message, { ...meta, context }),
      debug: (message: string, meta?: Omit<LogMeta, "context">) =>
        logger.debug(message, { ...meta, context }),
    };
  },

  /**
   * Log performance metrics
   */
  perf: (operation: string, duration: number, success: boolean, meta?: any) => {
    const level = success ? "info" : "warn";
    logger[level](`Performance: ${operation}`, {
      duration,
      success,
      ...meta,
    });
  },
};
