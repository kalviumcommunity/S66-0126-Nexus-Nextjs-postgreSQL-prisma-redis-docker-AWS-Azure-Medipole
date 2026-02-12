import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/jwt";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user)
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid)
            return NextResponse.json(
                { success: false, message: "Invalid credentials" },
                { status: 401 }
            );

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        return NextResponse.json({
            success: true,
            message: "Login successful",
            token,
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "Login failed" },
            { status: 500 }
        );
    }
}