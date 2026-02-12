import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/hospitals/[id] - Get hospital by ID
export async function GET(
    request: NextRequest,
    context: any
) {
    try {
        const { params } = context;
        void request;
        const hospital = await prisma.hospitalProfile.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
                inventory: true,
                requests: true,
            },
        });

        if (!hospital) {
            return NextResponse.json(
                { error: 'Hospital not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(hospital);
    } catch (error) {
        console.error('Error fetching hospital:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hospital' },
            { status: 500 }
        );
    }
}

// PATCH /api/hospitals/[id] - Update hospital profile
export async function PATCH(
    request: NextRequest,
    context: any
) {
    try {
        const { params } = context;
        const body = await request.json();
        const { name, address, latitude, longitude, isVerified } = body;

        const hospital = await prisma.hospitalProfile.update({
            where: { id: params.id },
            data: {
                ...(name && { name }),
                ...(address && { address }),
                ...(latitude !== undefined && { latitude }),
                ...(longitude !== undefined && { longitude }),
                ...(isVerified !== undefined && { isVerified }),
            },
        });

        return NextResponse.json(hospital);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Hospital not found' },
                { status: 404 }
            );
        }
        console.error('Error updating hospital:', error);
        return NextResponse.json(
            { error: 'Failed to update hospital' },
            { status: 500 }
        );
    }
}

// DELETE /api/hospitals/[id] - Delete hospital profile
export async function DELETE(
    request: NextRequest,
    context: any
) {
    try {
        const { params } = context;
        void request;
        await prisma.hospitalProfile.delete({
            where: { id: params.id },
        });

        return NextResponse.json(
            { message: 'Hospital profile deleted successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Hospital not found' },
                { status: 404 }
            );
        }
        console.error('Error deleting hospital:', error);
        return NextResponse.json(
            { error: 'Failed to delete hospital' },
            { status: 500 }
        );
    }
}
