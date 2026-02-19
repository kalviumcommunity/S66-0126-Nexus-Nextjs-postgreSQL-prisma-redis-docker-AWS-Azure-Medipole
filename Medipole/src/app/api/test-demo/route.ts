/**
 * Error Handler Demo/Test Route
 *
 * This route demonstrates the centralized error handling system in action.
 * It provides various endpoints to trigger different types of errors and
 * test the responses in both development and production environments.
 */

import { handleError, handleSuccess } from "@/lib/errorHandler";
import {
  ValidationError,
  DatabaseError,
  AuthenticationError,
} from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

/**
 * GET /api/test-demo?type=<error-type>
 *
 * Query parameters:
 * - type: The type of test to run
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const testType = url.searchParams.get("type") || "success";

  const context = {
    endpoint: "/api/test-demo",
    method: "GET",
    testType,
  };

  try {
    logger.info("Starting test request", { context });

    // Route handling based on test type
    switch (testType) {
      case "success":
        return handleSuccess(
          {
            message: "Test successful!",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "unknown",
          },
          "Success test passed",
          200,
          context
        );

      case "validation-error":
        throw new ValidationError("Missing required parameters", {
          missing_fields: ["userId", "email"],
          provided_fields: ["name"],
        });

      case "db-error":
        throw new DatabaseError("Database connection timeout", {
          connection_string: "[REDACTED]",
          timeout_ms: 5000,
          retry_count: 3,
        });

      case "auth-error":
        throw new AuthenticationError("Invalid authentication token");

      case "internal-error":
        throw new Error("Unexpected internal error - simulated for testing");

      case "not-found": {
        const NotFoundError = (await import("@/lib/errorHandler"))
          .NotFoundError;
        throw new NotFoundError("User");
      }

      case "authorization-error": {
        const AuthorizationError = (await import("@/lib/errorHandler"))
          .AuthorizationError;
        throw new AuthorizationError("You do not have permission");
      }

      case "business-error": {
        const BusinessError = (await import("@/lib/errorHandler"))
          .BusinessError;
        throw new BusinessError("Insufficient inventory for blood donation", {
          required: 5,
          available: 2,
        });
      }

      default:
        throw new ValidationError(`Unknown test type: ${testType}`, {
          available_types: [
            "success",
            "validation-error",
            "db-error",
            "auth-error",
            "internal-error",
            "not-found",
            "authorization-error",
            "business-error",
          ],
        });
    }
  } catch (error) {
    return handleError(error, context);
  }
}
