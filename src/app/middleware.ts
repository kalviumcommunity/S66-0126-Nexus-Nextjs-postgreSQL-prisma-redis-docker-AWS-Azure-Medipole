import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Only protect these routes
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

            // Attach user info for downstream handlers (optional)
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
    matcher: ["/api/users/:path*", "/api/admin/:path*"],
};