"use client";

// Posts list view with map

import { useState } from "react";
import { usePosts } from "@/hooks/use-posts";
import { useLocation } from "@/hooks/use-location";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, RefreshCw, MapPin, Map, List } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues with Leaflet
const PostMap = dynamic(
  () => import("@/components/map/post-map").then((mod) => mod.PostMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-muted rounded-lg h-[60vh] min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading map...</p>
        </div>
      </div>
    ),
  }
);

type ViewMode = "map" | "list";

export default function PostsPage() {
  const { data: posts, discoveredPostIds, isLoading, error, refetch } = usePosts();
  const { latitude, longitude, isLoading: locationLoading } = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("map");

  const userLocation =
    latitude !== null && longitude !== null
      ? { lat: latitude, lng: longitude }
      : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={refetch} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Explore</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            {locationLoading
              ? "Getting your location..."
              : userLocation
              ? "Discover content near you"
              : "Enable location to see nearby posts"}
          </p>
        </div>
        <div className="flex gap-2">
          {/* View Toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <Button
              onClick={() => setViewMode("map")}
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              className="rounded-none gap-1.5"
            >
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-none gap-1.5"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
          <Button onClick={refetch} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/posts/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
          <p className="text-muted-foreground mb-4">
            Be the first to create a location-based post!
          </p>
          <Link href="/posts/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Post
            </Button>
          </Link>
        </div>
      ) : viewMode === "map" ? (
        /* Map View */
        <div className="h-[calc(100vh-200px)] min-h-[400px] max-h-[800px]">
          <PostMap
            posts={posts}
            userLocation={userLocation}
            discoveredPostIds={discoveredPostIds}
            className="h-full"
          />
        </div>
      ) : (
        /* List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
