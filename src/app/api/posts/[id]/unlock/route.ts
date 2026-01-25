// POST /api/posts/[id]/unlock
// Mark a post as unlocked for the current user (saves to discoveredPosts)

import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is logged in
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const userId = session.user.sub;
    const { id: postId } = await params;

    await connectDB();

    // Validate postId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Convert postId string to ObjectId for proper storage
    const postObjectId = new mongoose.Types.ObjectId(postId);

    console.log(`[Unlock] Attempting to add post ${postId} (ObjectId: ${postObjectId}) for user ${userId}`);

    // First, let's check the user's current discoveredPosts
    const userBefore = await User.findOne({ auth0Id: userId }).lean();
    console.log(`[Unlock] User BEFORE update (raw):`, JSON.stringify(userBefore, null, 2));
    console.log(`[Unlock] discoveredPosts type:`, Array.isArray(userBefore?.discoveredPosts) ? 'array' : typeof userBefore?.discoveredPosts);

    // Add post to user's discoveredPosts (using $addToSet to prevent duplicates)
    const result = await User.findOneAndUpdate(
      { auth0Id: userId },
      { $addToSet: { discoveredPosts: postObjectId } },
      { upsert: true, new: true }
    ).lean();

    console.log(`[Unlock] User ${userId} unlocked post ${postId}`);
    console.log(`[Unlock] User AFTER update (raw):`, JSON.stringify(result, null, 2));
    console.log(`[Unlock] User now has ${Array.isArray(result?.discoveredPosts) ? result?.discoveredPosts?.length : 'NOT AN ARRAY'} discovered posts`);

    return NextResponse.json({
      success: true,
      message: "Post unlocked and saved",
      discoveredCount: result?.discoveredPosts?.length || 0
    });
  } catch (error) {
    console.error("Error unlocking post:", error);
    return NextResponse.json(
      { error: "Failed to unlock post" },
      { status: 500 }
    );
  }
}

// GET /api/posts/[id]/unlock
// Check if the current user has unlocked this post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ hasUnlocked: false });
    }

    const userId = session.user.sub;
    const { id: postId } = await params;

    await connectDB();

    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ hasUnlocked: false });
    }

    const postObjectId = new mongoose.Types.ObjectId(postId);

    const user = await User.findOne({ 
      auth0Id: userId,
      discoveredPosts: postObjectId 
    });

    return NextResponse.json({
      hasUnlocked: !!user,
    });
  } catch (error) {
    console.error("Error checking unlock status:", error);
    return NextResponse.json({ hasUnlocked: false });
  }
}
