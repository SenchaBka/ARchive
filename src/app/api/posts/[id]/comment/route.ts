// POST /api/posts/[id]/comment
// Add a comment to a post (frontend verifies user is within range)

import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is logged in
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to comment" },
        { status: 401 }
      );
    }

    const userId = session.user.sub;
    const userName = session.user.name || session.user.email || "Anonymous";
    const { id } = await params;
    const body = await request.json();
    const { text } = body;

    // Validate comment text
    if (!text || typeof text !== "string" || text.trim() === "") {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the post
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Create the new comment
    const newComment = {
      userId,
      userName,
      text: text.trim(),
      createdAt: new Date(),
    };

    // Add comment to post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $push: { comments: newComment } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      comment: newComment,
      comments: updatedPost?.comments || [],
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
