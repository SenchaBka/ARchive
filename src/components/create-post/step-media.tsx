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
        <Label className="text-sm font-medium">
          Upload Image or Video
          <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div
          className="relative rounded-lg border-2 border-dashed border-border 
          bg-[#fafafa] p-12 text-center transition-colors
          hover:border-muted-foreground/50 hover:bg-[#f5f5f5]"
        >
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="media-upload"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-border">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop files here or click to upload
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, GIF, MP4 up to 50MB
              </p>
            </div>
          </div>
        </div>
      </div>

      {data.media && (
        <div className="flex items-center justify-between rounded-lg bg-[#fafafa] p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-border">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">
                {data.media.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(data.media.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setData({ ...data, media: null })}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
