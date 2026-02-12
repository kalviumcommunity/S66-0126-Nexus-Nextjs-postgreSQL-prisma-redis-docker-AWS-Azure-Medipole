import { verifyToken } from "./jwt";
import { NextResponse } from "next/server";

export function authenticate(req: Request) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) throw new Error("No token");

    return verifyToken(token);
}