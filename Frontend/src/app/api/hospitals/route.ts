import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/hospitals - List all hospitals with optional verification filter
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 10;
        const isVerified = searchParams.get('isVerified');
        const skip = (page - 1) * limit;

        const where = isVerified !== null ? { isVerified: isVerified === 'true' } : {};

        const [hospitals, total] = await Promise.all([
            prisma.hospitalProfile.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            email: true,
                        },
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
        console.error('Error fetching hospitals:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hospitals' },
            { status: 500 }
        );
    }
}

// POST /api/hospitals - Create a new hospital profile
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, name, address, latitude, longitude, isVerified } = body;

        if (!userId || !name || !address) {
            return NextResponse.json(
                { error: 'userId, name, and address are required' },
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
                isVerified: isVerified || false,
            },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(hospital, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Hospital profile already exists for this user' },
                { status: 409 }
            );
        }
        console.error('Error creating hospital:', error);
        return NextResponse.json(
            { error: 'Failed to create hospital profile' },
            { status: 500 }
        );
    }
}
