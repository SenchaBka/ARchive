// GET /api/posts/list

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";

export async function GET() {
  try {
    await connectDB();

    const posts = await Post.find({ moderationStatus: "approved" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
