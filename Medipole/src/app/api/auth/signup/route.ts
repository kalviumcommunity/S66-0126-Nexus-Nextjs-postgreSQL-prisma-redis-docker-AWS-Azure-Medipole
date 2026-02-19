import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json(
        { success: false, message: "All fields required" },
        { status: 400 }
      );

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser)
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || "DONOR";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    if (userRole === "DONOR") {
      await prisma.donorProfile.create({
        data: {
          userId: user.id,
          bloodGroup: "O_POSITIVE",
        },
      });
    } else if (userRole === "HOSPITAL") {
      await prisma.hospitalProfile.create({
        data: {
          userId: user.id,
          name: name,
          address: "",
        },
      });
    } else if (userRole === "NGO") {
      await prisma.nGOProfile.create({
        data: {
          userId: user.id,
          organizationName: name,
        },
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: "Signup successful",
      userId: user.id,
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Signup failed" },
      { status: 500 }
    );
  }
}
