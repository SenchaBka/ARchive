// Post detail page with location-based unlock

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocation } from "@/hooks/use-location";
import { isWithinRange, haversineDistanceMeters } from "@/lib/utils/distance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioPlayer } from "@/components/ui/audio-player";
import {
  MapPin,
  Heart,
  MessageCircle,
  Clock,
  Lock,
  Unlock,
  Volume2,
  Mic,
  ArrowLeft,
  Loader2,
  Navigation,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { openARExperience } from "@/context/ar-experience-context";

interface Post {
  _id: string;
  title: string;
  hiddenText?: string;
  hiddenMedia?: {
    type: "image" | "model" | "gif";
    url: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  approximateLocation?: string;
  radius: number;
  audioUrl?: string;
  ttsAudioUrl?: string;
  likes: number;
  likedBy?: string[]; // Array of user IDs who liked this post
  comments: {
    userId: string;
    userName?: string;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [hasPreviouslyUnlocked, setHasPreviouslyUnlocked] = useState(false);

  const {
    latitude,
    longitude,
    error: locationError,
    isLoading: locationLoading,
    refresh: refreshLocation,
  } = useLocation();

  // Fetch post data and check if previously unlocked
  useEffect(() => {
    async function fetchPost() {
      try {
        setIsLoading(true);
        const [postResponse, unlockResponse] = await Promise.all([
          fetch(`/api/posts/${postId}`),
          fetch(`/api/posts/${postId}/unlock`),
        ]);

        if (!postResponse.ok) {
          throw new Error("Post not found");
        }
        const data = await postResponse.json();
        setPost(data.post);
        setHasLiked(data.hasLiked || false);

        // Check if previously unlocked
        if (unlockResponse.ok) {
          const unlockData = await unlockResponse.json();
          setHasPreviouslyUnlocked(unlockData.hasUnlocked || false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setIsLoading(false);
      }
    }

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Calculate if user is currently within range
  const isCurrentlyInRange =
    post && latitude !== null && longitude !== null
      ? isWithinRange(
          latitude,
          longitude,
          post.coordinates.lat,
          post.coordinates.lng,
          post.radius,
        )
      : false;

  // User has access if they're in range OR have previously unlocked
  const isUnlocked = isCurrentlyInRange || hasPreviouslyUnlocked;

  // Save unlock when user enters range for the first time
  useEffect(() => {
    async function saveUnlock() {
      console.log(
        `[Unlock Check] postId: ${postId}, isCurrentlyInRange: ${isCurrentlyInRange}, hasPreviouslyUnlocked: ${hasPreviouslyUnlocked}, post: ${!!post}`,
      );
      if (isCurrentlyInRange && !hasPreviouslyUnlocked && post) {
        try {
          console.log(`[Unlock] Saving unlock for post ${postId}`);
          const response = await fetch(`/api/posts/${postId}/unlock`, {
            method: "POST",
          });
          const data = await response.json();
          console.log(`[Unlock] Response:`, data);
          if (response.ok) {
            setHasPreviouslyUnlocked(true);
          }
        } catch (err) {
          console.error("Failed to save unlock:", err);
        }
      }
    }
    saveUnlock();
  }, [isCurrentlyInRange, hasPreviouslyUnlocked, post, postId]);

  // Calculate distance to post
  const distanceToPost =
    post && latitude !== null && longitude !== null
      ? Math.round(
          haversineDistanceMeters(
            latitude,
            longitude,
            post.coordinates.lat,
            post.coordinates.lng,
          ),
        )
      : null;

  // Handle like
  const handleLike = async () => {
    if (!post || !isUnlocked) return;

    setIsLiking(true);
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        setPost({ ...post, likes: data.likes });
        setHasLiked(data.liked);
      } else {
        console.error("Failed to like:", data.error);
      }
    } catch (err) {
      console.error("Error liking post:", err);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle comment
  const handleComment = async () => {
    if (!post || !isUnlocked || !commentText.trim()) return;

    setIsCommenting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setPost({ ...post, comments: data.comments });
        setCommentText("");
      } else {
        console.error("Failed to comment:", data.error);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsCommenting(false);
    }
  };

  const formattedDate = post
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-destructive">{error || "Post not found"}</p>
          <Button onClick={() => router.push("/posts")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Posts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 max-w-2xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/posts")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Posts
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {post.approximateLocation ||
                `${post.coordinates.lat.toFixed(4)}, ${post.coordinates.lng.toFixed(4)}`}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formattedDate}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats - Always visible */}
          <div className="flex items-center gap-6 text-sm">
            <Button
              variant={isUnlocked ? "outline" : "ghost"}
              size="sm"
              className={`flex items-center gap-2 ${
                hasLiked
                  ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  : isUnlocked
                    ? "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    : "cursor-not-allowed opacity-50"
              }`}
              onClick={handleLike}
              disabled={!isUnlocked || isLiking}
              title={
                hasLiked
                  ? "Unlike this post"
                  : isUnlocked
                    ? "Like this post"
                    : "Get closer to like this post"
              }
            >
              <Heart
                className={`h-5 w-5 ${isLiking ? "animate-pulse" : ""} ${
                  hasLiked
                    ? "fill-red-500 text-red-500"
                    : isUnlocked
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              />
              <span className="font-medium">
                {post.likes} {post.likes === 1 ? "like" : "likes"}
              </span>
            </Button>
            <span className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <span className="font-medium">
                {post.comments.length} comments
              </span>
            <span className={`flex items-center gap-2 ${!isUnlocked ? "opacity-50" : ""}`}>
              <MessageCircle className={`h-5 w-5 ${isUnlocked ? "text-blue-500" : "text-muted-foreground"}`} />
              <span className="font-medium">{post.comments.length} comments</span>
            </span>
          </div>

          {/* Location Status */}
          <div
            className={`rounded-lg p-3 sm:p-4 ${isUnlocked ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}
          >
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {isUnlocked ? (
                  <Unlock className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 shrink-0 mt-0.5 sm:mt-0" />
                ) : (
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400 shrink-0 mt-0.5 sm:mt-0" />
                )}
                <div className="min-w-0">
                  <p
                    className={`font-medium text-sm sm:text-base ${isUnlocked ? "text-green-800" : "text-orange-800"}`}
                  >
                    {isUnlocked ? "Content Unlocked!" : "Content Locked"}
                  </p>
                  <p
                    className={`text-xs sm:text-sm ${isUnlocked ? "text-green-600" : "text-orange-600"}`}
                  >
                    {locationLoading
                      ? "Getting your location..."
                      : locationError
                        ? locationError
                        : distanceToPost !== null
                          ? isUnlocked
                            ? `${distanceToPost}m away (within ${post.radius}m)`
                            : `${distanceToPost}m away (need ≤${post.radius}m)`
                          : "Location unavailable"}
                  </p>
                  {!isUnlocked && (
                    <p className="text-xs text-zinc-600 mt-1">
                      🎯 Unlock within {post.radius}m
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={refreshLocation}
                disabled={locationLoading}
                className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-white"
              >
                <RefreshCw
                  className={`h-4 w-4 ${locationLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Locked Content Placeholder */}
          {!isUnlocked && (
            <div className="space-y-4">
              {/* Blurred/Locked Description */}
              <div className="relative rounded-lg bg-muted p-6 overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-md bg-background/80 flex flex-col items-center justify-center z-10">
                  <Lock className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center px-4">
                    Get within {post.radius}m of this location to unlock the
                    description and audio
                  </p>
                </div>
                <p className="text-muted-foreground select-none">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </div>
          )}

          {/* Unlocked Content */}
          {isUnlocked && (
            <div className="space-y-6">
              {/* Enter AR - only when post has image or text */}
              {(post.hiddenMedia?.type === "image" && post.hiddenMedia?.url) ||
              post.hiddenText ? (
                <Button
                  onClick={() =>
                    openARExperience(
                      post.hiddenMedia?.type === "image"
                        ? `/api/posts/${postId}/media`
                        : "",
                      post.hiddenText ?? "",
                      { lat: post.coordinates.lat, lng: post.coordinates.lng },
                    )
                  }
                  className="w-full bg-gradient-to-r from-cyan-500/90 to-blue-500/90 hover:from-cyan-500 hover:to-blue-500 text-white border-0"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Experience in AR
                </Button>
              ) : null}

              {/* Description */}
              {post.hiddenText && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {post.hiddenText}
                  </p>
                </div>
              )}

              {/* Media */}
              {post.hiddenMedia && post.hiddenMedia.url && (
                <div>
                  <h3 className="font-medium mb-2">Media</h3>
                  {post.hiddenMedia.type === "image" && (
                    <img
                      src={post.hiddenMedia.url}
                      alt={post.title}
                      className="w-full rounded-lg"
                    />
                  )}
                </div>
              )}

              {/* TTS Audio - Description */}
              {post.ttsAudioUrl && post.ttsAudioUrl.trim() !== "" && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Listen to description</span>
                  </div>
                  <AudioPlayer src={post.ttsAudioUrl} />
                </div>
              )}

              {/* Uploaded Audio */}
              {post.audioUrl && post.audioUrl.trim() !== "" && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Audio attachment</span>
                  </div>
                  <AudioPlayer src={post.audioUrl} />
                </div>
              )}
            </div>
          )}

          {/* Comments Section - Always visible */}
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-4">
              Comments ({post.comments.length})
            </h3>

            {/* Add Comment Form - Only when unlocked */}
            {isUnlocked ? (
              <div className="mb-4 space-y-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={3}
                  disabled={isCommenting}
                />
                <Button
                  onClick={handleComment}
                  disabled={isCommenting || !commentText.trim()}
                  className="w-full sm:w-auto"
                >
                  {isCommenting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-muted rounded-lg flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Get closer to this location to add a comment</span>
              </div>
            )}

            {post.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-3">
                {post.comments.map((comment, index) => (
                  <div key={index} className="bg-muted rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">
                        {comment.userName || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
