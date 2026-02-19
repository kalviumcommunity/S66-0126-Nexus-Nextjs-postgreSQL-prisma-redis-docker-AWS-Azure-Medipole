import { NextRequest, NextResponse } from "next/server";
import { getSecrets, getSecretValue } from "@/lib/secrets";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      // Get specific secret
      const value = await getSecretValue(key);
      return NextResponse.json({
        success: true,
        key,
        value: value ? "[REDACTED]" : null,
        retrievedAt: new Date().toISOString(),
      });
    } else {
      // Get all secrets
      const secrets = await getSecrets();

      // Return keys only (values are sensitive)
      const secretKeys = Object.keys(secrets);

      return NextResponse.json({
        success: true,
        provider: process.env.SECRET_ARN
          ? "AWS Secrets Manager"
          : process.env.KEYVAULT_NAME
            ? "Azure Key Vault"
            : "Environment Variables",
        secretKeys,
        count: secretKeys.length,
        retrievedAt: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error("Secret retrieval error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testKeys } = body;

    if (!testKeys || !Array.isArray(testKeys)) {
      return NextResponse.json(
        { error: "testKeys array is required" },
        { status: 400 }
      );
    }

    const results: Record<string, any> = {};

    for (const key of testKeys) {
      try {
        const value = await getSecretValue(key);
        results[key] = {
          found: !!value,
          length: value ? value.length : 0,
          sample: value ? `${value.substring(0, 10)}...` : null,
        };
      } catch (error: any) {
        results[key] = {
          found: false,
          error: error.message,
        };
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Secret test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
