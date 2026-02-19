import { NextRequest, NextResponse } from "next/server";

// CORS configuration
const CORS_CONFIG = {
  // Allowed origins - update with your production domains
  allowedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://your-production-domain.com",
    "https://www.your-production-domain.com",
  ],

  // Allowed HTTP methods
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],

  // Allowed headers
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-Api-Key",
    "X-Client-Version",
  ],

  // Exposed headers
  exposedHeaders: ["Content-Length", "X-Request-ID"],

  // Max age for preflight requests (24 hours)
  maxAge: 86400,

  // Allow credentials
  allowCredentials: true,
};

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflight(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");

  // Check if origin is allowed
  if (!origin || !isOriginAllowed(origin)) {
    return null;
  }

  const response = new NextResponse(null, { status: 204 });

  // Set CORS headers
  setCorsHeaders(response, origin);

  return response;
}

/**
 * Set CORS headers for API responses
 */
export function setCorsHeaders(response: NextResponse, origin: string): void {
  response.headers.set("Access-Control-Allow-Origin", origin);

  if (CORS_CONFIG.allowCredentials) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    CORS_CONFIG.allowedMethods.join(", ")
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    CORS_CONFIG.allowedHeaders.join(", ")
  );

  response.headers.set(
    "Access-Control-Expose-Headers",
    CORS_CONFIG.exposedHeaders.join(", ")
  );

  response.headers.set("Access-Control-Max-Age", CORS_CONFIG.maxAge.toString());
}

/**
 * Check if origin is in allowed list
 */
function isOriginAllowed(origin: string): boolean {
  // For development, allow localhost
  if (process.env.NODE_ENV === "development") {
    return (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("https://localhost:") ||
      CORS_CONFIG.allowedOrigins.includes(origin)
    );
  }

  // For production, check against allowed origins
  return CORS_CONFIG.allowedOrigins.includes(origin);
}

/**
 * Get allowed origins for debugging
 */
export function getAllowedOrigins(): string[] {
  if (process.env.NODE_ENV === "development") {
    return [
      ...CORS_CONFIG.allowedOrigins,
      "http://localhost:3000",
      "http://localhost:3001",
    ];
  }
  return CORS_CONFIG.allowedOrigins;
}

/**
 * Security middleware for API routes
 */
export function withSecurityHeaders(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      const preflightResponse = handleCorsPreflight(request);
      if (preflightResponse) {
        return preflightResponse;
      }
    }

    // Process the actual request
    const response = await handler(request);

    // Add security headers to response
    const origin = request.headers.get("origin");
    if (origin && isOriginAllowed(origin)) {
      setCorsHeaders(response, origin);
    }

    return response;
  };
}

// Export configuration for external use
export { CORS_CONFIG };
export default {
  handleCorsPreflight,
  setCorsHeaders,
  isOriginAllowed,
  getAllowedOrigins,
  withSecurityHeaders,
  CORS_CONFIG,
};
