// Post preview card

"use client";

import Link from "next/link";
import { MapPin, Heart, MessageCircle, Clock, Eye, Camera, Volume2, Mic, Navigation } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance for display
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

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
  userLocation?: { lat: number; lng: number } | null;
}

export function PostCard({ post, userLocation }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const hasAudio = (post.audioUrl && post.audioUrl.trim() !== "") || 
                   (post.ttsAudioUrl && post.ttsAudioUrl.trim() !== "");
  const hasMedia = post.hiddenMedia && post.hiddenMedia.url;

  // Calculate distance if user location is available
  const distance = userLocation
    ? calculateDistance(
        userLocation.lat,
        userLocation.lng,
        post.coordinates.lat,
        post.coordinates.lng
      )
    : null;
  
  const isInRange = distance !== null && distance <= post.radius;

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
      <CardHeader className="overflow-hidden">
        <CardTitle className="text-lg flex items-center justify-between gap-2">
          <span className="truncate">{post.title}</span>
          {distance !== null && (
            <span className="flex items-center gap-1 text-sm font-medium flex-shrink-0 whitespace-nowrap text-muted-foreground">
              <Navigation className="h-3 w-3" />
              {formatDistance(distance)}
            </span>
          )}
        </CardTitle>
        <CardDescription className="flex items-center gap-1 overflow-hidden w-full">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">
            {post.approximateLocation || `${post.coordinates.lat.toFixed(4)}, ${post.coordinates.lng.toFixed(4)}`}
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1 flex flex-col">
        {/* Hidden content indicators */}
        <div className="flex flex-wrap gap-2 flex-1">
          {hasMedia && (
            <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground h-fit">
              <Camera className="h-3 w-3" />
              Photos
            </span>
          )}
          {post.ttsAudioUrl && post.ttsAudioUrl.trim() !== "" && (
            <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground h-fit">
              <Volume2 className="h-3 w-3" />
              AI Narration
            </span>
          )}
          {post.audioUrl && post.audioUrl.trim() !== "" && (
            <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs text-muted-foreground h-fit">
              <Mic className="h-3 w-3" />
              Creator Audio
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
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
