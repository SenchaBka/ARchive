// POST /api/upload/media
// This endpoint handles file uploads and saves them to the public folder
// In production, you'd use cloud storage (AWS S3, Cloudinary, etc.)

import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    // 3. Create unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${originalName}`;

    // 4. Determine upload folder based on type
    const folder = type === "audio" ? "audio" : "images";
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

    // 5. Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // 6. Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    
    await writeFile(filePath, buffer);

    // 7. Return the public URL
    const url = `/uploads/${folder}/${filename}`;

    return NextResponse.json({
      success: true,
      url: url,
      filename: filename
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
