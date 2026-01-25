"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, X, Search, Loader2 } from "lucide-react";
import { PostData } from "./types";

interface StepLocationProps {
  data: PostData;
  setData: React.Dispatch<React.SetStateAction<PostData>>;
}

export function StepLocation({ data, setData }: StepLocationProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

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

  // Geocode address to coordinates
  const handleGeocodeAddress = async () => {
    if (!data.address || data.address.trim() === "") return;

    setIsGeocoding(true);
    setGeocodeError(null);

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: data.address }),
      });

      const result = await response.json();

      if (!response.ok) {
        setGeocodeError(result.error || "Failed to find location");
        return;
      }

      setData({
        ...data,
        latitude: result.latitude,
        longitude: result.longitude,
        address: result.formattedAddress,
      });
    } catch (error) {
      setGeocodeError("Failed to geocode address");
    } finally {
      setIsGeocoding(false);
    }
  };

  // Set manual coordinates
  const handleSetManualCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      return;
    }

    if (lat < -90 || lat > 90) {
      return;
    }

    if (lng < -180 || lng > 180) {
      return;
    }

    setData({
      ...data,
      latitude: lat,
      longitude: lng,
    });
    setManualLat("");
    setManualLng("");
  };

  const clearLocation = () => {
    setData({ ...data, latitude: null, longitude: null, address: "" });
    setManualLat("");
    setManualLng("");
  };

  return (
    <div className="space-y-6">
      {/* Option 1: Current Location */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Use your current location</Label>
        <Button
          variant="outline"
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="w-full h-11 gap-2 border-border hover:bg-[#fafafa]"
        >
          <MapPin className="h-4 w-4" />
          {isLocating ? "Getting location..." : "Use Current Location"}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Option 2: Search by Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium">
          Search by address
        </Label>
        <div className="flex gap-2">
          <Input
            id="address"
            placeholder="123 Main St, City, Country"
            value={data.address}
            onChange={(e) => {
              setData({ ...data, address: e.target.value });
              setGeocodeError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleGeocodeAddress()}
            className="h-11 bg-[#fafafa] border-border focus:bg-white transition-colors"
          />
          <Button
            variant="outline"
            onClick={handleGeocodeAddress}
            disabled={isGeocoding || !data.address}
            className="h-11 px-4"
          >
            {isGeocoding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        {geocodeError && (
          <p className="text-sm text-red-500">{geocodeError}</p>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Option 3: Manual Coordinates */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Enter coordinates manually</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Latitude"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            type="number"
            step="any"
            min="-90"
            max="90"
            className="h-11 bg-[#fafafa] border-border focus:bg-white transition-colors"
          />
          <Input
            placeholder="Longitude"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            type="number"
            step="any"
            min="-180"
            max="180"
            className="h-11 bg-[#fafafa] border-border focus:bg-white transition-colors"
          />
          <Button
            variant="outline"
            onClick={handleSetManualCoordinates}
            disabled={!manualLat || !manualLng}
            className="h-11 px-4"
          >
            Set
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Latitude: -90 to 90, Longitude: -180 to 180
        </p>
      </div>

      {/* Selected Location Display */}
      {data.latitude && data.longitude && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-green-800 uppercase tracking-wide">
                ✓ Location Set
              </p>
              <p className="mt-1 font-mono text-sm text-green-700">
                {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
              </p>
              {data.address && (
                <p className="mt-1 text-sm text-green-600 truncate max-w-xs">
                  {data.address}
                </p>
              )}
            </div>
            <button
              onClick={clearLocation}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Unlock Radius */}
      <div className="space-y-3 pt-4 border-t">
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
