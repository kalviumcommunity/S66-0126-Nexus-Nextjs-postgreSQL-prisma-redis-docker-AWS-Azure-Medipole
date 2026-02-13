import { prisma } from "@/lib/prisma";
import {
  handleError,
  handleSuccess,
  ValidationError,
} from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

// GET /api/users - List all users with pagination
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

    logger.debug("Fetching users", {
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

    const duration = Date.now() - startTime;
    logger.perf("GET /api/users", duration, true, {
      context,
      userCount: users.length,
    });

    return handleSuccess(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Users retrieved successfully",
      200,
      context
    );
  } catch (error) {
    return handleError(error, context);
  }
}
