import { prisma } from "@/lib/prisma";
import {
  handleError,
  handleSuccess,
  ValidationError,
} from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

// GET /api/requests - List all blood requests with optional status filter
export async function GET(request: Request) {
  const startTime = Date.now();
  const context = {
    endpoint: "/api/requests",
    method: "GET",
  };

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(
      1,
      Math.min(100, Number(searchParams.get("limit")) || 10)
    );
    const status = searchParams.get("status")?.trim();
    const skip = (page - 1) * limit;

    if (isNaN(page) || isNaN(limit)) {
      throw new ValidationError("Invalid pagination parameters", {
        page,
        limit,
      });
    }

    const where = status ? { status: status as any } : {};

    logger.debug("Fetching blood requests", {
      metadata: {
        status,
        page,
        limit,
      },
    });

    const [requests, total] = await Promise.all([
      prisma.bloodRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          hospital: {
            select: {
              name: true,
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.bloodRequest.count({ where }),
    ]);

    const duration = Date.now() - startTime;
    logger.info("GET /api/requests completed", {
      metadata: {
        duration,
        requestCount: requests.length,
      },
    });

    return handleSuccess(
      {
        requests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Blood requests retrieved successfully",
      200,
      context
    );
  } catch (error) {
    return handleError(error, context);
  }
}

// POST /api/requests - Create emergency blood request
export async function POST(request: Request) {
  const startTime = Date.now();
  const context = {
    endpoint: "/api/requests",
    method: "POST",
  };

  try {
    const body = await request.json();
    const { hospitalId, bloodGroup, unitsRequired, details } = body;

    // Validate required fields
    if (!hospitalId || !bloodGroup || unitsRequired === undefined) {
      throw new ValidationError("Missing required fields", {
        required: ["hospitalId", "bloodGroup", "unitsRequired"],
        received: {
          hospitalId: !!hospitalId,
          bloodGroup: !!bloodGroup,
          unitsRequired: unitsRequired !== undefined,
        },
      });
    }

    // Validate unitsRequired is a positive number
    if (typeof unitsRequired !== "number" || unitsRequired <= 0) {
      throw new ValidationError("unitsRequired must be a positive number", {
        received: unitsRequired,
      });
    }

    logger.debug("Creating blood request", {
      metadata: {
        hospitalId,
        bloodGroup,
        unitsRequired,
      },
    });

    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        hospitalId,
        bloodGroup,
        unitsRequired,
        details: details || null,
        status: "PENDING",
      },
      include: {
        hospital: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });

    const duration = Date.now() - startTime;
    logger.info("POST /api/requests completed", {
      metadata: {
        duration,
        requestId: bloodRequest.id,
      },
    });

    return handleSuccess(
      bloodRequest,
      "Blood request created successfully",
      201,
      context
    );
  } catch (error) {
    return handleError(error, context);
  }
}
