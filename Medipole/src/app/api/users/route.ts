import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import {
  handleError,
  handleSuccess,
  ValidationError,
} from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

const CACHE_TTL = 60; 

export async function GET(request: Request) {
  const startTime = Date.now();
  const context = {
    endpoint: "/api/users",
    method: "GET",
  };

  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(
      1,
      Math.min(100, Number(searchParams.get("limit")) || 10)
    );

    if (isNaN(page) || isNaN(limit)) {
      throw new ValidationError("Invalid pagination parameters", {
        page,
        limit,
      });
    }

    const skip = (page - 1) * limit;

    // 🔑 Important: Cache key must include pagination
    const cacheKey = `users:list:page=${page}:limit=${limit}`;

    const cached = await redis.get(cacheKey);

    if (cached) {
      logger.debug("Cache Hit - Users List", {
        context,
        page,
        limit,
      });

      const duration = Date.now() - startTime;

      logger.perf("GET /api/users (cached)", duration, true, {
        context,
      });

      return handleSuccess(
        JSON.parse(cached),
        "Users retrieved successfully (cached)",
        200,
        context
      );
    }

    logger.debug("Cache Miss - Fetching from DB", {
      context,
      page,
      limit,
      skip,
    });

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    const responsePayload = {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await redis.set(
      cacheKey,
      JSON.stringify(responsePayload),
      "EX",
      CACHE_TTL
    );

    const duration = Date.now() - startTime;

    logger.perf("GET /api/users", duration, true, {
      context,
      userCount: users.length,
    });

    return handleSuccess(
      responsePayload,
      "Users retrieved successfully",
      200,
      context
    );

  } catch (error) {
    return handleError(error, context);
  }
}

export async function POST(request: Request) {
  const context = {
    endpoint: "/api/users",
    method: "POST",
  };

  try {
    const body = await request.json();

    const newUser = await prisma.user.create({
      data: body,
    });

    // 🔥 IMPORTANT:
    // Invalidate ALL paginated caches
    const keys = await redis.keys("users:list:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    logger.info("User created & cache invalidated", {
      context,
      userId: newUser.id,
    });

    return handleSuccess(
      newUser,
      "User created successfully",
      201,
      context
    );

  } catch (error) {
    return handleError(error, context);
  }
}