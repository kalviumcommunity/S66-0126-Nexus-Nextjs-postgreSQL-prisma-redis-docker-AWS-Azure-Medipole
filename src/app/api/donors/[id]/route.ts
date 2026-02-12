import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/donors/[id] - Get donor by ID
export async function GET(
    request: NextRequest,
    context: any
) {
    try {
        const { params } = context;
        void request;
        const donor = await prisma.donorProfile.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                    },
                },
                donations: {
                    include: {
                        hospital: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!donor) {
            return NextResponse.json(
                { error: 'Donor not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(donor);
    } catch (error) {
        console.error('Error fetching donor:', error);
        return NextResponse.json(
            { error: 'Failed to fetch donor' },
            { status: 500 }
        );
    }
}

// PATCH /api/donors/[id] - Update donor profile
export async function PATCH(
    request: NextRequest,
    context: any
) {
    try {
        const { params } = context;
        const body = await request.json();
        const { bloodGroup, phone, latitude, longitude, lastDonationDate } = body;

        const donor = await prisma.donorProfile.update({
            where: { id: params.id },
            data: {
                ...(bloodGroup && { bloodGroup }),
                ...(phone && { phone }),
                ...(latitude !== undefined && { latitude }),
                ...(longitude !== undefined && { longitude }),
                ...(lastDonationDate && { lastDonationDate: new Date(lastDonationDate) }),
            },
        });

        return NextResponse.json(donor);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Donor not found' },
                { status: 404 }
            );
        }
        console.error('Error updating donor:', error);
        return NextResponse.json(
            { error: 'Failed to update donor' },
            { status: 500 }
        );
    }
}

// DELETE /api/donors/[id] - Delete donor profile
export async function DELETE(
    request: NextRequest,
    context: any
) {
    try {
        const { params } = context;
        void request;
        await prisma.donorProfile.delete({
            where: { id: params.id },
        });

        return NextResponse.json(
            { message: 'Donor profile deleted successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Donor not found' },
                { status: 404 }
            );
        }
        console.error('Error deleting donor:', error);
        return NextResponse.json(
            { error: 'Failed to delete donor' },
            { status: 500 }
        );
    }
}
