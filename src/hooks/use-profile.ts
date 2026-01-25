"use client";

import { useState, useEffect } from "react";

export interface ProfileStats {
  postsCreated: number;
  postsApproved: number;
  postsPending: number;
  postsRejected: number;
  postsDiscovered: number;
  totalLikes: number;
  totalComments: number;
}

export interface ProfilePost {
  id: string;
  title: string;
  approximateLocation?: string;
  likes: number;
  comments: number;
  moderationStatus: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface ProfileData {
  auth0Id: string;
  name: string;
  email?: string;
  picture?: string;
  nickname?: string;
  createdAt: string;
  stats: ProfileStats;
  posts: ProfilePost[];
}

export function useProfile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please log in to view your profile");
          }
          throw new Error("Failed to fetch profile");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const refetch = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch };
}

