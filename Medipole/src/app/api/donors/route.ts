/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "@/lib/prisma";
import {
  handleError,
  handleSuccess,
  ValidationError,
} from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

// GET /api/donors - List all donors with optional blood group filter
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

    const where = bloodGroup ? { bloodGroup } : {};

    logger.debug("Fetching donors", {
      context,
      page,
      limit,
      bloodGroup,
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
    logger.perf("GET /api/donors", duration, true, {
      context,
      donorCount: donors.length,
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
      context,
      userId,
      bloodGroup,
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
    logger.perf("POST /api/donors", duration, true, {
      context,
      donorId: donor.id,
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
