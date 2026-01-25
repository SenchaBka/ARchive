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
} from "lucide-react";

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
  likedBy?: string[];  // Array of user IDs who liked this post
  comments: { userId: string; text: string; createdAt: string }[];
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

  const { latitude, longitude, error: locationError, isLoading: locationLoading, refresh: refreshLocation } = useLocation();

  // Fetch post data
  useEffect(() => {
    async function fetchPost() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error("Post not found");
        }
        const data = await response.json();
        setPost(data.post);
        setHasLiked(data.hasLiked || false);
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

  // Calculate if user is within range
  const isUnlocked = post && latitude !== null && longitude !== null
    ? isWithinRange(latitude, longitude, post.coordinates.lat, post.coordinates.lng, post.radius)
    : false;

  // Calculate distance to post
  const distanceToPost = post && latitude !== null && longitude !== null
    ? Math.round(haversineDistanceMeters(latitude, longitude, post.coordinates.lat, post.coordinates.lng))
    : null;

  // Handle like
  const handleLike = async () => {
    if (!post || !isUnlocked || latitude === null || longitude === null) return;

    setIsLiking(true);
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
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
              {post.approximateLocation || `${post.coordinates.lat.toFixed(4)}, ${post.coordinates.lng.toFixed(4)}`}
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
              title={hasLiked ? "Unlike this post" : isUnlocked ? "Like this post" : "Get closer to like this post"}
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
              <span className="font-medium">{post.likes} {post.likes === 1 ? "like" : "likes"}</span>
            </Button>
            <span className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{post.comments.length} comments</span>
            </span>
          </div>

          {/* Location Status */}
          <div className={`rounded-lg p-4 ${isUnlocked ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isUnlocked ? (
                  <Unlock className="h-6 w-6 text-green-600" />
                ) : (
                  <Lock className="h-6 w-6 text-orange-600" />
                )}
                <div>
                  <p className={`font-medium ${isUnlocked ? "text-green-800" : "text-orange-800"}`}>
                    {isUnlocked ? "Content Unlocked!" : "Content Locked"}
                  </p>
                  <p className={`text-sm ${isUnlocked ? "text-green-600" : "text-orange-600"}`}>
                    {locationLoading ? (
                      "Getting your location..."
                    ) : locationError ? (
                      locationError
                    ) : distanceToPost !== null ? (
                      isUnlocked
                        ? `You are ${distanceToPost}m away (within ${post.radius}m range)`
                        : `You are ${distanceToPost}m away (need to be within ${post.radius}m)`
                    ) : (
                      "Location unavailable"
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshLocation}
                disabled={locationLoading}
              >
                <RefreshCw className={`h-4 w-4 ${locationLoading ? "animate-spin" : ""}`} />
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
                    Get within {post.radius}m of this location to unlock the description and audio
                  </p>
                </div>
                <p className="text-muted-foreground select-none">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>

              {/* Navigation hint */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Navigation className="h-4 w-4" />
                <span>Travel to the location to unlock this content</span>
              </div>
            </div>
          )}

          {/* Unlocked Content */}
          {isUnlocked && (
            <div className="space-y-6">
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
            <h3 className="font-medium mb-4">Comments ({post.comments.length})</h3>
            {post.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {post.comments.map((comment, index) => (
                  <div key={index} className="bg-muted rounded-lg p-3">
                    <p className="text-sm">{comment.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
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
