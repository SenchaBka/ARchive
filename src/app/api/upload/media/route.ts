// POST /api/upload/media
// This endpoint handles file uploads to AWS S3

import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { uploadFile } from "@/lib/services/upload-service";

export async function POST(request: NextRequest) {
  try {
    // 1. Check if user is logged in
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to upload files" },
        { status: 401 }
      );
    }

    // 2. Get the file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string || "media"; // "media" or "audio"

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 3. Determine upload folder based on type
    const folder = type === "audio" ? "audio" : "images";

    // 4. Upload to S3
    const result = await uploadFile(file, folder);

    // 5. Return the S3 URL
    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
