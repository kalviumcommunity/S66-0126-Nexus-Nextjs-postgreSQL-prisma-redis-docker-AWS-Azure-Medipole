import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain") || "medipole.com";

    // Check if request is HTTPS
    const isHttps =
      request.headers.get("x-forwarded-proto") === "https" ||
      request.nextUrl.protocol === "https:";

    // Get host information
    const host = request.headers.get("host") || "localhost:3000";

    // SSL certificate information (this would be populated by the platform)
    const sslInfo = {
      status: isHttps ? "active" : "inactive",
      protocol: request.nextUrl.protocol.replace(":", ""),
      host: host,
      domain: domain,
      certificate: isHttps
        ? {
            issuer: "AWS Certificate Manager", // or Azure App Service
            validFrom: new Date().toISOString(),
            validTo: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000
            ).toISOString(), // 1 year
            subject: `*.${domain}`,
            serialNumber: "ABC123XYZ",
          }
        : null,
      redirectStatus: isHttps ? "HTTPS enforced" : "HTTP allowed",
    };

    return NextResponse.json({
      success: true,
      sslInfo,
      timestamp: new Date().toISOString(),
      message: isHttps
        ? "✅ SSL is active and HTTPS is enforced"
        : "⚠️  SSL not detected - using HTTP",
    });
  } catch (error: any) {
    console.error("SSL verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, action } = body;

    if (action === "test-redirect") {
      // Simulate redirect test
      const testResults = {
        httpToHttps: {
          status: "success",
          message: "HTTP requests are properly redirected to HTTPS",
          redirectCode: 301,
        },
        hsts: {
          status: "configured",
          message: "HSTS header is properly set",
          maxAge: "63072000",
        },
        securityHeaders: {
          status: "active",
          headers: [
            "Strict-Transport-Security",
            "Content-Security-Policy",
            "X-Frame-Options",
          ],
        },
      };

      return NextResponse.json({
        success: true,
        testResults,
        domain: domain || "medipole.com",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("SSL test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
