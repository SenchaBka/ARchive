"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageIcon, Upload, X } from "lucide-react";
import { PostData } from "./types";

interface StepMediaProps {
  data: PostData;
  setData: React.Dispatch<React.SetStateAction<PostData>>;
}

export function StepMedia({ data, setData }: StepMediaProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData({ ...data, media: file });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label 
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Upload Image or Video
          <span className="ml-1 font-normal" style={{ color: "rgba(255,255,255,0.4)" }}>(optional)</span>
        </Label>
        <div
          className="relative rounded-lg p-12 text-center transition-all duration-200 cursor-pointer group"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "2px dashed rgba(255,255,255,0.15)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          }}
        >
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="media-upload"
          />
          <div className="flex flex-col items-center gap-3">
            <div 
              className="flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              <Upload className="h-5 w-5" style={{ color: "rgba(255,255,255,0.6)" }} />
            </div>
            <div>
              <p 
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Drop files here or click to upload
              </p>
              <p 
                className="mt-1 text-xs"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                PNG, JPG, GIF, MP4 up to 50MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {data.media && (
        <div 
          className="flex items-center justify-between rounded-lg p-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
            >
              <ImageIcon className="h-4 w-4" style={{ color: "rgba(255,255,255,0.6)" }} />
            </div>
            <div>
              <p 
                className="text-sm font-medium truncate max-w-[200px]"
                style={{ color: "#fafafa" }}
              >
                {data.media.name}
              </p>
              <p 
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {(data.media.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={() => setData({ ...data, media: null })}
            className="p-2 rounded-lg transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#fafafa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
