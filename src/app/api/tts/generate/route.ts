// POST /api/tts/generate
// Generate TTS audio from text using ElevenLabs

import { NextRequest, NextResponse } from "next/server";
import { generateTts } from "@/lib/services/tts-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceId } = body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Text is required for TTS generation" },
        { status: 400 }
      );
    }

    // Limit text length to prevent abuse (ElevenLabs has limits)
    const maxLength = 500;
    if (text.length > maxLength) {
      return NextResponse.json(
        { error: `Text is too long. Maximum length is ${maxLength} characters` },
        { status: 400 }
      );
    }

    // Generate TTS and upload to S3
    const audioUrl = await generateTts(text, voiceId);

    return NextResponse.json({
      success: true,
      audioUrl,
    });
  } catch (error: any) {
    console.error("[TTS API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate TTS" },
      { status: 500 }
    );
  }
}