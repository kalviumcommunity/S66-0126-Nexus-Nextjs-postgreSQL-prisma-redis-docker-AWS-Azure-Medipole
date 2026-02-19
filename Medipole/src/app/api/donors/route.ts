/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "@/lib/prisma";
import {
  handleError,
  handleSuccess,
  ValidationError,
} from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

// GET /api/donors - List all donors with optional blood group filter
/**
 * @swagger
 * /api/donors:
 *   get:
 *     summary: Retrieve a paginated list of donors
 *     description: Get all donor profiles with optional blood group filtering and pagination.
 *     tags: [Donors]
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
 *         description: Number of donors per page
 *       - in: query
 *         name: bloodGroup
 *         schema:
 *           type: string
 *           enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *         description: Filter donors by blood group
 *     responses:
 *       200:
 *         description: Donors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 donors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       bloodGroup:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       latitude:
 *                         type: number
 *                       longitude:
 *                         type: number
 *                       user:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                           role:
 *                             type: string
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
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request) {
  const startTime = Date.now();
  const context = {
    endpoint: "/api/donors",
    method: "GET",
  };

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(
      1,
      Math.min(100, Number(searchParams.get("limit")) || 10)
    );
    const bloodGroup = searchParams.get("bloodGroup")?.trim();
    const skip = (page - 1) * limit;

    if (isNaN(page) || isNaN(limit)) {
      throw new ValidationError("Invalid pagination parameters", {
        page,
        limit,
      });
    }

    const where = bloodGroup ? { bloodGroup: bloodGroup as any } : {};

    logger.debug("Fetching donors", {
      metadata: {
        page,
        limit,
        bloodGroup,
      },
    });

    const [donors, total] = await Promise.all([
      prisma.donorProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.donorProfile.count({ where }),
    ]);

    const duration = Date.now() - startTime;
    logger.info("GET /api/donors completed", {
      metadata: {
        duration,
        donorCount: donors.length,
      },
    });

    return handleSuccess(
      {
        donors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Donors retrieved successfully",
      200,
      context
    );
  } catch (error) {
    return handleError(error, context);
  }
}

// POST /api/donors - Create a new donor profile
/**
 * @swagger
 * /api/donors:
 *   post:
 *     summary: Create a new donor profile
 *     description: Create a donor profile for an existing user with blood group and location information.
 *     tags: [Donors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - bloodGroup
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to create donor profile for
 *               bloodGroup:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *               phone:
 *                 type: string
 *                 description: Contact phone number
 *               latitude:
 *                 type: number
 *                 description: Geographic latitude
 *               longitude:
 *                 type: number
 *                 description: Geographic longitude
 *     responses:
 *       201:
 *         description: Donor profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 bloodGroup:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 latitude:
 *                   type: number
 *                 longitude:
 *                   type: number
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
  const startTime = Date.now();
  const context = {
    endpoint: "/api/donors",
    method: "POST",
  };

  try {
    const body = await request.json();
    const { userId, bloodGroup, phone, latitude, longitude } = body;

    // Validate required fields
    if (!userId || !bloodGroup) {
      throw new ValidationError("Missing required fields", {
        required: ["userId", "bloodGroup"],
        received: { userId: !!userId, bloodGroup: !!bloodGroup },
      });
    }

    logger.debug("Creating donor profile", {
      metadata: {
        userId,
        bloodGroup,
      },
    });

    const donor = await prisma.donorProfile.create({
      data: {
        userId,
        bloodGroup,
        phone: phone || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    const duration = Date.now() - startTime;
    logger.info("POST /api/donors completed", {
      metadata: {
        duration,
        donorId: donor.id,
      },
    });

    return handleSuccess(
      donor,
      "Donor profile created successfully",
      201,
      context
    );
  } catch (error: any) {
    return handleError(error, context);
  }
}
