// GET /api/posts/[id]/media
// Proxy post media (images and 3D models) for AR experience. Requires auth + unlock.
// Avoids 401/CORS when iframe fetches same-origin with credentials.

import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import mongoose from "mongoose";

const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME || "";

function isAllowedMediaUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    // Allow our S3 bucket only (avoid SSRF)
    if (!S3_BUCKET) return false;
    if (u.hostname === `${S3_BUCKET}.s3.amazonaws.com`) return true;
    const regionMatch = u.hostname.match(/^([a-z0-9-]+)\.s3\.([a-z0-9-]+)\.amazonaws\.com$/);
    if (regionMatch && regionMatch[1] === S3_BUCKET) return true;
    if (u.hostname.endsWith(".amazonaws.com") && u.pathname.startsWith(`/${S3_BUCKET}/`))
      return true;
    return false;
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: postId } = await params;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    await connectDB();

    const post = await Post.findById(postId).lean();
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const mediaType = post.hiddenMedia?.type;
    if (!post.hiddenMedia?.url || (mediaType !== "image" && mediaType !== "model")) {
      return NextResponse.json({ error: "No supported media" }, { status: 404 });
    }

    const mediaUrl = post.hiddenMedia.url;
    if (!isAllowedMediaUrl(mediaUrl)) {
      return NextResponse.json({ error: "Invalid media URL" }, { status: 400 });
    }

    // Require unlock: user must have discovered this post
    const postObjectId = new mongoose.Types.ObjectId(postId);
    const user = await User.findOne({
      auth0Id: session.user.sub,
      discoveredPosts: postObjectId,
    });
    if (!user) {
      return NextResponse.json(
        { error: "Post not unlocked; get closer to unlock" },
        { status: 403 }
      );
    }

    const res = await fetch(mediaUrl, {
      headers: { "User-Agent": "ARchive-Media-Proxy/1.0" },
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch media" },
        { status: 502 }
      );
    }

    const blob = await res.blob();
    
    // Determine content type - use response header or derive from media type/URL
    let contentType = res.headers.get("content-type");
    if (!contentType || contentType === "application/octet-stream") {
      // Fallback based on file extension or media type
      const url = post.hiddenMedia.url.toLowerCase();
      if (mediaType === "model" || url.endsWith(".glb")) {
        contentType = "model/gltf-binary";
      } else if (url.endsWith(".gltf")) {
        contentType = "model/gltf+json";
      } else {
        contentType = "image/jpeg";
      }
    }

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (e) {
    console.error("[media] Error proxying post media:", e);
    return NextResponse.json(
      { error: "Failed to load media" },
      { status: 500 }
    );
  }
}
