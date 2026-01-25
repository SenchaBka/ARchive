// POST /api/posts/[id]/like
// Like or unlike a post (requires user to be within range)

import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { isWithinRange } from "@/lib/utils/distance";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is logged in
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to like a post" },
        { status: 401 }
      );
    }

    const userId = session.user.sub;
    const { id } = await params;
    const body = await request.json();
    const { latitude, longitude } = body;

    // Validate coordinates
    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Location coordinates are required" },
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

    // Check if user is within range
    const withinRange = isWithinRange(
      latitude,
      longitude,
      post.coordinates.lat,
      post.coordinates.lng,
      post.radius
    );

    if (!withinRange) {
      return NextResponse.json(
        { error: "You must be within range of the post to like it" },
        { status: 403 }
      );
    }

    // Check if user already liked this post (handle undefined likedBy)
    const likedByArray = post.likedBy || [];
    const alreadyLiked = likedByArray.some((likedUserId: string) => likedUserId === userId);

    console.log(`[Like] User ${userId} - Post ${id} - Already liked: ${alreadyLiked}`);
    console.log(`[Like] Current likedBy:`, likedByArray);

    let updatedPost;

    if (alreadyLiked) {
      // Unlike: Use $pull to remove user and decrement likes atomically
      updatedPost = await Post.findByIdAndUpdate(
        id,
        {
          $pull: { likedBy: userId },
          $inc: { likes: -1 }
        },
        { new: true }
      );
      console.log(`[Like] Unliked. New likes: ${updatedPost?.likes}`);
    } else {
      // Like: Use $addToSet to add user (prevents duplicates) and increment likes
      updatedPost = await Post.findByIdAndUpdate(
        id,
        {
          $addToSet: { likedBy: userId },
          $inc: { likes: 1 }
        },
        { new: true }
      );
      console.log(`[Like] Liked. New likes: ${updatedPost?.likes}`);
    }

    // Ensure likes is never negative
    if (updatedPost && updatedPost.likes < 0) {
      updatedPost.likes = 0;
      await updatedPost.save();
    }

    return NextResponse.json({
      success: true,
      likes: updatedPost?.likes || 0,
      liked: !alreadyLiked,  // Return new state
    });
  } catch (error) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      { error: "Failed to like post" },
      { status: 500 }
    );
  }
}
