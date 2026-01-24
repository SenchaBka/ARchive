// POST /api/upload/audio

import { NextRequest, NextResponse } from "next/server";
import { uploadAudioFile } from "@/lib/services/upload-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!audioFile.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "File must be an audio file" },
        { status: 400 }
      );
    }

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 25MB limit" },
        { status: 400 }
      );
    }

    // Upload to cloud storage
    const audioUrl = await uploadAudioFile(audioFile);

    return NextResponse.json(
      {
        success: true,
        url: audioUrl,
        filename: audioFile.name,
        size: audioFile.size,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Audio upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload audio",
      },
      { status: 500 }
    );
  }
}
