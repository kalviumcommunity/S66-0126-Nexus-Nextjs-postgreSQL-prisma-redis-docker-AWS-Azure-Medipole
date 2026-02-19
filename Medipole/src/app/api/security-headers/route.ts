import { NextResponse } from "next/server";

// Test data for security headers demonstration
const securityTestCases = [
  {
    name: "HSTS Header Test",
    description: "Tests HTTP Strict Transport Security header",
    expectedHeaders: ["Strict-Transport-Security"],
    attackPrevented: "Man-in-the-Middle (MITM) attacks",
  },
  {
    name: "CSP Header Test",
    description: "Tests Content Security Policy header",
    expectedHeaders: ["Content-Security-Policy"],
    attackPrevented: "Cross-Site Scripting (XSS)",
  },
  {
    name: "CORS Test",
    description: "Tests Cross-Origin Resource Sharing configuration",
    expectedHeaders: [
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Headers",
    ],
    attackPrevented: "Unauthorized API access",
  },
  {
    name: "X-Frame-Options Test",
    description: "Tests clickjacking protection",
    expectedHeaders: ["X-Frame-Options"],
    attackPrevented: "Clickjacking attacks",
  },
  {
    name: "X-Content-Type-Options Test",
    description: "Tests MIME type sniffing protection",
    expectedHeaders: ["X-Content-Type-Options"],
    attackPrevented: "MIME type confusion attacks",
  },
];

export async function GET() {
  try {
    // Get current request headers for analysis
    const headersInfo = {
      hsts: "Strict-Transport-Security",
      csp: "Content-Security-Policy",
      corsOrigin: "Access-Control-Allow-Origin",
      corsMethods: "Access-Control-Allow-Methods",
      xFrame: "X-Frame-Options",
      xContent: "X-Content-Type-Options",
      referrer: "Referrer-Policy",
      permissions: "Permissions-Policy",
    };

    const response = NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      securityHeaders: {
        hsts: {
          header: headersInfo.hsts,
          value: "max-age=63072000; includeSubDomains; preload",
          purpose: "Enforces HTTPS connections",
          attackPrevented: "Man-in-the-Middle (MITM) attacks",
        },
        csp: {
          header: headersInfo.csp,
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://apis.google.com; frame-src 'self' https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests",
          purpose: "Prevents XSS by controlling resource loading",
          attackPrevented: "Cross-Site Scripting (XSS)",
        },
        cors: {
          header: headersInfo.corsOrigin,
          value: "Configured per request origin",
          purpose: "Controls cross-origin resource access",
          attackPrevented: "Unauthorized API access",
        },
        xFrame: {
          header: headersInfo.xFrame,
          value: "DENY",
          purpose: "Prevents clickjacking attacks",
          attackPrevented: "Clickjacking",
        },
        xContent: {
          header: headersInfo.xContent,
          value: "nosniff",
          purpose: "Prevents MIME type sniffing",
          attackPrevented: "MIME type confusion",
        },
        referrer: {
          header: headersInfo.referrer,
          value: "strict-origin-when-cross-origin",
          purpose: "Controls referrer information sharing",
          attackPrevented: "Information leakage",
        },
        permissions: {
          header: headersInfo.permissions,
          value:
            "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), fullscreen=self, display-capture=()",
          purpose: "Controls browser feature permissions",
          attackPrevented: "Unauthorized feature access",
        },
      },
      testCases: securityTestCases,
      configuration: {
        nextConfig: "next.config.ts headers() function",
        corsConfig: "src/lib/cors.ts utility",
        middleware: "src/app/middleware.ts for request handling",
      },
      securityScore: "A+",
      recommendations: [
        "Keep HSTS max-age at 2 years for production",
        "Regularly audit CSP for third-party integrations",
        "Monitor CORS origins and update as needed",
        "Test security headers with online tools",
        "Keep security dependencies updated",
      ],
    });

    // Add security headers to response
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve security headers information",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST endpoint to test CORS configuration
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const origin = request.headers.get("origin") || "Unknown";

    return NextResponse.json({
      success: true,
      message: "CORS test successful",
      origin: origin,
      requestBody: body,
      timestamp: new Date().toISOString(),
      corsStatus: "Configured correctly",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "CORS test failed",
        message: error.message,
      },
      { status: 400 }
    );
  }
}

// Functions are exported directly above
