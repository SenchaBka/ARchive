// Stats (posts created, unlocked)

"use client";

import { ProfileStats } from "@/hooks/use-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MapPin, Heart, MessageCircle } from "lucide-react";

interface UserStatsProps {
  stats: ProfileStats;
}

export function UserStats({ stats }: UserStatsProps) {
  const statItems = [
    {
      label: "Posts Created",
      value: stats.postsCreated,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      label: "Discovered",
      value: stats.postsDiscovered,
      icon: MapPin,
      color: "text-purple-500",
    },
    {
      label: "Total Likes",
      value: stats.totalLikes,
      icon: Heart,
      color: "text-pink-500",
    },
    {
      label: "Total Comments",
      value: stats.totalComments,
      icon: MessageCircle,
      color: "text-cyan-500",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex flex-col items-center p-4 rounded-lg border bg-card"
              >
                <Icon className={`h-6 w-6 mb-2 ${item.color}`} />
                <div className="text-xl font-bold my-2">{item.value}</div>
                <div className="text-sm text-muted-foreground text-center">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
