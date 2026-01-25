// GET /api/posts/[id]

import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get current user (optional - for checking if they liked the post)
    const session = await auth0.getSession();
    const userId = session?.user?.sub;

    await connectDB();

    const post = await Post.findById(id).lean();

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if current user has liked this post
    const likedByArray = post.likedBy || [];
    const hasLiked = userId ? likedByArray.some((likedUserId: string) => likedUserId === userId) : false;

    return NextResponse.json({ 
      post,
      hasLiked,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
