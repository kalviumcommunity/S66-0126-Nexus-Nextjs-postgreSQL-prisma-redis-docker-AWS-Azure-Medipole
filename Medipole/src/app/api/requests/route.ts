import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/requests - List all blood requests with optional status filter
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 10;
        const status = searchParams.get('status');
        const skip = (page - 1) * limit;

        const where = status ? { status: status as any } : {};

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
                    createdAt: 'desc',
                },
            }),
            prisma.bloodRequest.count({ where }),
        ]);

        return NextResponse.json({
            data: requests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching blood requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blood requests' },
            { status: 500 }
        );
    }
}

// POST /api/requests - Create emergency blood request
export async function POST(request: Request) {
    try {
        const body = await request.json();
        try {
            const data = (await import("@/lib/schemas/requestSchema")).requestSchema.parse(body);
            const { hospitalId, bloodGroup, unitsRequired, details } = data;

            const bloodRequest = await prisma.bloodRequest.create({
                data: { hospitalId, bloodGroup, unitsRequired, details, status: 'PENDING' },
                include: { hospital: { select: { name: true, address: true } } },
            });

            return NextResponse.json(bloodRequest, { status: 201 });
        } catch (e: any) {
            const { ZodError } = await import("zod");
            if (e instanceof ZodError) {
                const { zodErrorResponse } = await import("@/lib/validation");
                return zodErrorResponse(e);
            }
            throw e;
        }
    } catch (error) {
        console.error('Error creating blood request:', error);
        return NextResponse.json(
            { error: 'Failed to create blood request' },
            { status: 500 }
        );
    }
}
