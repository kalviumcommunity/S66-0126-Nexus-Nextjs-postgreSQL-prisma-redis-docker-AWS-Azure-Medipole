import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/requests/[id] - Get blood request by ID
export async function GET(
    request: NextRequest,
    context: any
) {
    try {
        const { params } = context;
        void request;
        const bloodRequest = await prisma.bloodRequest.findUnique({
            where: { id: params.id },
            include: {
                hospital: {
                    select: {
                        name: true,
                        address: true,
                        latitude: true,
                        longitude: true,
                    },
                },
            },
        });

        if (!bloodRequest) {
            return NextResponse.json(
                { error: 'Blood request not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(bloodRequest);
    } catch (error) {
        console.error('Error fetching blood request:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blood request' },
            { status: 500 }
        );
    }
}

// PATCH /api/requests/[id] - Update blood request status
export async function PATCH(
    request: NextRequest,
    context: any
) {
    try {
        const { params } = context;
        const body = await request.json();
        const { status, details } = body;

        const bloodRequest = await prisma.bloodRequest.update({ where: { id: params.id }, data: { ...(status && { status }), ...(details && { details }) } });

        return NextResponse.json(bloodRequest);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Blood request not found' },
                { status: 404 }
            );
        }
        console.error('Error updating blood request:', error);
        return NextResponse.json(
            { error: 'Failed to update blood request' },
            { status: 500 }
        );
    }
}

// DELETE /api/requests/[id] - Cancel/delete blood request
export async function DELETE(
    request: NextRequest,
    context: any
) {
    try {
        const { params } = context;
        void request;
        await prisma.bloodRequest.delete({
            where: { id: params.id },
        });

        return NextResponse.json(
            { message: 'Blood request cancelled successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Blood request not found' },
                { status: 404 }
            );
        }
        console.error('Error deleting blood request:', error);
        return NextResponse.json(
            { error: 'Failed to cancel blood request' },
            { status: 500 }
        );
    }
}
