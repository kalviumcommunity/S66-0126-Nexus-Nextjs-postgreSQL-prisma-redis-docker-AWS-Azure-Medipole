import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/inventory - Get all inventory with optional filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const hospitalId = searchParams.get('hospitalId');
        const bloodGroup = searchParams.get('bloodGroup');
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (hospitalId) where.hospitalId = hospitalId;
        if (bloodGroup) where.bloodGroup = bloodGroup;

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

        return NextResponse.json({
            data: inventory,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return NextResponse.json(
            { error: 'Failed to fetch inventory' },
            { status: 500 }
        );
    }
}

// POST /api/inventory - Add inventory entry
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { hospitalId, bloodGroup, units } = body;

        if (!hospitalId || !bloodGroup || units === undefined) {
            return NextResponse.json(
                { error: 'hospitalId, bloodGroup, and units are required' },
                { status: 400 }
            );
        }

        const inventory = await prisma.inventory.create({
            data: {
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

        return NextResponse.json(inventory, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Inventory entry already exists for this hospital and blood group' },
                { status: 409 }
            );
        }
        console.error('Error creating inventory:', error);
        return NextResponse.json(
            { error: 'Failed to create inventory entry' },
            { status: 500 }
        );
    }
}
