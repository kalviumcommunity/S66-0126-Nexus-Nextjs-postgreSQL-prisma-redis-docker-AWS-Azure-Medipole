import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Attempt to count users as a simple connection test
        const userCount = await prisma.user.count();
        return NextResponse.json({
            status: 'success',
            message: 'Database connection successful!',
            data: { userCount }
        });
    } catch (error) {
        console.error('Database connection failed:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
