// Badges/achievements

"use client";

import { ProfileStats } from "@/hooks/use-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, MapPin, Heart, Sparkles } from "lucide-react";

interface AchievementsProps {
  stats: ProfileStats;
}

export function Achievements({ stats }: AchievementsProps) {
  const achievements = [
    {
      id: "first-post",
      name: "First Post",
      description: "Created your first post",
      icon: Star,
      unlocked: stats.postsCreated >= 1,
      color: "text-yellow-500",
    },
    {
      id: "explorer",
      name: "Explorer",
      description: "Discovered 5 posts",
      icon: MapPin,
      unlocked: stats.postsDiscovered >= 5,
      color: "text-blue-500",
    },
    {
      id: "creator",
      name: "Creator",
      description: "Created 10 posts",
      icon: Sparkles,
      unlocked: stats.postsCreated >= 10,
      color: "text-purple-500",
    },
    {
      id: "popular",
      name: "Popular",
      description: "Received 50 likes",
      icon: Heart,
      unlocked: stats.totalLikes >= 50,
      color: "text-pink-500",
    },
    {
      id: "master",
      name: "Master Storyteller",
      description: "Created 25 posts",
      icon: Trophy,
      unlocked: stats.postsCreated >= 25,
      color: "text-orange-500",
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements ({unlockedCount}/{achievements.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                  achievement.unlocked
                    ? "bg-card border-primary/20"
                    : "bg-muted/50 border-muted opacity-60"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    achievement.unlocked
                      ? `bg-primary/10 ${achievement.color}`
                      : "bg-muted"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      achievement.unlocked ? achievement.color : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div
                    className={`font-semibold ${
                      achievement.unlocked ? "" : "text-muted-foreground"
                    }`}
                  >
                    {achievement.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {achievement.description}
                  </div>
                </div>
                {achievement.unlocked && (
                  <div className="text-green-500">✓</div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

