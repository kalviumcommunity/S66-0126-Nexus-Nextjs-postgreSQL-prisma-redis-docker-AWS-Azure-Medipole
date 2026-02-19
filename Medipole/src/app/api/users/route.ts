import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import {
  handleError,
  handleSuccess,
  ValidationError,
} from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

const CACHE_TTL = 60;

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve a paginated list of users
 *     description: Get all users with pagination support. Results are cached for performance.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [DONOR, HOSPITAL, NGO, ADMIN]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
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
        metadata: {
          page,
          limit,
        },
      });

      const duration = Date.now() - startTime;

      logger.info("GET /api/users (cached) completed", {
        metadata: {
          duration,
        },
      });

      return handleSuccess(
        JSON.parse(cached),
        "Users retrieved successfully (cached)",
        200,
        context
      );
    }

    logger.debug("Cache Miss - Fetching from DB", {
      metadata: {
        page,
        limit,
        skip,
      },
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

    await redis.set(cacheKey, JSON.stringify(responsePayload), "EX", CACHE_TTL);

    const duration = Date.now() - startTime;

    logger.info("GET /api/users completed", {
      metadata: {
        duration,
        userCount: users.length,
      },
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

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user in the system. Requires admin privileges.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [DONOR, HOSPITAL, NGO, ADMIN]
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
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
      metadata: {
        userId: newUser.id,
      },
    });

    return handleSuccess(newUser, "User created successfully", 201, context);
  } catch (error) {
    return handleError(error, context);
  }
}
