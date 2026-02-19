import { NextResponse } from "next/server";

// Mock user data for SWR demonstration
const mockUsers = [
  {
    id: 1,
    email: "john.doe@example.com",
    role: "USER",
    createdAt: "2026-01-15T10:30:00Z",
  },
  {
    id: 2,
    email: "jane.smith@example.com",
    role: "ADMIN",
    createdAt: "2026-01-20T14:45:00Z",
  },
  {
    id: 3,
    email: "bob.wilson@example.com",
    role: "USER",
    createdAt: "2026-02-01T09:15:00Z",
  },
];

export async function GET() {
  try {
    // Simulate network delay for demonstration
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: mockUsers.length,
          totalPages: 1,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: {
          code: "E500",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and email are required",
          error: {
            code: "E002",
            details: {
              required: ["name", "email"],
              received: { name: !!name, email: !!email },
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find((user) => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists",
          error: {
            code: "E202",
            details: {
              email,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      email,
      name,
      role: "USER",
      createdAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: newUser,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: {
          code: "E500",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
