import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

const protectedPaths = [
  "/api/users",
  "/api/admin",
  "/api/inventory",
  "/api/requests",
  "/api/donors",
  "/api/hospitals",
];

const publicPaths = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/inventory",
  "/api/requests",
  "/api/donors",
  "/api/hospitals",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  if (!isProtectedPath || isPublicPath) {
    return NextResponse.next();
  }

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

    if (pathname.startsWith("/api/admin") && decoded.role !== "ADMIN") {
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

export const config = {
  matcher: [
    "/api/users/:path*",
    "/api/admin/:path*",
    "/api/inventory/:path*",
    "/api/requests/:path*",
    "/api/donors/:path*",
    "/api/hospitals/:path*",
  ],
};
