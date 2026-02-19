import { NextResponse } from "next/server";
import { Pool } from "pg";

/**
 * Database Health Check API
 *
 * Tests the connection to the cloud PostgreSQL database and returns
 * diagnostic information including server time, version, and SSL status.
 *
 * Endpoint: GET /api/db-health
 */

// Create a connection pool for raw queries
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
});

export async function GET() {
  const startTime = Date.now();

  try {
    // Test connection with multiple diagnostic queries
    const client = await pool.connect();

    try {
      // Get server timestamp
      const timeResult = await client.query("SELECT NOW() as server_time");

      // Get PostgreSQL version
      const versionResult = await client.query("SELECT version() as version");

      // Get current database name
      const dbResult = await client.query(
        "SELECT current_database() as database"
      );

      // Check SSL status
      const sslResult = await client.query("SHOW ssl");

      // Get connection info
      const connResult = await client.query(`
        SELECT 
          inet_server_addr() as server_ip,
          inet_server_port() as server_port,
          current_user as connected_user
      `);

      const responseTime = Date.now() - startTime;

      return NextResponse.json({
        status: "success",
        message: "Cloud PostgreSQL connection successful!",
        data: {
          serverTime: timeResult.rows[0].server_time,
          version: versionResult.rows[0].version,
          database: dbResult.rows[0].database,
          sslEnabled: sslResult.rows[0].ssl === "on",
          connection: {
            serverIp: connResult.rows[0].server_ip,
            serverPort: connResult.rows[0].server_port,
            connectedUser: connResult.rows[0].connected_user,
          },
          responseTimeMs: responseTime,
          provider: detectProvider(process.env.DATABASE_URL || ""),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    // eslint-disable-next-line no-console
    console.error("Database connection failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: {
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : String(error),
          hint: getErrorHint(error),
        },
        responseTimeMs: responseTime,
      },
      { status: 500 }
    );
  }
}

/**
 * Detect the cloud provider from the connection string
 */
function detectProvider(connectionString: string): string {
  if (connectionString.includes(".rds.amazonaws.com")) {
    return "AWS RDS";
  }
  if (connectionString.includes(".postgres.database.azure.com")) {
    return "Azure Database for PostgreSQL";
  }
  if (connectionString.includes("neon.tech")) {
    return "Neon";
  }
  if (connectionString.includes("supabase.co")) {
    return "Supabase";
  }
  if (
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1")
  ) {
    return "Local PostgreSQL";
  }
  return "Unknown Provider";
}

/**
 * Provide helpful hints for common connection errors
 */
function getErrorHint(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("ECONNREFUSED")) {
    return "Connection refused. Check if the database server is running and the endpoint is correct.";
  }
  if (message.includes("timeout")) {
    return "Connection timed out. Check your firewall/security group rules - your IP may not be whitelisted.";
  }
  if (message.includes("password authentication failed")) {
    return "Authentication failed. Verify your username and password. Check for special characters that may need URL encoding.";
  }
  if (message.includes("does not exist")) {
    return "Database does not exist. Create the database using psql or the cloud console.";
  }
  if (message.includes("SSL")) {
    return "SSL connection issue. Ensure your connection string includes '?sslmode=require'.";
  }
  if (message.includes("ENOTFOUND")) {
    return "Host not found. Verify the database endpoint URL is correct.";
  }

  return "Check your DATABASE_URL environment variable and network connectivity.";
}
