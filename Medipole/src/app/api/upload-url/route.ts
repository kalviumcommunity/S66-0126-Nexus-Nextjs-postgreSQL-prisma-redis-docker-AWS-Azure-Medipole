import { NextRequest, NextResponse } from "next/server";
import {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
} from "@/lib/s3";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");
    const fileType = searchParams.get("fileType");
    const action = searchParams.get("action") || "upload";
    const expiresIn = parseInt(searchParams.get("expiresIn") || "60");

    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required" },
        { status: 400 }
      );
    }

    let url: string;

    if (action === "upload") {
      if (!fileType) {
        return NextResponse.json(
          { error: "fileType is required for upload" },
          { status: 400 }
        );
      }
      url = await generatePresignedUploadUrl(fileName, fileType, expiresIn);
    } else if (action === "download") {
      url = await generatePresignedDownloadUrl(fileName, expiresIn);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'upload' or 'download'" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url,
      fileName,
      action,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL", details: error.message },
      { status: 500 }
    );
  }
}
