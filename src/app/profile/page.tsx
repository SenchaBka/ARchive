"use client";

// User profile page

import { useProfile } from "@/hooks/use-profile";
import { useUser } from "@auth0/nextjs-auth0/client";
import { UserStats } from "@/components/profile/user-stats";
import { UserPosts } from "@/components/profile/user-posts";
import { Achievements } from "@/components/profile/achievements";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, User, Mail, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  const { data: profile, isLoading: profileLoading, error, refetch } = useProfile();

  if (auth0Loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!auth0User) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <User className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Not Logged In</h2>
          <p className="text-muted-foreground">
            Please log in to view your profile
          </p>
          <Link href="/auth/login">
            <Button>Log In</Button>
          </Link>
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

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground">No profile data available</p>
          <Button onClick={refetch} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const formattedJoinDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">Profile</h1>
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

        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                {profile.picture ? (
                  <Image
                    src={profile.picture}
                    alt={profile.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2363b3ed'/%3E%3Cpath d='M50 45c7.5 0 13.64-6.14 13.64-13.64S57.5 17.72 50 17.72s-13.64 6.14-13.64 13.64S42.5 45 50 45zm0 6.82c-9.09 0-27.28 4.56-27.28 13.64v3.41c0 1.88 1.53 3.41 3.41 3.41h47.74c1.88 0 3.41-1.53 3.41-3.41v-3.41c0-9.08-18.19-13.64-27.28-13.64z' fill='%23fff'/%3E%3C/svg%3E`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
                {profile.nickname && (
                  <p className="text-muted-foreground mb-4">@{profile.nickname}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm">
                  {profile.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined {formattedJoinDate}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <UserStats stats={profile.stats} />
      </div>

      {/* Achievements Section */}
      <div className="mb-8">
        <Achievements stats={profile.stats} />
      </div>

      {/* Posts Section */}
      <div className="mb-8">
        <UserPosts posts={profile.posts} />
      </div>
    </div>
  );
}