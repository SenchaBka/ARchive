"use client";

import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Heart, MessageCircle, Lock, Unlock, ExternalLink, Route } from "lucide-react";
import { Button } from "@/components/ui/button";

// Fix Leaflet default marker icon issue
const defaultIcon = L.icon({
  iconUrl: "/icons/marker-icon.png",
  iconRetinaUrl: "/icons/marker-icon-2x.png",
  shadowUrl: "/icons/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.icon({
  iconUrl: "/icons/user-marker.png",
  iconRetinaUrl: "/icons/user-marker-2x.png",
  shadowUrl: "/icons/marker-shadow.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
  shadowSize: [41, 41],
});

// Create custom colored markers
const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const unlockedIcon = createColoredIcon("#15803d"); // Dark green for unlocked
const lockedIcon = createColoredIcon("#a1a1a1"); // Light gray for locked

interface Post {
  _id: string;
  title: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  approximateLocation?: string;
  radius: number;
  likes: number;
  comments: { userId: string; text: string; createdAt: string }[];
  createdAt: string;
}

interface PostMapProps {
  posts: Post[];
  userLocation: { lat: number; lng: number } | null;
  onPostClick?: (postId: string) => void;
  className?: string;
}

// Component to handle map center updates
function MapController({
  center,
  userLocation,
}: {
  center: [number, number];
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15);
      initializedRef.current = true;
    }
  }, [map, userLocation]);

  return null;
}

// Component for locating user
function LocateButton({ userLocation }: { userLocation: { lat: number; lng: number } | null }) {
  const map = useMap();

  const handleLocate = () => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 16, {
        duration: 1,
      });
    }
  };

  return (
    <Button
      onClick={handleLocate}
      disabled={!userLocation}
      size="icon"
      className="absolute bottom-4 right-4 z-10 h-12 w-12 rounded-full shadow-lg bg-black/90 border border-white/20 hover:bg-black text-white"
      title="Go to my location"
    >
      <Navigation className="h-5 w-5" />
    </Button>
  );
}

// Calculate distance between two points
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function PostMap({
  posts,
  userLocation,
  onPostClick,
  className = "",
}: PostMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Default center (will be overridden by user location if available)
  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : posts.length > 0
    ? [posts[0].coordinates.lat, posts[0].coordinates.lng]
    : [45.5017, -73.5673]; // Montreal as fallback

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ minHeight: "400px" }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <MapPin className="h-8 w-8 animate-pulse" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        className="h-full w-full"
        style={{ minHeight: "400px" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={defaultCenter} userLocation={userLocation} />

        {/* User location marker */}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={20}
              pathOptions={{
                color: "#1d4ed8",
                fillColor: "#1d4ed8",
                fillOpacity: 0.3,
              }}
            />
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                className: "user-location-marker",
                html: `<div style="
                  background-color: #1d4ed8;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 0 0 2px #1d4ed8, 0 2px 5px rgba(0,0,0,0.3);
                "></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>
                <div className="text-center p-1">
                  <p className="font-bold text-white">You are here</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Post markers */}
        {posts.map((post) => {
          const distance = userLocation
            ? haversineDistance(
                userLocation.lat,
                userLocation.lng,
                post.coordinates.lat,
                post.coordinates.lng
              )
            : null;
          const isUnlocked = distance !== null && distance <= post.radius;

          return (
            <Marker
              key={post._id}
              position={[post.coordinates.lat, post.coordinates.lng]}
              icon={isUnlocked ? unlockedIcon : lockedIcon}
              eventHandlers={{
                click: () => onPostClick?.(post._id),
              }}
            >
              <Popup>
                <div className="min-w-[200px] max-w-[280px] font-bold">
                  <h3 className="font-bold text-base mb-2 line-clamp-2 text-white">
                    {post.title}
                  </h3>

                  {/* Status indicator */}
                  <div
                    className={`flex items-center gap-2 mb-2 text-sm font-bold ${
                      isUnlocked ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <Unlock className="h-4 w-4" />
                        <span>Unlocked!</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>
                          {distance !== null
                            ? `${Math.round(distance)}m away`
                            : "Location needed"}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Location */}
                  <p className="text-xs text-gray-300 mb-2 flex items-center gap-1 font-bold">
                    <MapPin className="h-3 w-3" />
                    {post.approximateLocation || `${post.coordinates.lat.toFixed(4)}, ${post.coordinates.lng.toFixed(4)}`}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-300 mb-3 font-bold">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post.comments.length}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <a 
                      href={`/posts/${post._id}`}
                      className="popup-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backgroundColor: '#fafafa',
                        color: '#0a0a0a',
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                    >
                      <ExternalLink style={{ width: '14px', height: '14px' }} />
                      Details
                    </a>
                    <button 
                      className="popup-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backgroundColor: '#fafafa',
                        color: '#0a0a0a',
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${post.coordinates.lat},${post.coordinates.lng}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <Route style={{ width: '14px', height: '14px' }} />
                      Directions
                    </button>
                  </div>
                </div>
              </Popup>

              {/* Radius circle */}
              <Circle
                center={[post.coordinates.lat, post.coordinates.lng]}
                radius={post.radius}
                pathOptions={{
                  color: isUnlocked ? "#15803d" : "#a1a1a1",
                  fillColor: isUnlocked ? "#15803d" : "#a1a1a1",
                  fillOpacity: 0.1,
                  weight: 2,
                  dashArray: isUnlocked ? undefined : "5, 5",
                }}
              />
            </Marker>
          );
        })}

        {/* Locate button */}
        <LocateButton userLocation={userLocation} />
      </MapContainer>
    </div>
  );
}
