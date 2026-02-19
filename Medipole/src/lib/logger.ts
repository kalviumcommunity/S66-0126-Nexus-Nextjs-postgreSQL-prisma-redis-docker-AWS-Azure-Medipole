import { randomUUID } from "crypto";

// Log levels
export type LogLevel = "debug" | "info" | "warn" | "error";

// Log structure
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  correlationId?: string;
  service?: string;
  component?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, any>;
}

// Logger configuration
interface LoggerConfig {
  service: string;
  component: string;
  level: LogLevel;
  format: "json" | "pretty";
}

class StructuredLogger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      service: config.service || "medipole-app",
      component: config.component || "unknown",
      level: config.level || "info",
      format: config.format || "json",
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatLog(entry: LogEntry): string {
    if (this.config.format === "pretty") {
      const timestamp = new Date(entry.timestamp).toISOString();
      const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.service}/${entry.component}]`;
      const message = entry.message;
      const details = Object.entries(entry)
        .filter(
          ([key]) =>
            !["timestamp", "level", "message", "service", "component"].includes(
              key
            )
        )
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(", ");

      return `${prefix} ${message}${details ? ` | ${details}` : ""}`;
    }

    return JSON.stringify(entry);
  }

  private log(
    level: LogLevel,
    message: string,
    data: Partial<LogEntry> = {}
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.config.service,
      component: this.config.component,
      ...data,
    };

    console.log(this.formatLog(entry));
  }

  // Public logging methods
  debug(message: string, data?: Partial<LogEntry>): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: Partial<LogEntry>): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: Partial<LogEntry>): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: Partial<LogEntry>): void {
    this.log("error", message, data);
  }

  // Specialized logging methods
  http(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    data?: Partial<LogEntry>
  ): void {
    this.info(`${method} ${endpoint} ${statusCode}`, {
      ...data,
      metadata: {
        method,
        endpoint,
        statusCode,
        duration,
        ...(data?.metadata || {}),
      },
    });
  }

  database(
    operation: string,
    table: string,
    duration: number,
    data?: Partial<LogEntry>
  ): void {
    this.info(`DB ${operation} on ${table}`, {
      ...data,
      metadata: {
        operation,
        table,
        duration,
        ...(data?.metadata || {}),
      },
    });
  }

  security(
    action: string,
    userId: string,
    ip: string,
    data?: Partial<LogEntry>
  ): void {
    this.info(`Security: ${action}`, {
      ...data,
      metadata: {
        action,
        userId,
        ip,
        ...(data?.metadata || {}),
      },
    });
  }

  // Create child logger with inherited config
  child(config: Partial<LoggerConfig>): StructuredLogger {
    return new StructuredLogger({
      ...this.config,
      ...config,
    });
  }

  // Get current configuration
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Update configuration
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Create default logger instance
export const logger = new StructuredLogger({
  service: "medipole-app",
  component: "main",
  level: (process.env.LOG_LEVEL as LogLevel) || "info",
  format: (process.env.LOG_FORMAT as "json" | "pretty") || "json",
});

// Export logger class for custom instances
export { StructuredLogger };

// Utility functions
export function generateRequestId(): string {
  return randomUUID();
}

export function withRequestLogging<T>(
  handler: (requestId: string) => Promise<T>
): Promise<T> {
  const requestId = generateRequestId();

  logger.info("Request started", { requestId });

  const startTime = Date.now();

  return handler(requestId)
    .then((result) => {
      const duration = Date.now() - startTime;
      logger.info("Request completed", { requestId, duration });
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      logger.error("Request failed", {
        requestId,
        duration,
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
      throw error;
    });
}

// Middleware for Next.js API routes
export function createApiLogger(component: string) {
  const apiLogger = logger.child({ component });

  return {
    logRequest: (method: string, endpoint: string, requestId: string) => {
      apiLogger.info("API request received", {
        requestId,
        method,
        endpoint,
      });
    },

    logResponse: (
      method: string,
      endpoint: string,
      requestId: string,
      statusCode: number,
      duration: number
    ) => {
      apiLogger.http(method, endpoint, statusCode, duration, {
        requestId,
      });
    },

    logError: (
      method: string,
      endpoint: string,
      requestId: string,
      error: Error,
      duration: number
    ) => {
      apiLogger.error("API request failed", {
        requestId,
        method,
        endpoint,
        duration,
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
    },
  };
}
