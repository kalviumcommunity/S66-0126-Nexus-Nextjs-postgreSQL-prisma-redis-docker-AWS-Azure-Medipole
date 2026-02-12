import { ZodError } from "zod";
import { NextResponse } from "next/server";

export function zodErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      success: false,
      message: "Validation Error",
      errors: error.errors.map((e) => ({ field: e.path[0] ?? null, message: e.message })),
    },
    { status: 400 }
  );
}
