import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/[id] - Get user by ID
export async function GET(request: NextRequest, context: any) {
  try {
    const { params } = context;
    void request;
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        donorProfile: true,
        hospitalProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(request: NextRequest, context: any) {
  try {
    const { params } = context;
    const body = await request.json();
    const { email, role } = body;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(email && { email }),
        ...(role && { role }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(request: NextRequest, context: any) {
  try {
    const { params } = context;
    void request;
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
