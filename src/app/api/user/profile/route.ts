// GET /api/user/profile

import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Post } from "@/models/Post";

export async function GET() {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    // Get user from database
    const user = await User.findOne({ auth0Id: session.user.sub }).lean();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's created posts
    const createdPosts = await Post.find({ userId: session.user.sub })
      .sort({ createdAt: -1 })
      .lean();

    // Get discovered posts count
    const discoveredPostsCount = user.discoveredPosts?.length || 0;

    // Calculate stats
    const stats = {
      postsCreated: createdPosts.length,
      postsApproved: createdPosts.filter(p => p.moderationStatus === 'approved').length,
      postsPending: createdPosts.filter(p => p.moderationStatus === 'pending').length,
      postsRejected: createdPosts.filter(p => p.moderationStatus === 'rejected').length,
      postsDiscovered: discoveredPostsCount,
      totalLikes: createdPosts.reduce((sum, post) => sum + (post.likes || 0), 0),
      totalComments: createdPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0),
    };

    // Combine Auth0 user data with database user data
    const profileData = {
      auth0Id: session.user.sub,
      name: user.name || session.user.name,
      email: session.user.email,
      picture: user.profilePhoto || session.user.picture,
      nickname: session.user.nickname,
      createdAt: user.createdAt,
      stats,
      posts: createdPosts.map(post => ({
        id: post._id.toString(),
        title: post.title,
        approximateLocation: post.approximateLocation,
        likes: post.likes || 0,
        comments: post.comments?.length || 0,
        moderationStatus: post.moderationStatus,
        createdAt: post.createdAt,
      })),
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
