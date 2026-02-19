import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(_request: NextRequest) {
  try {
    // Check Redis connection
    let redisHealthy = false;
    try {
      await redis.ping();
      redisHealthy = true;
    } catch (redisError) {
      console.warn("Redis health check failed:", redisError);
    }

    // Application health status
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "medipole-health",
      checks: {
        redis: redisHealthy ? "healthy" : "unhealthy",
        api: "healthy",
      },
      version: process.env.APP_VERSION || "1.0.0",
    };

    // Return health check result
    return NextResponse.json(healthStatus, {
      status: redisHealthy ? 200 : 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        service: "medipole-health",
        error: error.message,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
}

export async function POST(_request: NextRequest) {
  // Alternative health check endpoint for liveness probes
  return NextResponse.json({
    status: "alive",
    timestamp: new Date().toISOString(),
    service: "medipole-liveness",
  });
}
