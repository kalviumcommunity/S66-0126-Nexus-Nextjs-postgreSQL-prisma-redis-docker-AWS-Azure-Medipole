import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  if (pathname === "/" || pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Protected page routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/users")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // API routes protection
  if (
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/admin")
  ) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing" },
        { status: 401 }
      );
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // ADMIN-only protection
      if (
        pathname.startsWith("/api/admin") &&
        decoded.role !== "ADMIN"
      ) {
        return NextResponse.json(
          { success: false, message: "Access denied" },
          { status: 403 }
        );
      }

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", decoded.id);
      requestHeaders.set("x-user-role", decoded.role);

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/api/users/:path*",
    "/api/admin/:path*",
  ],
};