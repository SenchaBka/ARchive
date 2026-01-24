"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, X } from "lucide-react";
import { PostData } from "./types";

interface StepLocationProps {
  data: PostData;
  setData: React.Dispatch<React.SetStateAction<PostData>>;
}

export function StepLocation({ data, setData }: StepLocationProps) {
  const [isLocating, setIsLocating] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setData({
            ...data,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Location error:", error);
          setIsLocating(false);
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={getCurrentLocation}
        disabled={isLocating}
        className="w-full h-11 gap-2 border-border hover:bg-[#fafafa]"
      >
        <MapPin className="h-4 w-4" />
        {isLocating ? "Getting location..." : "Use Current Location"}
      </Button>

      {data.latitude && data.longitude && (
        <div className="rounded-lg bg-[#fafafa] p-4 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Coordinates
              </p>
              <p className="mt-1 font-mono text-sm">
                {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
              </p>
            </div>
            <button
              onClick={() => setData({ ...data, latitude: null, longitude: null })}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium">
          Enter an address
        </Label>
        <Input
          id="address"
          placeholder="123 Main St, City, Country"
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          className="h-11 bg-[#fafafa] border-border focus:bg-white transition-colors"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="radius" className="text-sm font-medium">
            Unlock Radius
          </Label>
          <span className="text-sm font-medium tabular-nums">{data.radius}m</span>
        </div>
        <div className="relative">
          <input
            id="radius"
            type="range"
            min={10}
            max={500}
            step={10}
            value={data.radius}
            onChange={(e) => setData({ ...data, radius: Number(e.target.value) })}
            className="slider-input w-full"
          />
          <div 
            className="pointer-events-none absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full bg-foreground"
            style={{ width: `${((data.radius - 10) / (500 - 10)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>10m</span>
          <span>500m</span>
        </div>
      </div>
    </div>
  );
}
