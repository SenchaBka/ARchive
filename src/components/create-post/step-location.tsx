"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
        <Label 
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Use your current location
        </Label>
        <button
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-all duration-200"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.9)",
            cursor: isLocating ? "not-allowed" : "pointer"
          }}
          onMouseEnter={(e) => {
            if (!isLocating) {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
          }}
        >
          <MapPin className="h-4 w-4" />
          {isLocating ? "Getting location..." : "Use Current Location"}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span 
            className="w-full"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span 
            className="px-2"
            style={{ backgroundColor: "transparent", color: "rgba(255,255,255,0.4)" }}
          >
            or
          </span>
        </div>
      </div>

      {/* Option 2: Search by Address */}
      <div className="space-y-2">
        <Label 
          htmlFor="address" 
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Search by address
        </Label>
        <div className="flex gap-2">
          <input
            id="address"
            placeholder="123 Main St, City, Country"
            value={data.address}
            onChange={(e) => {
              setData({ ...data, address: e.target.value });
              setGeocodeError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleGeocodeAddress()}
            className="flex-1 h-11 px-4 rounded-lg text-sm transition-all duration-200 outline-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fafafa"
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = "rgba(255,255,255,0.08)";
              e.target.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
              e.target.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          />
          <button
            onClick={handleGeocodeAddress}
            disabled={isGeocoding || !data.address}
            className="h-11 px-4 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: isGeocoding || !data.address ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)",
              cursor: isGeocoding || !data.address ? "not-allowed" : "pointer"
            }}
          >
            {isGeocoding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>
        </div>
        {geocodeError && (
          <p className="text-sm" style={{ color: "#f87171" }}>{geocodeError}</p>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span 
            className="w-full"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span 
            className="px-2"
            style={{ backgroundColor: "transparent", color: "rgba(255,255,255,0.4)" }}
          >
            or
          </span>
        </div>
      </div>

      {/* Option 3: Manual Coordinates */}
      <div className="space-y-2">
        <Label 
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Enter coordinates manually
        </Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            placeholder="Latitude"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            type="number"
            step="any"
            min="-90"
            max="90"
            className="w-full sm:flex-1 h-11 px-4 rounded-lg text-sm transition-all duration-200 outline-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fafafa"
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = "rgba(255,255,255,0.08)";
              e.target.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
              e.target.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          />
          <input
            placeholder="Longitude"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            type="number"
            step="any"
            min="-180"
            max="180"
            className="w-full sm:flex-1 h-11 px-4 rounded-lg text-sm transition-all duration-200 outline-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fafafa"
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = "rgba(255,255,255,0.08)";
              e.target.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = "rgba(255,255,255,0.05)";
              e.target.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          />
          <button
            onClick={handleSetManualCoordinates}
            disabled={!manualLat || !manualLng}
            className="w-full sm:w-auto h-11 px-4 rounded-lg font-medium text-sm transition-all duration-200"
            style={{
              backgroundColor: !manualLat || !manualLng ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: !manualLat || !manualLng ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)",
              cursor: !manualLat || !manualLng ? "not-allowed" : "pointer"
            }}
          >
            Set
          </button>
        </div>
        <p 
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Latitude: -90 to 90, Longitude: -180 to 180
        </p>
      </div>

      {/* Selected Location Display */}
      {data.latitude && data.longitude && (
        <div 
          className="rounded-lg p-4"
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)"
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p 
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "#4ade80" }}
              >
                ✓ Location Set
              </p>
              <p 
                className="mt-1 font-mono text-sm"
                style={{ color: "#86efac" }}
              >
                {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
              </p>
              {data.address && (
                <p 
                  className="mt-1 text-sm truncate max-w-xs"
                  style={{ color: "#4ade80" }}
                >
                  {data.address}
                </p>
              )}
            </div>
            <button
              onClick={clearLocation}
              className="transition-colors"
              style={{ color: "#4ade80" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#86efac"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#4ade80"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Unlock Radius */}
      <div 
        className="space-y-3 pt-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center justify-between">
          <Label 
            htmlFor="radius" 
            className="text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Unlock Radius
          </Label>
          <span 
            className="text-sm font-medium tabular-nums"
            style={{ color: "#fafafa" }}
          >
            {data.radius}m
          </span>
        </div>
        <div className="relative">
          <input
            id="radius"
            type="range"
            min={10}
            max={50}
            step={5}
            value={data.radius}
            onChange={(e) => setData({ ...data, radius: Number(e.target.value) })}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              accentColor: "#fafafa"
            }}
          />
        </div>
        <div 
          className="flex justify-between text-xs"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <span>10m</span>
          <span>50m</span>
        </div>
      </div>
    </div>
  );
}
