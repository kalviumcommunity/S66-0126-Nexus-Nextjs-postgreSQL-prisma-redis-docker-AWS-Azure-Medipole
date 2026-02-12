import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";

/*
  GET /api/hospitals
  - ADMIN → can see all hospitals (with pagination + filter)
  - HOSPITAL → can only see their own hospital profile
*/
export async function GET(request: Request) {
    try {
        const user = authenticate(request);

        const { searchParams } = new URL(request.url);
        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const isVerified = searchParams.get("isVerified");

        const skip = (page - 1) * limit;

        // Base filter (verification filter)
        const baseWhere =
            isVerified !== null
                ? { isVerified: isVerified === "true" }
                : {};

        let where: any = baseWhere;

        if (user.role === "ADMIN") {
            // ADMIN → can see all hospitals (with optional filter)
            where = baseWhere;
        } else if (user.role === "HOSPITAL") {
            // HOSPITAL → can only see their own hospital
            where = {
                ...baseWhere,
                userId: user.id,
            };
        } else {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const [hospitals, total] = await Promise.all([
            prisma.hospitalProfile.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: { email: true },
                    },
                    inventory: true,
                },
            }),
            prisma.hospitalProfile.count({ where }),
        ]);

        return NextResponse.json({
            data: hospitals,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}

/*
  POST /api/hospitals
  - Only ADMIN can create hospital profile
*/
export async function POST(request: Request) {
    try {
        const user = authenticate(request);

        // Only ADMIN can create hospital profile
        if (user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { userId, name, address, latitude, longitude } = body;

        if (!userId || !name || !address) {
            return NextResponse.json(
                { error: "userId, name, and address are required" },
                { status: 400 }
            );
        }

        const hospital = await prisma.hospitalProfile.create({
            data: {
                userId,
                name,
                address,
                latitude,
                longitude,
                isVerified: false,
            },
            include: {
                user: {
                    select: { email: true },
                },
            },
        });

        return NextResponse.json(hospital, { status: 201 });
    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json(
                { error: "Hospital profile already exists for this user" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }
}