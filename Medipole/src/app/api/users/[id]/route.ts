import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

const CACHE_TTL = 60;

export async function GET(_request: NextRequest, context: any) {
  try {
    const { params } = context;
    const userId = params.id;
    const cacheKey = `users:${userId}`;

    // 1️⃣ Check Redis
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("🟢 Cache Hit - Single User");
      return NextResponse.json(JSON.parse(cached));
    }

    console.log("🔴 Cache Miss - Fetching from DB");

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // 2️⃣ Store in cache
    await redis.set(cacheKey, JSON.stringify(user), "EX", CACHE_TTL);

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: any) {
  try {
    const { params } = context;
    const userId = params.id;

    const body = await request.json();
    const { email, role } = body;

    const user = await prisma.user.update({
      where: { id: userId },
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

    // 🔥 Invalidate cache properly
    await redis.del(`users:${userId}`);

    // Invalidate ALL paginated list caches
    const listKeys = await redis.keys("users:list:*");
    if (listKeys.length > 0) {
      await redis.del(...listKeys);
    }

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

export async function DELETE(_request: NextRequest, context: any) {
  try {
    const { params } = context;
    const userId = params.id;

    await prisma.user.delete({
      where: { id: userId },
    });

    // 🔥 Invalidate cache
    await redis.del(`users:${userId}`);

    const listKeys = await redis.keys("users:list:*");
    if (listKeys.length > 0) {
      await redis.del(...listKeys);
    }

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
