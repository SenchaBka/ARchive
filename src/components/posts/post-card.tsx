// Post preview card

"use client";

import Link from "next/link";
import { MapPin, Heart, MessageCircle, Clock, Eye, Lock, Volume2, Mic } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    approximateLocation?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    radius: number;
    likes: number;
    comments: { userId: string; text: string; createdAt: string }[];
    createdAt: string;
    hiddenMedia?: {
      type: "image" | "model" | "gif";
      url: string;
    };
    audioUrl?: string;
    ttsAudioUrl?: string;
  };
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const hasAudio = (post.audioUrl && post.audioUrl.trim() !== "") || 
                   (post.ttsAudioUrl && post.ttsAudioUrl.trim() !== "");
  const hasMedia = post.hiddenMedia && post.hiddenMedia.url;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{post.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {post.approximateLocation || `${post.coordinates.lat.toFixed(4)}, ${post.coordinates.lng.toFixed(4)}`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Hidden content indicators */}
        <div className="flex flex-wrap gap-2">
          {hasMedia && (
            <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Hidden media
            </span>
          )}
          {post.ttsAudioUrl && post.ttsAudioUrl.trim() !== "" && (
            <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground">
              <Volume2 className="h-3 w-3" />
              Description audio
            </span>
          )}
          {post.audioUrl && post.audioUrl.trim() !== "" && (
            <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground">
              <Mic className="h-3 w-3" />
              Audio attachment
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {post.comments.length}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formattedDate}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1 bg-secondary px-2 py-1 rounded-full text-xs">
            🎯 Unlock within {post.radius}m
          </span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Link href={`/posts/${post._id}`} className="w-full">
          <Button variant="outline" className="w-full gap-2">
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
