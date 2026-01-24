// Tanstack Query: posts

import { useState, useEffect } from "react";

export interface PostData {
  _id: string;
  userId: string;
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
  likes: number;
  comments: {
    userId: string;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
  moderationStatus: "pending" | "approved" | "rejected";
}

export function usePosts() {
  const [data, setData] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/posts/list");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const result = await response.json();
        setData(result.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const refetch = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/posts/list");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const result = await response.json();
      setData(result.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch };
}
