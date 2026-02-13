import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/inventory/[id] - Get inventory by ID
export async function GET(request: NextRequest, context: any) {
  try {
    const { params } = context;
    void request;
    const inventory = await prisma.inventory.findUnique({
      where: { id: params.id },
      include: {
        hospital: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// PATCH /api/inventory/[id] - Update inventory units
export async function PATCH(request: NextRequest, context: any) {
  try {
    const { params } = context;
    const body = await request.json();
    const { units } = body;

    if (units === undefined) {
      return NextResponse.json({ error: "units is required" }, { status: 400 });
    }

    const inventory = await prisma.inventory.update({
      where: { id: params.id },
      data: { units },
    });

    return NextResponse.json(inventory);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[id] - Delete inventory entry
export async function DELETE(request: NextRequest, context: any) {
  try {
    const { params } = context;
    void request;
    await prisma.inventory.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Inventory entry deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting inventory:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory" },
      { status: 500 }
    );
  }
}
