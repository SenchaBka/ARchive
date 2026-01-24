"use client";

// Posts list view

import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, RefreshCw, MapPin } from "lucide-react";
import Link from "next/link";

export default function PostsPage() {
  const { data: posts, isLoading, error, refetch } = usePosts();

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Explore Posts</h1>
          <p className="text-muted-foreground mt-1">
            Discover location-based content near you
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/posts/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Post
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
