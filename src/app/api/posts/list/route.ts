// GET /api/posts/list

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { auth0 } from "@/lib/auth0";

export async function GET() {
  try {
    await connectDB();

    const posts = await Post.find({ moderationStatus: "approved" })
      .sort({ createdAt: -1 })
      .lean();

    // Get user's discovered posts if logged in
    let discoveredPostIds: string[] = [];
    try {
      const session = await auth0.getSession();
      if (session?.user) {
        const user = await User.findOne({ auth0Id: session.user.sub }).lean();
        if (user?.discoveredPosts) {
          discoveredPostIds = user.discoveredPosts.map((id: any) => id.toString());
        }
      }
    } catch {
      // Ignore auth errors, just return posts without discovered info
    }

    return NextResponse.json({ 
      posts,
      discoveredPostIds 
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
