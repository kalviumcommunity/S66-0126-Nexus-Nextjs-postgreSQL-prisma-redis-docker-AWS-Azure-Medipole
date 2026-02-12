import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";
import { zodErrorResponse } from "@/lib/validation";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = signupSchema.parse(body);

        const { name, email, password, role } = data;

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser)
            return NextResponse.json(
                { success: false, message: "User already exists" },
                { status: 400 }
            );

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: { name, email, password: hashedPassword, role: role || "DONOR" },
        });

        return NextResponse.json({ success: true, message: "Signup successful" });
    } catch (error: any) {
        if (error instanceof ZodError) return zodErrorResponse(error);
        return NextResponse.json({ success: false, message: "Signup failed" }, { status: 500 });
    }
}