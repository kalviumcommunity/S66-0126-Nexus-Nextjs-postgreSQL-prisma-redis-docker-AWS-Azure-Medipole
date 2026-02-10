import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/donors - List all donors with optional blood group filter
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 10;
        const bloodGroup = searchParams.get('bloodGroup');
        const skip = (page - 1) * limit;

        const where = bloodGroup ? { bloodGroup: bloodGroup as any } : {};

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

        return NextResponse.json({
            data: donors,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching donors:', error);
        return NextResponse.json(
            { error: 'Failed to fetch donors' },
            { status: 500 }
        );
    }
}

// POST /api/donors - Create a new donor profile
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, bloodGroup, phone, latitude, longitude } = body;

        if (!userId || !bloodGroup) {
            return NextResponse.json(
                { error: 'userId and bloodGroup are required' },
                { status: 400 }
            );
        }

        const donor = await prisma.donorProfile.create({
            data: {
                userId,
                bloodGroup,
                phone,
                latitude,
                longitude,
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

        return NextResponse.json(donor, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Donor profile already exists for this user' },
                { status: 409 }
            );
        }
        console.error('Error creating donor:', error);
        return NextResponse.json(
            { error: 'Failed to create donor profile' },
            { status: 500 }
        );
    }
}
