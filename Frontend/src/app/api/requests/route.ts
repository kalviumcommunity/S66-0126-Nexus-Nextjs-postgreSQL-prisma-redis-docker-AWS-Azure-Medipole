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
        const { hospitalId, bloodGroup, unitsRequired, details } = body;

        if (!hospitalId || !bloodGroup || !unitsRequired) {
            return NextResponse.json(
                { error: 'hospitalId, bloodGroup, and unitsRequired are required' },
                { status: 400 }
            );
        }

        const bloodRequest = await prisma.bloodRequest.create({
            data: {
                hospitalId,
                bloodGroup,
                unitsRequired,
                details,
                status: 'PENDING',
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

        return NextResponse.json(bloodRequest, { status: 201 });
    } catch (error) {
        console.error('Error creating blood request:', error);
        return NextResponse.json(
            { error: 'Failed to create blood request' },
            { status: 500 }
        );
    }
}
