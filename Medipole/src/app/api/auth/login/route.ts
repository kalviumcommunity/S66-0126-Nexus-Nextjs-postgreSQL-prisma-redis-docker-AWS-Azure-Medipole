import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/jwt";
import { loginSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";
import { zodErrorResponse } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid)
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return NextResponse.json({ success: true, message: "Login successful", token });
  } catch (error: any) {
    if (error instanceof ZodError) return zodErrorResponse(error);
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 });
  }
}