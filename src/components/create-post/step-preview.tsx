"use client";

import { PostData } from "./types";

interface StepPreviewProps {
  data: PostData;
}

export function StepPreview({ data }: StepPreviewProps) {
  const items = [
    { label: "Title", value: data.title || "—" },
    { label: "Description", value: data.description || "—" },
    {
      label: "Location",
      value:
        data.latitude && data.longitude
          ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`
          : data.address || "—",
    },
    { label: "Unlock Radius", value: `${data.radius}m` },
    { label: "Media", value: data.media?.name || "None" },
    { label: "Audio", value: data.audio?.name || "None" },
  ];

  return (
    <div className="space-y-1">
      {items.map((item, index) => (
        <div
          key={item.label}
          className="flex items-start justify-between py-4"
          style={{
            borderBottom: index !== items.length - 1 
              ? "1px solid rgba(255,255,255,0.1)" 
              : "none"
          }}
        >
          <span 
            className="text-sm"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {item.label}
          </span>
          <span 
            className="text-sm font-medium text-right max-w-[60%] truncate"
            style={{ color: "#fafafa" }}
          >
            {item.value}
          </span>
        </div>
      ))}
      
      {/* Ready to publish message */}
      <div 
        className="mt-6 p-4 rounded-lg text-center"
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <p 
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Ready to publish your post?
        </p>
        <p 
          className="mt-1 text-xs"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Click "Publish Post" below to share your location-based content
        </p>
      </div>
    </div>
  );
}
