import { prisma } from "@/lib/prisma";
import {
  handleError,
  handleSuccess,
  ValidationError,
} from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

// GET /api/inventory - Get all inventory with optional filters
export async function GET(request: Request) {
  const startTime = Date.now();
  const context = {
    endpoint: "/api/inventory",
    method: "GET",
  };

  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get("hospitalId")?.trim();
    const bloodGroup = searchParams.get("bloodGroup")?.trim();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.max(
      1,
      Math.min(100, Number(searchParams.get("limit")) || 10)
    );
    const skip = (page - 1) * limit;

    if (isNaN(page) || isNaN(limit)) {
      throw new ValidationError("Invalid pagination parameters", {
        page,
        limit,
      });
    }

    const where: any = {};
    if (hospitalId) where.hospitalId = hospitalId;
    if (bloodGroup) where.bloodGroup = bloodGroup;

    logger.debug("Fetching inventory", {
      metadata: {
        filters: { hospitalId, bloodGroup },
        page,
        limit,
      },
    });

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
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
      }),
      prisma.inventory.count({ where }),
    ]);

    const duration = Date.now() - startTime;
    logger.info("GET /api/inventory completed", {
      metadata: {
        duration,
        itemCount: inventory.length,
      },
    });

    return handleSuccess(
      {
        inventory,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Inventory retrieved successfully",
      200,
      context
    );
  } catch (error) {
    return handleError(error, context);
  }
}

// POST /api/inventory - Add inventory entry
export async function POST(request: Request) {
  const startTime = Date.now();
  const context = {
    endpoint: "/api/inventory",
    method: "POST",
  };

  try {
    const body = await request.json();
    const { hospitalId, bloodGroup, units } = body;

    // Validate required fields
    if (!hospitalId || !bloodGroup || units === undefined) {
      throw new ValidationError("Missing required fields", {
        required: ["hospitalId", "bloodGroup", "units"],
        received: {
          hospitalId: !!hospitalId,
          bloodGroup: !!bloodGroup,
          units: units !== undefined,
        },
      });
    }

    // Validate units is a positive number
    if (typeof units !== "number" || units < 0) {
      throw new ValidationError("Units must be a non-negative number", {
        received: units,
      });
    }

    logger.debug("Creating/updating inventory entry", {
      metadata: {
        hospitalId,
        bloodGroup,
        units,
      },
    });

    const inventory = await prisma.inventory.upsert({
      where: {
        hospitalId_bloodGroup: {
          hospitalId,
          bloodGroup,
        },
      },
      update: {
        units: { increment: units },
      },
      create: {
        hospitalId,
        bloodGroup,
        units,
      },
      include: {
        hospital: {
          select: {
            name: true,
          },
        },
      },
    });

    const duration = Date.now() - startTime;
    logger.info("POST /api/inventory completed", {
      metadata: {
        duration,
        inventoryId: inventory.id,
      },
    });

    return handleSuccess(
      inventory,
      "Inventory entry created successfully",
      201,
      context
    );
  } catch (error) {
    return handleError(error, context);
  }
}
