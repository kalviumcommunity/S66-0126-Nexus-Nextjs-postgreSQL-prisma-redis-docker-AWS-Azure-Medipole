import { NextRequest, NextResponse } from "next/server";
import { metrics } from "@/lib/metrics";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    // Update system metrics before returning
    metrics.updateSystemMetrics();

    if (format === "prometheus") {
      // Return Prometheus format
      const prometheusData = metrics.toPrometheus();
      return new NextResponse(prometheusData, {
        headers: {
          "Content-Type": "text/plain; version=0.0.4",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } else {
      // Return JSON format (default)
      const metricsData = metrics.getMetrics();

      return NextResponse.json({
        success: true,
        metrics: metricsData,
        timestamp: new Date().toISOString(),
        format: "json",
      });
    }
  } catch (error: any) {
    logger.error("Error fetching metrics", {
      error: {
        message: error.message,
        stack: error.stack,
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch metrics",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, metric, value, labels } = body;

    switch (action) {
      case "increment":
        if (metric && typeof value === "number") {
          metrics.collector.inc(metric, value, labels);
        }
        break;

      case "decrement":
        if (metric && typeof value === "number") {
          metrics.collector.dec(metric, value, labels);
        }
        break;

      case "set":
        if (metric && typeof value === "number") {
          metrics.collector.set(metric, value, labels);
        }
        break;

      case "observe":
        if (metric && typeof value === "number") {
          metrics.collector.observe(metric, value, labels);
        }
        break;

      case "reset":
        if (metric) {
          metrics.collector.resetMetric(metric, labels);
        } else {
          metrics.reset();
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      metric,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Error updating metrics", {
      error: {
        message: error.message,
        stack: error.stack,
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update metrics",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    // Reset all metrics
    metrics.reset();

    return NextResponse.json({
      success: true,
      message: "All metrics reset",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Error resetting metrics", {
      error: {
        message: error.message,
        stack: error.stack,
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset metrics",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
