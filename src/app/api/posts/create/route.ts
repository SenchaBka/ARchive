// POST /api/posts/create
// This endpoint creates a new post and saves it to MongoDB

import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { generateTts } from "@/lib/services/tts-service";

export async function POST(request: NextRequest) {
  try {
    // 1. Check if user is logged in
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a post" },
        { status: 401 }
      );
    }

    // 2. Get the user's Auth0 ID (this connects the post to the user)
    const userId = session.user.sub;

    // 3. Parse the request body
    const body = await request.json();
    const {
      title,
      description,
      latitude,
      longitude,
      address,
      radius,
      mediaUrl,
      mediaType,
      audioUrl,
      voiceId,
    } = body;

    // 4. Validate required fields
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Location coordinates are required" },
        { status: 400 }
      );
    }

    // 5. Connect to MongoDB
    await connectDB();

    // 6. Generate TTS from description if provided
    let ttsAudioUrl: string | null = null;
    if (description && description.trim() !== "") {
      try {
        // Use provided voiceId (null/undefined will use default from env)
        ttsAudioUrl = await generateTts(description, voiceId);
      } catch (ttsError) {
        // Log the error but don't fail the post creation
        console.error("[Post Create] TTS generation failed:", ttsError);
        // Continue without TTS audio
      }
    }

    // 7. Create the post document
    // Store both uploaded audio and TTS audio separately
    const newPost = new Post({
      userId: userId,
      title: title.trim(),
      hiddenText: description || "",
      hiddenMedia: mediaUrl ? {
        type: mediaType || "image",
        url: mediaUrl
      } : undefined,
      coordinates: {
        lat: latitude,
        lng: longitude
      },
      approximateLocation: address || "",
      radius: radius || 100,
      audioUrl: audioUrl || "",        // User-uploaded audio
      ttsAudioUrl: ttsAudioUrl || "",  // TTS-generated audio
      likes: 0,
      comments: [],
      moderationStatus: "approved" // Auto-approve for now
    });

    // 8. Save to MongoDB
    await newPost.save();

    // 9. Return success response
    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      post: newPost
    });

  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
