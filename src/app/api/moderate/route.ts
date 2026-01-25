// POST /api/moderate
// Content moderation endpoint using Gemini API
// Checks text and images for extreme content (nudity, violence, gore)
// Swear words and profanity are allowed

import { NextRequest, NextResponse } from "next/server";
import { moderateContent } from "@/lib/services/moderation-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, imageBase64, imageMimeType } = body;

    // Validate that we have something to moderate
    if (!text && !imageBase64) {
      return NextResponse.json(
        { error: "No content provided for moderation" },
        { status: 400 }
      );
    }

    // Run moderation
    console.log("[Moderate API] Starting moderation...");
    console.log("[Moderate API] Text length:", text?.length || 0);
    console.log("[Moderate API] Has image:", !!imageBase64);

    const result = await moderateContent(text, imageBase64, imageMimeType);

    console.log("[Moderate API] Result:", result);

    return NextResponse.json({
      allowed: result.allowed,
      reasons: result.reasons,
      flaggedContent: result.flaggedContent,
    });
  } catch (error) {
    console.error("[Moderate API] Error:", error);
    return NextResponse.json(
      { error: "Failed to moderate content" },
      { status: 500 }
    );
  }
}

